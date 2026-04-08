import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Fetch admin complaints error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { complaintId, status } = await req.json();

    if (!complaintId || !status) {
      return NextResponse.json({ error: "Complaint ID and status are required" }, { status: 400 });
    }

    const complaint = await prisma.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Update complaint error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
