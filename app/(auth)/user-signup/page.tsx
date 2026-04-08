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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#071a11] to-[#04110a] px-4">
      <OrganicShapeMask className="absolute inset-0 -z-10 opacity-30" />

      <div className="z-10 w-full max-w-md rounded-2xl bg-zinc-900/85 p-8 shadow-xl backdrop-blur-md">
        <h2 className="text-2xl font-semibold text-white text-center mb-4">Create your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300">Full name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md bg-zinc-800/60 border border-zinc-700 px-3 py-2 text-white"
            />
          </div>

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
              minLength={6}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md bg-zinc-800/60 border border-zinc-700 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-md bg-zinc-800/60 border border-zinc-700 px-3 py-2 text-white"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="OWNER">Hall Owner</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-yellow-500 px-4 py-2 text-black font-medium hover:bg-yellow-400"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-300">
          Already have an account?{' '}
          <Link href="/user-signin" className="text-yellow-300 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
