"use client";
import Link from "next/link";
import React from "react";
import { ChevronDown, Plus } from "lucide-react";
import LogoutButton from "./LogoutButton";

type HallSummary = { id: string; name: string };

type Props = {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  ownerHalls?: HallSummary[];
};

export default function DashboardSidebar({ name, email, role, avatarUrl, ownerHalls }: Props) {

  return (
    <aside className="w-72 shrink-0">
      <div className="sticky top-8 space-y-6 flex flex-col h-[calc(100vh-4rem)] max-h-[800px]">
        {/* Main Sidebar Container matching dark red theme */}
        <div className="flex-1 rounded-[2rem] bg-gradient-to-b from-[#3a1518] to-[#1c080a] p-6 text-white/90 shadow-xl flex flex-col">
          {/* Profile Section */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-white/20" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase font-bold tracking-widest text-white/50">{role}</div>
              <div className="text-sm font-semibold truncate text-white">{name}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-6 hide-scrollbar space-y-8">
            {/* MAIN Section */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 px-2">Main</div>
              <ul className="space-y-1">
                {role === "ADMIN" ? (
                  <>
                    <li>
                      <Link href="/dashboard/admin" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors">
                        <span className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-sm bg-white/40"></div>
                          Admin Control
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Link>
                      <div className="ml-5 mt-2 border-l border-white/10 pl-4 space-y-2">
                        <Link href="/dashboard/admin" className="block text-sm text-white/60 hover:text-white transition-colors py-1">Pending Requests</Link>
                        <Link href="/dashboard/admin/users" className="block text-sm text-white/60 hover:text-white transition-colors py-1">Users</Link>
                        <Link href="/dashboard/admin/owners" className="block text-sm text-white/60 hover:text-white transition-colors py-1">Owners</Link>
                        <Link href="/dashboard/admin/halls" className="block text-sm text-white/60 hover:text-white transition-colors py-1">Live Halls</Link>
                      </div>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/dashboard/owner" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition-colors">
                        <span className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-sm bg-white/40"></div>
                          Dashboard
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Link>
                      <div className="ml-5 mt-2 border-l border-white/10 pl-4 space-y-2">
                        <Link href="/dashboard/owner" className="block text-sm text-white/60 hover:text-white transition-colors py-1">Overview</Link>
                        <Link href="/dashboard/owner/onboarding" className="block text-sm text-white/60 hover:text-white transition-colors py-1">Owner Profile</Link>
                      </div>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* General Links */}
            <div>
              <ul className="space-y-1">
                <li><Link href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors">Invoices</Link></li>
                <li><Link href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors">Wallet</Link></li>
                <li><Link href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors">Notification</Link></li>
              </ul>
            </div>

            {/* Owner specific halls list */}
            {role !== "ADMIN" && ownerHalls && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 px-2 flex justify-between items-center">
                  Your Halls
                  <Link href="/dashboard/owner/halls/new" className="text-white hover:text-[#e4762b]"><Plus className="h-3 w-3" /></Link>
                </div>
                <ul className="space-y-1">
                  {ownerHalls.length > 0 ? ownerHalls.map((h) => (
                    <li key={h.id}>
                      <Link href={`/halls/${h.id}`} className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                        {h.name}
                      </Link>
                    </li>
                  )) : (
                    <li className="px-4 py-2 text-xs text-white/40">No halls listed yet.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          {/* Logout Button at the bottom */}
          <LogoutButton />
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
}
