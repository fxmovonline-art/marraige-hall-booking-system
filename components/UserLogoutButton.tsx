"use client";
import { signOut } from "next-auth/react";

export default function UserLogoutButton() {
  return (
    <div className="flex justify-center">
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-rose-600 transition-all shadow-md active:scale-95 whitespace-nowrap"
      >
        Logout
      </button>
    </div>
  );
}
