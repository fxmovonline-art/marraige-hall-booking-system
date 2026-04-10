import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { OwnerDashboardPanel } from "@/components/owner-dashboard-panel";
import { prisma } from "@/lib/prisma";
import DashboardSidebarWrapper from "@/components/dashboard-sidebar-wrapper";

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff8e7_0%,#f4efe5_38%,#ffffff_100%)]">
      <div className="px-4 py-6 md:px-10 md:py-12 pb-20 md:pb-12">
        <div className="mx-auto max-w-7xl">
          {/* Desktop layout */}
          <div className="hidden md:flex gap-8">
            <DashboardSidebarWrapper name={session.user.name ?? "Owner"} email={session.user.email ?? ""} role={session.user.role ?? "OWNER"} ownerHalls={ownerHalls} />

            <div className="flex-1 min-w-0 space-y-8">
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

              <div className="flex flex-wrap items-center gap-3">
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

          {/* Mobile layout - full width */}
          <div className="md:hidden flex flex-col gap-6">
            <DashboardSidebarWrapper name={session.user.name ?? "Owner"} email={session.user.email ?? ""} role={session.user.role ?? "OWNER"} ownerHalls={ownerHalls} />

            <section className="rounded-xl border border-black/10 bg-white/90 p-4 shadow-sm space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Owner Dashboard</p>
                <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">Hall Operations</h1>
                <p className="mt-2 text-xs leading-5 text-zinc-600">
                  Manage bookings and reservations.
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-amber-700 font-semibold">Your Profile</div>
                <div className="mt-2 text-base font-semibold text-zinc-950">{ownerProfile?.businessName ?? "Not submitted"}</div>
                <div className="mt-1 text-xs text-zinc-700">Status: {ownerProfile?.status ?? "PENDING"}</div>
              </div>
            </section>

            <div className="flex flex-col gap-2">
              {ownerProfile?.businessName ? null : (
                <a
                  href="/dashboard/owner/onboarding"
                  className="rounded-lg bg-amber-600 px-4 py-3 text-sm font-medium text-white hover:bg-amber-500 text-center transition-colors"
                >
                  Complete owner profile
                </a>
              )}
              <a
                href="/dashboard/owner/halls/new"
                className="rounded-lg border border-black/10 px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 text-center transition-colors"
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
      </div>
    </main>
  );
}
