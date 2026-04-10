"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import OrganicShapeMask from "@/components/OrganicShapeMask";

export default function UserSignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Registration failed");
      }

      // auto sign in after registration
      const signin = await signIn("credentials", { redirect: false, email, password });

      if (signin && !(signin as any).error) {
        const session = await getSession();
        const r = session?.user?.role as string | undefined;
        if (r === "OWNER") router.push("/dashboard/owner");
        else router.push("/");
      } else {
        router.push("/user-signin");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#071a11] to-[#04110a]">
      <OrganicShapeMask className="absolute inset-0 -z-10 opacity-30" />

      <div className="z-10 w-full px-4 sm:px-6">
        <div className="max-w-md mx-auto rounded-2xl bg-zinc-900/85 p-6 sm:p-8 shadow-xl backdrop-blur-md">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-6 sm:mb-8">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Full name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>

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
                minLength={6}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-md bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="OWNER">Hall Owner</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-400 bg-red-400/10 rounded p-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-yellow-500 px-4 py-3 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 transition-colors mt-6"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link href="/user-signin" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
