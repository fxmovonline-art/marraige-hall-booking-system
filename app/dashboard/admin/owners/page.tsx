import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { AdminOwnersClient } from "@/components/admin-owners-client";
import { prisma } from "@/lib/prisma";

export default async function AdminOwnersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/api/auth/signin?callbackUrl=/dashboard/admin/owners");
  }

  const owners = await prisma.ownerProfile.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const ownerRows = owners.map((owner) => ({
    id: owner.id,
    businessName: owner.businessName,
    businessType: owner.businessType,
    city: owner.city,
    contactPhone: owner.contactPhone,
    ownerName: owner.user.name,
    ownerEmail: owner.user.email,
    createdAt: owner.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff8e7_0%,#f5f1e8_40%,#ffffff_100%)] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-7xl flex gap-8">
        <DashboardSidebar name={session.user.name ?? "Admin"} email={session.user.email ?? ""} role={session.user.role ?? "ADMIN"} />

        <div className="flex-1 space-y-8">
          <div className="grid gap-6 rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-sm backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">Admin control center</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">Verified Owners</h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-600">
                View all approved business owners. Deleting an owner profile is permanent and will cascade to their halls if database constraints apply.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-zinc-950 p-6 text-white flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold">{ownerRows.length}</div>
                <div className="mt-2 text-sm uppercase tracking-[0.24em] text-white/60">Total Owners</div>
              </div>
            </div>
          </div>

          <AdminOwnersClient initialOwners={ownerRows} />
        </div>
      </div>
    </main>
  );
}
