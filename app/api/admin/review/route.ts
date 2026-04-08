import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type ReviewEntity = "hall" | "ownerApplication";
type ReviewDecision = "APPROVE" | "REJECT";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    entityType?: ReviewEntity;
    entityId?: string;
    decision?: ReviewDecision;
  };

  if (!body.entityType || !body.entityId || !body.decision) {
    return NextResponse.json({ error: "Missing review payload." }, { status: 400 });
  }

  if (body.entityType === "hall") {
    const hall = await prisma.hall.findUnique({
      where: { id: body.entityId },
      select: { id: true, status: true },
    });

    if (!hall) {
      return NextResponse.json({ error: "Hall not found." }, { status: 404 });
    }

    const updatedHall = await prisma.hall.update({
      where: { id: body.entityId },
      data: {
        status: body.decision === "APPROVE" ? "APPROVED" : "REJECTED",
        isVerified: body.decision === "APPROVE",
      },
      select: {
        id: true,
        status: true,
        isVerified: true,
      },
    });

    return NextResponse.json({ item: updatedHall });
  }

  if (body.entityType === "ownerApplication") {
    const profile = await prisma.ownerProfile.findUnique({
      where: { id: body.entityId },
      select: { id: true, status: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Owner application not found." }, { status: 404 });
    }

    const updatedProfile = await prisma.ownerProfile.update({
      where: { id: body.entityId },
      data: {
        status: body.decision === "APPROVE" ? "APPROVED" : "REJECTED",
        isVerified: body.decision === "APPROVE",
      },
      select: {
        id: true,
        status: true,
        isVerified: true,
      },
    });

    return NextResponse.json({ item: updatedProfile });
  }

  return NextResponse.json({ error: "Unsupported entity type." }, { status: 400 });
}
