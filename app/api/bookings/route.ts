import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { getSlotRange, isBookingSlotValue, normalizeEventDate } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

type BookingRequestBody = {
  hallId?: unknown;
  eventDate?: unknown;
  slot?: unknown;
  guestCount?: unknown;
  totalPrice?: unknown;
  packageName?: unknown;
  addOns?: unknown;
  contactName?: unknown;
  contactEmail?: unknown;
  contactPhone?: unknown;
  specialNotes?: unknown;
  paymentMethod?: unknown;
  paymentReference?: unknown;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as BookingRequestBody;
  const hallId = typeof body.hallId === "string" ? body.hallId : "";
  const rawEventDate = typeof body.eventDate === "string" ? body.eventDate : "";
  const slot = body.slot;
  const guestCount = typeof body.guestCount === "number" ? Math.floor(body.guestCount) : 0;
  const totalPrice = typeof body.totalPrice === "number" ? body.totalPrice : NaN;
  const packageName = typeof body.packageName === "string" ? body.packageName : "";
  const addOns = Array.isArray(body.addOns)
    ? body.addOns.filter((value): value is string => typeof value === "string")
    : [];
  const contactName = typeof body.contactName === "string" ? body.contactName.trim() : "";
  const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim() : "";
  const contactPhone = typeof body.contactPhone === "string" ? body.contactPhone.trim() : "";
  const specialNotes = typeof body.specialNotes === "string" ? body.specialNotes.trim() : "";
  const paymentMethod = typeof body.paymentMethod === "string" && body.paymentMethod.trim()
    ? body.paymentMethod.trim()
    : "CARD";
  const paymentReference = typeof body.paymentReference === "string" ? body.paymentReference.trim() : "";

  if (!hallId || !rawEventDate || !isBookingSlotValue(slot) || guestCount < 1 || !Number.isFinite(totalPrice) || totalPrice <= 0 || !packageName) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!contactName || !contactEmail || !contactPhone) {
    return NextResponse.json({ error: "Please provide your contact details" }, { status: 400 });
  }

  const eventDate = normalizeEventDate(rawEventDate);

  if (!eventDate) {
    return NextResponse.json({ error: "Invalid event date" }, { status: 400 });
  }

  const now = new Date();

  try {
    const bookingResult = await prisma.$transaction(async (tx) => {
      await tx.bookingLock.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      const activeLock = await tx.bookingLock.findUnique({
        where: {
          hallId_eventDate_slot: {
            hallId,
            eventDate,
            slot,
          },
        },
      });

      if (!activeLock || activeLock.customerId !== session.user.id || activeLock.expiresAt <= now) {
        throw new Error("MISSING_LOCK");
      }

      const conflictingBooking = await tx.booking.findFirst({
        where: {
          hallId,
          eventDate,
          slot,
          status: {
            in: ["PENDING_CONFIRMATION", "ADVANCE_PAID", "CONFIRMED"],
          },
        },
        select: {
          id: true,
        },
      });

      if (conflictingBooking) {
        throw new Error("BOOKED_SLOT");
      }

      const { startTime, endTime } = getSlotRange(eventDate, slot);

      const createdBooking = await tx.booking.create({
        data: {
          customerId: session.user.id,
          hallId,
          eventDate,
          slot,
          status: "PENDING_CONFIRMATION",
          startTime,
          endTime,
          guestCount,
          totalPrice,
          packageName,
          addOns,
          contactName,
          contactEmail,
          contactPhone,
          specialNotes: specialNotes || null,
        },
        select: {
          id: true,
          status: true,
          totalPrice: true,
          eventDate: true,
          slot: true,
          hall: {
            select: {
              name: true,
            },
          },
        },
      });

      const initialInstallmentAmount = Number((totalPrice * 0.25).toFixed(2));

      const createdTransaction = await tx.transaction.create({
        data: {
          bookingId: createdBooking.id,
          customerId: session.user.id,
          amount: initialInstallmentAmount,
          status: "SUCCESS",
          transactionType: "INITIAL_INSTALLMENT",
          paymentMethod,
          paymentReference: paymentReference || `SIM-${Date.now()}`,
          paidAt: new Date(),
        },
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
          paymentReference: true,
          paidAt: true,
          transactionType: true,
          status: true,
        },
      });

      await tx.bookingLock.delete({
        where: {
          id: activeLock.id,
        },
      });

      return {
        booking: createdBooking,
        transaction: createdTransaction,
      };
    });

    return NextResponse.json({
      bookingId: bookingResult.booking.id,
      status: bookingResult.booking.status,
      transaction: {
        id: bookingResult.transaction.id,
        amount: Number(bookingResult.transaction.amount.toString()),
        status: bookingResult.transaction.status,
        paymentMethod: bookingResult.transaction.paymentMethod,
        paymentReference: bookingResult.transaction.paymentReference,
        paidAt: bookingResult.transaction.paidAt?.toISOString() ?? null,
        transactionType: bookingResult.transaction.transactionType,
      },
      invoice: {
        hallName: bookingResult.booking.hall.name,
        bookingId: bookingResult.booking.id,
        eventDate: bookingResult.booking.eventDate.toISOString(),
        slot: bookingResult.booking.slot,
        customerName: contactName,
        customerEmail: contactEmail,
        customerPhone: contactPhone,
        packageName,
        addOns,
        totalPrice,
        initialInstallmentAmount: Number(bookingResult.transaction.amount.toString()),
        remainingAmount: Number((totalPrice - Number(bookingResult.transaction.amount.toString())).toFixed(2)),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_LOCK") {
      return NextResponse.json(
        { error: "Your lock expired. Please select date and slot again." },
        { status: 409 },
      );
    }

    if (error instanceof Error && error.message === "BOOKED_SLOT") {
      return NextResponse.json(
        { error: "This date and slot has just been booked. Please pick another." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Booking could not be created", message: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
  }
}
