"use client";

import { useState, useEffect } from "react";
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

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed bottom-6 right-6 z-40 inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-b from-[#3a1518] to-[#1c080a] shadow-lg text-yellow-300 hover:text-yellow-200 focus:outline-none transition-all hover:shadow-xl"
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
            className="md:hidden fixed inset-0 z-30 bg-black/50 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Mobile Sidebar */}
          <div className="md:hidden fixed left-0 top-0 z-40 h-screen w-72 overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-left-full duration-300">
            <div className="sticky top-0 z-50 bg-gradient-to-b from-[#3a1518] to-[#1c080a] p-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Navigation</h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center p-1 rounded-md text-yellow-300 hover:text-yellow-200 hover:bg-white/10 transition-colors"
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
