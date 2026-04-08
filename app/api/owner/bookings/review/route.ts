import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type ReviewRequestBody = {
  bookingId?: unknown;
  decision?: unknown;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as ReviewRequestBody;
  const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
  const decision = body.decision;

  if (!bookingId || (decision !== "ACCEPT" && decision !== "REJECT")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ownerBooking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      hall: {
        ownerId: session.user.id,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!ownerBooking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (ownerBooking.status !== "PENDING_CONFIRMATION") {
    return NextResponse.json({ error: "Only pending requests can be reviewed" }, { status: 409 });
  }

  const updatedBooking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: decision === "ACCEPT" ? "CONFIRMED" : "REJECTED",
    },
    select: {
      id: true,
      status: true,
    },
  });

  return NextResponse.json({
    booking: updatedBooking,
  });
}
