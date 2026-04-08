import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { OwnerOnboardingForm } from "@/components/owner-onboarding-form";
import { prisma } from "@/lib/prisma";

export default async function OwnerOnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/owner/onboarding");
  }

  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      documents: {
        orderBy: {
          uploadedAt: "desc",
        },
      },
    },
  });

  const initialProfile = ownerProfile
    ? {
        businessName: ownerProfile.businessName,
        businessType: ownerProfile.businessType,
        registrationNumber: ownerProfile.registrationNumber ?? "",
        taxId: ownerProfile.taxId ?? "",
        contactPhone: ownerProfile.contactPhone,
        address: ownerProfile.address,
        city: ownerProfile.city,
        description: ownerProfile.description ?? "",
        status: ownerProfile.status,
        documents: ownerProfile.documents.map((document) => ({
          id: document.id,
          documentType: document.documentType,
          fileName: document.fileName,
          fileUrl: document.fileUrl,
        })),
      }
    : null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f4ed_0%,#fffdf8_48%,#ffffff_100%)] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-6 rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-sm backdrop-blur md:grid-cols-[1.4fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Owner Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
              Business onboarding and verification
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-600">
              Register your business details, attach compliance documents, and submit your owner profile for review. New and updated submissions are marked pending by default.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-zinc-950 p-6 text-white">
            <div className="text-sm uppercase tracking-[0.24em] text-white/60">Checklist</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              <li>Business identity and registration data</li>
              <li>Operational address and phone verification</li>
              <li>Business license and owner ID upload</li>
            </ul>
          </div>
        </div>

        <OwnerOnboardingForm initialProfile={initialProfile} />
      </div>
    </main>
  );
}
