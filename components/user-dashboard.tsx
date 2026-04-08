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

export default function UserDashboard() {
  const { data: session } = useSession();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchComplaints();
    }
  }, [session]);

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
    <main className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-zinc-50 px-6 py-12 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="group rounded-[2rem] border border-black/5 bg-white/70 p-8 shadow-sm backdrop-blur-md flex flex-col md:flex-row gap-8 items-center transition-all hover:bg-white/80 relative">
          <div className="flex-shrink-0 h-24 w-24 rounded-3xl bg-emerald-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-emerald-200/50 transition-transform group-hover:scale-105">
            {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
          </div>
          <div className="text-center md:text-left flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight truncate">Welcome, {session.user.name || session.user.email}</h1>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
                {session.user.email}
              </span>
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 border border-zinc-200">
                {session.user.role}
              </span>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <UserLogoutButton />
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white/70 p-8 shadow-sm backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 text-emerald-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Your Hall Bookings
          </h2>
          {/* TODO: List user's bookings here */}
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
             <div className="text-zinc-500">No bookings found.</div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-black/5 bg-white/70 p-8 shadow-sm backdrop-blur-sm flex flex-col gap-4 transition-all hover:translate-y-[-2px]">
            <h3 className="text-lg font-bold text-zinc-900">Chat with Hall Owners</h3>
            <p className="text-sm text-zinc-600">Got questions about your venue? Start a direct chat with the owner.</p>
            <div className="mt-2">
              <Link href="#" className="inline-block rounded-full bg-emerald-600 text-white px-6 py-2.5 text-sm font-bold text-center hover:bg-emerald-700 transition-colors shadow-md active:scale-95">Open Chat</Link>
              <div className="mt-2 text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Features coming soon</div>
            </div>
          </div>
          
          <div className="rounded-3xl border border-black/5 bg-white/70 p-8 shadow-sm backdrop-blur-sm flex flex-col gap-4 transition-all hover:translate-y-[-2px]">
            <h3 className="text-lg font-bold text-zinc-900">Complaint to Admin</h3>
            <p className="text-sm text-zinc-600">Facing issues with a hall or an owner? Submit a complaint to our team.</p>
            <div className="mt-2">
              <button 
                onClick={() => setShowComplaintForm(true)}
                className="rounded-full bg-orange-600 text-white px-6 py-2.5 text-sm font-bold text-center hover:bg-orange-700 transition-colors shadow-md shadow-orange-200/50 active:scale-95"
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
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm animate-in fade-in slide-in-from-top-4">
            {successMessage}
          </div>
        )}

        <section className="rounded-[2rem] border border-black/5 bg-white/70 p-8 shadow-sm backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 text-zinc-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500"></span>
            Submitted Reports
          </h2>
          
          {isLoadingComplaints ? (
            <div className="text-center py-6 text-zinc-500 text-sm">Fetching your reports...</div>
          ) : complaints.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/40">
              <table className="min-w-full divide-y divide-black/5 text-sm">
                <thead>
                  <tr className="bg-zinc-50/50 text-left text-zinc-500 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {complaints.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-white/60">
                      <td className="px-6 py-4 font-medium text-zinc-900">{c.subject}</td>
                      <td className="px-6 py-4 text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
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
            <div className="text-center py-10 rounded-2xl border-2 border-dashed border-zinc-200/50 bg-white/20">
              <p className="text-zinc-500 text-sm">You haven't submitted any complaints yet.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
