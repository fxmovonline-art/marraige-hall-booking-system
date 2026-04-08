import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { AdminControlCenter } from "@/components/admin-control-center";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/admin");
  }

  const [pendingHalls, pendingOwnerApplications, complaints] = await Promise.all([
    prisma.hall.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.ownerProfile.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
      },
    }),
    prisma.complaint.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);



  const hallRows = pendingHalls.map((hall) => ({
    id: hall.id,
    name: hall.name,
    city: hall.city,
    address: hall.address,
    capacity: hall.capacity,
    pricePerDay: hall.pricePerDay.toString(),
    ownerName: hall.owner.name,
    ownerEmail: hall.owner.email,
    createdAt: hall.createdAt.toISOString(),
  }));

  const ownerApplicationRows = pendingOwnerApplications.map((application) => ({
    id: application.id,
    businessName: application.businessName,
    businessType: application.businessType,
    city: application.city,
    contactPhone: application.contactPhone,
    ownerName: application.user.name,
    ownerEmail: application.user.email,
    documentCount: application.documents.length,
    documents: application.documents.map((document) => ({
      id: document.id,
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      documentType: document.documentType,
    })),
    createdAt: application.createdAt.toISOString(),
  }));



  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff8e7_0%,#f5f1e8_40%,#ffffff_100%)] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-7xl flex gap-8">
        <DashboardSidebar name={session.user.name ?? "Admin"} email={session.user.email ?? ""} role={session.user.role ?? "ADMIN"} />

        <div className="flex-1">
          <div className="mb-10 grid gap-6 rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-sm backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">Admin control center</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">Pending moderation queue</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-600">
              Review owner applications and hall listings in one place. Approval marks records as verified, while rejection keeps verification disabled.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-zinc-950 p-6 text-white">
            <div className="text-sm uppercase tracking-[0.24em] text-white/60">Queue summary</div>
            <div className="mt-4 space-y-3 text-sm text-white/80">
              <div>{hallRows.length} hall listings awaiting decision</div>
              <div>{ownerApplicationRows.length} owner applications awaiting decision</div>
            </div>
          </div>
        </div>

          <AdminControlCenter
            initialPendingHalls={hallRows}
            initialPendingOwnerApplications={ownerApplicationRows}
            initialComplaints={complaints.map((c) => ({
              id: c.id,
              subject: c.subject,
              message: c.message,
              status: c.status,
              customerName: c.customer.name,
              customerEmail: c.customer.email,
              createdAt: c.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </main>
  );
}
