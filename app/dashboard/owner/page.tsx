import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { OwnerDashboardPanel } from "@/components/owner-dashboard-panel";
import { prisma } from "@/lib/prisma";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default async function OwnerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/owner");
  }

  if (session.user.role !== "OWNER") {
    redirect("/unauthorized");
  }

  const [ownerProfile, totalBookings, pendingRequests, successfulRevenue, bookings, confirmedBookings] = await Promise.all([
    prisma.ownerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        status: true,
        businessName: true,
      },
    }),
    prisma.booking.count({
      where: {
        hall: {
          ownerId: session.user.id,
        },
      },
    }),
    prisma.booking.count({
      where: {
        hall: {
          ownerId: session.user.id,
        },
        status: "PENDING_CONFIRMATION",
      },
    }),
    prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "SUCCESS",
        booking: {
          hall: {
            ownerId: session.user.id,
          },
        },
      },
    }),
    prisma.booking.findMany({
      where: {
        hall: {
          ownerId: session.user.id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        hall: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.booking.findMany({
      where: {
        hall: {
          ownerId: session.user.id,
        },
        status: "CONFIRMED",
      },
      orderBy: {
        eventDate: "asc",
      },
      select: {
        id: true,
        eventDate: true,
        slot: true,
        hall: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const ownerHalls = await prisma.hall.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  const bookingRows = bookings.map((booking) => ({
    id: booking.id,
    hallName: booking.hall.name,
    customerName: booking.contactName || booking.customer.name,
    contactEmail: booking.contactEmail || booking.customer.email,
    contactPhone: booking.contactPhone || "N/A",
    eventDate: booking.eventDate.toLocaleDateString("en-PK"),
    slot: booking.slot,
    guestCount: booking.guestCount,
    totalPrice: booking.totalPrice.toString(),
    status: booking.status,
    createdAt: booking.createdAt.toLocaleDateString("en-PK"),
  }));

  const confirmedBookingRows = confirmedBookings.map((booking) => ({
    id: booking.id,
    hallName: booking.hall.name,
    eventDate: booking.eventDate.toLocaleDateString("en-PK"),
    slot: booking.slot,
  }));

  const revenue = successfulRevenue._sum.amount ? Number(successfulRevenue._sum.amount.toString()) : 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff8e7_0%,#f4efe5_38%,#ffffff_100%)] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-7xl flex gap-8">
        <DashboardSidebar name={session.user.name ?? "Owner"} email={session.user.email ?? ""} role={session.user.role ?? "OWNER"} ownerHalls={ownerHalls} />

        <div className="flex-1 space-y-8">
        <section className="grid gap-6 rounded-4xl border border-black/10 bg-white/85 p-8 shadow-sm md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Owner Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">Hall Operations Overview</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-600">
              Review inquiries, update booking statuses, and monitor confirmed reservations in one place.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-zinc-950 p-6 text-white">
            <div className="text-sm uppercase tracking-[0.24em] text-white/65">Owner Profile</div>
            <div className="mt-3 text-2xl font-semibold">{ownerProfile?.businessName ?? "Not submitted yet"}</div>
            <div className="mt-2 text-sm text-white/80">Status: {ownerProfile?.status ?? "PENDING"}</div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          {ownerProfile?.businessName ? null : (
            <a
              href="/dashboard/owner/onboarding"
              className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
            >
              Complete owner profile
            </a>
          )}
          <a
            href="/dashboard/owner/halls/new"
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Add a hall
          </a>
        </div>

          <OwnerDashboardPanel
          stats={{
            totalBookings,
            revenue,
            pendingRequests,
          }}
          bookings={bookingRows}
          confirmedBookings={confirmedBookingRows}
        />
        </div>
      </div>
    </main>
  );
}
