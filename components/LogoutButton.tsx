"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-red-600 hover:text-white transition-colors mt-6"
    >
      Logout
    </button>
  );
}
