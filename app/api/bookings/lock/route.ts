import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { isBookingSlotValue, getLockExpiration, normalizeEventDate } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

type LockRequestBody = {
  hallId?: unknown;
  eventDate?: unknown;
  slot?: unknown;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as LockRequestBody;
  const hallId = typeof body.hallId === "string" ? body.hallId : "";
  const rawEventDate = typeof body.eventDate === "string" ? body.eventDate : "";
  const slot = body.slot;

  if (!hallId || !rawEventDate || !isBookingSlotValue(slot)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventDate = normalizeEventDate(rawEventDate);

  if (!eventDate) {
    return NextResponse.json({ error: "Invalid event date" }, { status: 400 });
  }

  const now = new Date();
  const expiresAt = getLockExpiration(now);

  try {
    const lock = await prisma.$transaction(async (tx) => {
      await tx.bookingLock.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      const conflictingBooking = await tx.booking.findFirst({
        where: {
          hallId,
          eventDate,
          slot,
          status: {
            in: ["PENDING_CONFIRMATION", "CONFIRMED"],
          },
        },
        select: {
          id: true,
        },
      });

      if (conflictingBooking) {
        throw new Error("BOOKED_SLOT");
      }

      const existingLock = await tx.bookingLock.findUnique({
        where: {
          hallId_eventDate_slot: {
            hallId,
            eventDate,
            slot,
          },
        },
      });

      if (existingLock && existingLock.customerId !== session.user.id && existingLock.expiresAt > now) {
        throw new Error("LOCKED_SLOT");
      }

      if (existingLock) {
        return tx.bookingLock.update({
          where: {
            id: existingLock.id,
          },
          data: {
            customerId: session.user.id,
            expiresAt,
          },
          select: {
            id: true,
            expiresAt: true,
          },
        });
      }

      return tx.bookingLock.create({
        data: {
          customerId: session.user.id,
          hallId,
          eventDate,
          slot,
          expiresAt,
        },
        select: {
          id: true,
          expiresAt: true,
        },
      });
    });

    return NextResponse.json({ lockId: lock.id, expiresAt: lock.expiresAt.toISOString() });
  } catch (error) {
    if (error instanceof Error && (error.message === "BOOKED_SLOT" || error.message === "LOCKED_SLOT")) {
      return NextResponse.json(
        { error: "This date and slot is no longer available. Please choose another one." },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Could not lock slot" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { lockId?: unknown };
  const lockId = typeof body.lockId === "string" ? body.lockId : "";

  if (!lockId) {
    return NextResponse.json({ error: "Invalid lock id" }, { status: 400 });
  }

  await prisma.bookingLock.deleteMany({
    where: {
      id: lockId,
      customerId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
