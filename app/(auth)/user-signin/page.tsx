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
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#071a11] to-[#04110a]">
      <OrganicShapeMask className="absolute inset-0 -z-10 opacity-30" />

      <div className="z-10 w-full px-4 sm:px-6">
        <div className="max-w-md mx-auto rounded-2xl bg-zinc-900/85 p-6 sm:p-8 shadow-xl backdrop-blur-md">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-6 sm:mb-8">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-400 bg-red-400/10 rounded p-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-yellow-500 px-4 py-3 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 transition-colors mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link href="/user-signup" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
