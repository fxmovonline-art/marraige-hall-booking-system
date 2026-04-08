"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import OrganicShapeMask from "@/components/OrganicShapeMask";

export default function UserSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", { redirect: false, email, password });

    if (!res || (res as any).error) {
      setError((res as any)?.error || "Invalid credentials");
      setLoading(false);
      return;
    }

    // get session to inspect role and redirect accordingly
    const session = await getSession();

    const role = session?.user?.role as string | undefined;

    if (role === "OWNER") {
      router.push("/dashboard/owner");
    } else if (role === "ADMIN") {
      router.push("/dashboard/admin");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#071a11] to-[#04110a] px-4">
      <OrganicShapeMask className="absolute inset-0 -z-10 opacity-30" />

      <div className="z-10 w-full max-w-md rounded-2xl bg-zinc-900/85 p-8 shadow-xl backdrop-blur-md">
        <h2 className="text-2xl font-semibold text-white text-center mb-4">Sign in to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md bg-zinc-800/60 border border-zinc-700 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md bg-zinc-800/60 border border-zinc-700 px-3 py-2 text-white"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-yellow-500 px-4 py-2 text-black font-medium hover:bg-yellow-400"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-300">
          Don't have an account?{' '}
          <Link href="/user-signup" className="text-yellow-300 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
