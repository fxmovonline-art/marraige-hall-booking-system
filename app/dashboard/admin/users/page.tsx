"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserLogoutButton from "@/components/UserLogoutButton";

export default function UserDashboard() {
  const { data: session } = useSession();

  if (!session) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50 px-6 py-12 md:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-3xl border border-black/10 bg-white/90 p-8 shadow-md flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-shrink-0 h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-4xl font-bold text-green-700">
            {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Welcome, {session.user.name || session.user.email}</h1>
            <div className="text-zinc-600 text-sm">Email: {session.user.email}</div>
            <div className="text-zinc-600 text-sm mt-1">Role: {session.user.role}</div>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-green-900">Your Hall Bookings</h2>
          {/* TODO: List user's bookings here */}
          <div className="text-zinc-500">No bookings found.</div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Chat with Hall Owners</h3>
            <Link href="#" className="rounded bg-green-600 text-white px-4 py-2 text-center hover:bg-green-700">Open Chat</Link>
            <span className="text-xs text-zinc-400">(Coming soon)</span>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Complaint to Admin</h3>
            <Link href="#" className="rounded bg-amber-600 text-white px-4 py-2 text-center hover:bg-amber-700">Submit Complaint</Link>
            <span className="text-xs text-zinc-400">(Coming soon)</span>
          </div>
        </section>
      </div>
      <div className="mt-10">
        <UserLogoutButton />
      </div>
    </main>
  );
}