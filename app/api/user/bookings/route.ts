import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        customerId: session.user.id,
      },
      select: {
        id: true,
        hallId: true,
        eventDate: true,
        slot: true,
        guestCount: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        packageName: true,
        specialNotes: true,
        addOns: true,
        startTime: true,
        endTime: true,
        hall: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            imageUrls: true,
            ownerId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform bookings to include formatted data for frontend
    const transformedBookings = bookings.map((booking) => ({
      id: booking.id,
      hallId: booking.hallId,
      hallName: booking.hall.name,
      hallAddress: booking.hall.address,
      hallCity: booking.hall.city,
      hallImage: booking.hall.imageUrls?.[0] || null,
      eventDate: booking.eventDate.toISOString().split("T")[0],
      eventDateFull: booking.eventDate.toISOString(),
      slot: booking.slot,
      guestCount: booking.guestCount,
      totalPrice: booking.totalPrice.toString(),
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      contactName: booking.contactName,
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
      packageName: booking.packageName,
      specialNotes: booking.specialNotes,
      addOns: booking.addOns,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
    }));

    return NextResponse.json(transformedBookings);
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to fetch bookings: ${error.message}` },
      { status: 500 },
    );
  }
}
