"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import DashboardSidebar from "./dashboard-sidebar";

type Props = {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  ownerHalls?: { id: string; name: string }[];
};

export default function DashboardSidebarWrapper({ name, email, role, avatarUrl, ownerHalls }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-20 right-4 z-40 inline-flex items-center justify-center p-2 rounded-lg bg-white shadow-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 focus:outline-none transition-colors"
        aria-expanded={mobileOpen}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar name={name} email={email} role={role} avatarUrl={avatarUrl} ownerHalls={ownerHalls} />
      </div>

      {/* Mobile Sidebar Modal */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/40 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Mobile Sidebar */}
          <div className="md:hidden fixed left-0 top-0 z-40 h-screen w-72 overflow-y-auto bg-white shadow-lg">
            <div className="sticky top-0 bg-white p-4 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900">Menu</h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center p-1 rounded-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <DashboardSidebar name={name} email={email} role={role} avatarUrl={avatarUrl} ownerHalls={ownerHalls} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
