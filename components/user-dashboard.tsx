"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import UserLogoutButton from "./UserLogoutButton";
import ComplaintForm from "./ComplaintForm";

type Complaint = {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

type UserBooking = {
  id: string;
  hallId: string;
  hallName: string;
  hallAddress: string;
  hallCity: string;
  hallImage: string | null;
  eventDate: string;
  eventDateFull: string;
  slot: string;
  guestCount: number;
  totalPrice: string;
  status: string;
  createdAt: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  packageName: string;
  specialNotes: string | null;
};

export default function UserDashboard() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchBookings();
      fetchComplaints();
    }
  }, [session]);

  async function fetchBookings() {
    setIsLoadingBookings(true);
    try {
      const response = await fetch("/api/user/bookings");
      const data = await response.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
    } finally {
      setIsLoadingBookings(false);
    }
  }

  async function fetchComplaints() {
    setIsLoadingComplaints(true);
    try {
      const response = await fetch("/api/user/complaints");
      const data = await response.json();
      if (Array.isArray(data)) {
        setComplaints(data);
      }
    } catch (error) {
      console.error("Fetch complaints error:", error);
    } finally {
      setIsLoadingComplaints(false);
    }
  }

  if (!session) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-zinc-50 px-4 py-6 md:px-10 md:py-12">
      <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
        {/* Welcome Section */}
        <section className="group rounded-2xl md:rounded-[2rem] border border-black/5 bg-white/70 p-4 md:p-8 shadow-sm backdrop-blur-md flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-center transition-all hover:bg-white/80 relative">
          <div className="flex-shrink-0 h-20 w-20 md:h-24 md:w-24 rounded-2xl md:rounded-3xl bg-emerald-600 flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-lg shadow-emerald-200/50 transition-transform group-hover:scale-105">
            {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-zinc-900 mb-2 md:mb-3 tracking-tight break-words">Welcome, {session.user.name || session.user.email}</h1>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 md:px-2.5 py-1 md:py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100 break-all">
                {session.user.email}
              </span>
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 md:px-2.5 py-1 md:py-0.5 text-xs font-medium text-zinc-700 border border-zinc-200">
                {session.user.role}
              </span>
            </div>
          </div>
          <div className="w-full md:w-auto mt-3 md:mt-0">
            <UserLogoutButton />
          </div>
        </section>

        {/* Hall Bookings Section */}
        <section className="rounded-xl md:rounded-2xl border border-black/5 bg-white/70 p-4 md:p-8 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-emerald-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <span>Your Hall Bookings</span>
          </h2>
          
          {isLoadingBookings ? (
            <div className="text-center py-6 text-zinc-500 text-xs md:text-sm">Fetching your bookings...</div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4 md:space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-black/5 bg-white/50 overflow-hidden hover:bg-white/70 transition-colors">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6">
                    {/* Hall Image */}
                    {booking.hallImage && (
                      <div className="w-full md:w-48 h-40 md:h-40 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-200">
                        {/* Using img instead of Next Image to avoid setup issues */}
                        <img 
                          src={booking.hallImage} 
                          alt={booking.hallName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Booking Details */}
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Hall Name</p>
                          <p className="text-sm md:text-base font-bold text-zinc-900 truncate">{booking.hallName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Location</p>
                          <p className="text-sm md:text-base font-medium text-zinc-700">{booking.hallAddress}, {booking.hallCity}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Event Date</p>
                          <p className="text-sm md:text-base font-medium text-zinc-700">{new Date(booking.eventDate).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Slot</p>
                          <p className="text-sm md:text-base font-medium text-zinc-700">{booking.slot}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Guests</p>
                          <p className="text-sm md:text-base font-medium text-zinc-700">{booking.guestCount} people</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Price</p>
                          <p className="text-sm md:text-base font-bold text-emerald-600">PKR {Number(booking.totalPrice).toLocaleString("en-PK")}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                            booking.status === "PENDING_CONFIRMATION" ? "bg-amber-100 text-amber-700" :
                            booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" :
                            booking.status === "REJECTED" ? "bg-rose-100 text-rose-700" :
                            booking.status === "ADVANCE_PAID" ? "bg-blue-100 text-blue-700" :
                            "bg-zinc-100 text-zinc-700"
                          }`}>
                            {booking.status.replaceAll("_", " ")}
                          </span>
                        </div>
                      </div>
                      
                      {booking.specialNotes && (
                        <div className="mt-4 pt-4 border-t border-black/5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Special Notes</p>
                          <p className="text-sm text-zinc-600">{booking.specialNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer with Contact Info */}
                  <div className="border-t border-black/5 bg-zinc-50/50 px-4 md:px-6 py-3 md:py-4">
                    <p className="text-xs text-zinc-600">
                      <span className="font-semibold">{booking.contactName}</span> • {booking.contactEmail} • {booking.contactPhone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 md:py-16 opacity-60">
              <div className="text-sm md:text-base text-zinc-500">No bookings found.</div>
              <p className="text-xs md:text-sm text-zinc-400 mt-2">Start by exploring halls and making your first booking!</p>
            </div>
          )}
        </section>

        {/* Two Column Section - Chat and Complaint */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div className="rounded-xl md:rounded-3xl border border-black/5 bg-white/70 p-4 md:p-8 shadow-sm backdrop-blur-sm flex flex-col gap-3 md:gap-4 transition-all hover:translate-y-[-2px]">
            <h3 className="text-base md:text-lg font-bold text-zinc-900">Chat with Hall Owners</h3>
            <p className="text-xs md:text-sm text-zinc-600">Got questions about your venue? Start a direct chat with the owner.</p>
            <div className="mt-1 md:mt-2">
              <Link href="#" className="inline-block rounded-full bg-emerald-600 text-white px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-bold text-center hover:bg-emerald-700 transition-colors shadow-md active:scale-95">Open Chat</Link>
              <div className="mt-2 text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Features coming soon</div>
            </div>
          </div>
          
          <div className="rounded-xl md:rounded-3xl border border-black/5 bg-white/70 p-4 md:p-8 shadow-sm backdrop-blur-sm flex flex-col gap-3 md:gap-4 transition-all hover:translate-y-[-2px]">
            <h3 className="text-base md:text-lg font-bold text-zinc-900">Complaint to Admin</h3>
            <p className="text-xs md:text-sm text-zinc-600">Facing issues with a hall or an owner? Submit a complaint to our team.</p>
            <div className="mt-1 md:mt-2">
              <button 
                onClick={() => setShowComplaintForm(true)}
                className="rounded-full bg-orange-600 text-white px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-bold text-center hover:bg-orange-700 transition-colors shadow-md shadow-orange-200/50 active:scale-95"
              >
                Submit Complaint
              </button>
            </div>
          </div>
        </section>

        {showComplaintForm && (
          <ComplaintForm 
            onCancel={() => setShowComplaintForm(false)} 
            onSuccess={() => {
              setShowComplaintForm(false);
              setSuccessMessage("Your complaint has been submitted successfully.");
              fetchComplaints();
              setTimeout(() => setSuccessMessage(null), 5000);
            }} 
          />
        )}

        {successMessage && (
          <div className="rounded-lg md:rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs md:text-sm text-emerald-700 shadow-sm animate-in fade-in slide-in-from-top-4">
            {successMessage}
          </div>
        )}

        {/* Submitted Reports Section */}
        <section className="rounded-xl md:rounded-[2rem] border border-black/5 bg-white/70 p-4 md:p-8 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-zinc-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0"></span>
            <span>Submitted Reports</span>
          </h2>
          
          {isLoadingComplaints ? (
            <div className="text-center py-6 text-zinc-500 text-xs md:text-sm">Fetching your reports...</div>
          ) : complaints.length > 0 ? (
            <div className="overflow-x-auto rounded-lg md:rounded-2xl border border-black/5 bg-white/40">
              <table className="min-w-full divide-y divide-black/5 text-xs md:text-sm">
                <thead>
                  <tr className="bg-zinc-50/50 text-left text-zinc-500 font-semibold uppercase text-[10px] md:text-[11px] tracking-wider">
                    <th className="px-3 md:px-6 py-3 md:py-4">Subject</th>
                    <th className="px-3 md:px-6 py-3 md:py-4">Submitted</th>
                    <th className="px-3 md:px-6 py-3 md:py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {complaints.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-white/60">
                      <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-zinc-900 truncate">{c.subject}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-zinc-500 text-xs md:text-sm">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className={`inline-flex items-center rounded-full px-2 md:px-2.5 py-1 md:py-0.5 text-xs font-bold ${
                          c.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 md:py-10 rounded-lg md:rounded-2xl border-2 border-dashed border-zinc-200/50 bg-white/20">
              <p className="text-zinc-500 text-xs md:text-sm">You haven't submitted any complaints yet.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
