"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type BookingStatus = "PENDING_CONFIRMATION" | "ADVANCE_PAID" | "CONFIRMED" | "CANCELLED" | "REJECTED";
type BookingSlot = "LUNCH" | "DINNER";

type OwnerBookingRow = {
  id: string;
  hallName: string;
  customerName: string;
  contactEmail: string;
  contactPhone: string;
  eventDate: string;
  slot: BookingSlot;
  guestCount: number;
  totalPrice: string;
  status: BookingStatus;
  createdAt: string;
};

type ConfirmedBookingCalendarRow = {
  id: string;
  hallName: string;
  eventDate: string;
  slot: BookingSlot;
};

type Props = {
  stats: {
    totalBookings: number;
    revenue: number;
    pendingRequests: number;
  };
  bookings: OwnerBookingRow[];
  confirmedBookings: ConfirmedBookingCalendarRow[];
};

const slotLabel: Record<BookingSlot, string> = {
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

const statusColor: Record<BookingStatus, string> = {
  PENDING_CONFIRMATION: "bg-amber-100 text-amber-700",
  ADVANCE_PAID: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-zinc-200 text-zinc-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function OwnerDashboardPanel({ stats, bookings, confirmedBookings }: Props) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [month, setMonth] = useState(new Date());
  const [isPending, startTransition] = useTransition();

  const confirmedDates = useMemo(
    () => confirmedBookings.map((booking) => new Date(booking.eventDate)),
    [confirmedBookings],
  );

  const visibleMonthBookings = useMemo(
    () => confirmedBookings.filter((booking) => {
      const date = new Date(booking.eventDate);
      return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
    }),
    [confirmedBookings, month],
  );

  const selectedDayBookings = useMemo(
    () => {
      if (!selectedDate) {
        return [];
      }

      return confirmedBookings.filter((booking) => sameDay(new Date(booking.eventDate), selectedDate));
    },
    [confirmedBookings, selectedDate],
  );

  function handleDecision(bookingId: string, decision: "ACCEPT" | "REJECT") {
    setFeedback(null);
    setError(null);
    const actionKey = `${bookingId}:${decision}`;
    setActiveAction(actionKey);

    startTransition(async () => {
      const response = await fetch("/api/owner/bookings/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId, decision }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not update booking.");
        setActiveAction(null);
        return;
      }

      setFeedback(decision === "ACCEPT" ? "Booking confirmed." : "Booking rejected.");
      setActiveAction(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Total Bookings</p>
          <p className="mt-4 text-3xl font-semibold text-zinc-950">{stats.totalBookings}</p>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Revenue</p>
          <p className="mt-4 text-3xl font-semibold text-zinc-950">{formatCurrency(stats.revenue)}</p>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Pending Requests</p>
          <p className="mt-4 text-3xl font-semibold text-zinc-950">{stats.pendingRequests}</p>
        </div>
      </section>

      {feedback ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className={`rounded-4xl border border-black/10 bg-white p-6 shadow-sm transition-opacity ${isPending ? "opacity-70" : ""}`}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-zinc-950">Booking Inquiries</h2>
          <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-700">{bookings.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/10 text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-4 py-3 font-medium">Hall</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Guests</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {bookings.length > 0 ? bookings.map((booking) => (
                <tr key={booking.id} className="align-top">
                  <td className="px-4 py-4 font-medium text-zinc-900">{booking.hallName}</td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-zinc-800">{booking.customerName}</div>
                    <div className="text-xs text-zinc-600">{booking.contactEmail}</div>
                    <div className="text-xs text-zinc-600">{booking.contactPhone}</div>
                  </td>
                  <td className="px-4 py-4 text-zinc-700">
                    <div>{booking.eventDate}</div>
                    <div className="text-xs">{slotLabel[booking.slot]}</div>
                  </td>
                  <td className="px-4 py-4 text-zinc-700">{booking.guestCount}</td>
                  <td className="px-4 py-4 text-zinc-700">PKR {booking.totalPrice}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[booking.status]}`}>
                      {booking.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {booking.status === "PENDING_CONFIRMATION" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDecision(booking.id, "ACCEPT")}
                          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {activeAction === `${booking.id}:ACCEPT` ? "Accepting..." : "Accept"}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDecision(booking.id, "REJECT")}
                          className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                        >
                          {activeAction === `${booking.id}:REJECT` ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500">No actions</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    No booking inquiries found for your halls.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-950">Confirmed Bookings Calendar</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Month view of all confirmed bookings across your halls.
        </p>

        <div className="mt-5 overflow-x-auto">
          <DayPicker
            month={month}
            onMonthChange={setMonth}
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ confirmed: confirmedDates }}
            modifiersClassNames={{
              confirmed: "bg-emerald-100 text-emerald-800 font-semibold rounded-full",
            }}
          />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">This Month</p>
            <div className="mt-3 space-y-2 text-sm text-zinc-700">
              {visibleMonthBookings.length > 0 ? visibleMonthBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-black/10 bg-white px-3 py-2">
                  <div className="font-medium">{booking.hallName}</div>
                  <div className="text-xs">{booking.eventDate} • {slotLabel[booking.slot]}</div>
                </div>
              )) : <p>No confirmed bookings in this month.</p>}
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Selected Day</p>
            <div className="mt-3 space-y-2 text-sm text-zinc-700">
              {selectedDate ? (
                selectedDayBookings.length > 0 ? selectedDayBookings.map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-black/10 bg-white px-3 py-2">
                    <div className="font-medium">{booking.hallName}</div>
                    <div className="text-xs">{slotLabel[booking.slot]}</div>
                  </div>
                )) : <p>No confirmed bookings for this day.</p>
              ) : (
                <p>Select a date to see confirmed bookings.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
