
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function HeaderHero() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  // Determine dashboard link and label based on user role
  let dashboardLabel = "Login";
  let dashboardHref = "/user-signin";
  if (session?.user?.role === "ADMIN") {
    dashboardLabel = "Admin Panel";
    dashboardHref = "/dashboard/admin";
  } else if (session?.user?.role === "OWNER") {
    dashboardLabel = "Owner Dashboard";
    dashboardHref = "/dashboard/owner";
  } else if (session?.user?.role === "CUSTOMER" || session?.user?.role === "USER") {
    dashboardLabel = "My Dashboard";
    dashboardHref = "/dashboard/user";
  }

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 12;
      setIsScrolled(scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 shadow-2xl transition-all duration-300 bg-[linear-gradient(135deg,#054e2b_0%,#066e4a_45%,#053c2a_100%)] backdrop-blur-md bg-opacity-90`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:px-12 md:py-2">
        <Link href="/" className="group flex items-center">
          <div className="relative h-14 w-14 md:h-16 md:w-16">
            <img
              src="/images/logo.png"
              alt="C Grandeur"
              className="h-full w-full scale-125 object-contain transform-gpu"
            />
          </div>
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-yellow-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((s) => !s)}
          >
            <svg className={`h-6 w-6`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop links */}
          <Link
            href="/halls"
            className="hidden md:inline-block group relative text-xs font-light tracking-[0.12em] text-yellow-300/80 transition-all duration-300 hover:text-yellow-200 md:text-sm"
          >
            Halls
            <span className="absolute bottom-0 left-0 h-px w-0 bg-yellow-400 transition-all duration-500 group-hover:w-full"></span>
          </Link>
          <span className="hidden text-yellow-500/30 md:inline">|</span>
          <Link
            href={dashboardHref}
            className="hidden md:inline-block group relative text-xs font-light tracking-[0.12em] text-yellow-300/80 transition-all duration-300 hover:text-yellow-200 md:text-sm"
          >
            {dashboardLabel}
            <span className="absolute bottom-0 left-0 h-px w-0 bg-yellow-400 transition-all duration-500 group-hover:w-full"></span>
          </Link>
          <span className="hidden text-yellow-500/30 md:inline">|</span>
          <Link
            href="/#contact"
            className="hidden md:inline-block group relative text-xs font-light tracking-[0.12em] text-yellow-300/80 transition-all duration-300 hover:text-yellow-200 md:text-sm"
          >
            Contacts
            <span className="absolute bottom-0 left-0 h-px w-0 bg-yellow-400 transition-all duration-500 group-hover:w-full"></span>
          </Link>
        </div>
      </nav>
      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden w-full bg-[linear-gradient(135deg,#054e2b_0%,#066e4a_45%,#053c2a_100%)]/95 border-t border-yellow-400/20">
          <div className="flex flex-col px-4 py-4 gap-3 max-w-7xl mx-auto">
            <Link 
              href="/halls" 
              className="text-yellow-200 font-medium py-2 px-2 rounded hover:bg-yellow-400/10 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Halls
            </Link>
            <Link 
              href={dashboardHref} 
              className="text-yellow-200 font-medium py-2 px-2 rounded hover:bg-yellow-400/10 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {dashboardLabel}
            </Link>
            <Link 
              href="/#contact" 
              className="text-yellow-200 font-medium py-2 px-2 rounded hover:bg-yellow-400/10 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Contacts
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
