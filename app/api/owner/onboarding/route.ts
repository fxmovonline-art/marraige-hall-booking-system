import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type SupportedUpload = {
  formKey: string;
  documentType: "BUSINESS_LICENSE" | "GOVERNMENT_ID" | "ADDRESS_PROOF";
};

const uploadDefinitions: SupportedUpload[] = [
  { formKey: "businessLicense", documentType: "BUSINESS_LICENSE" },
  { formKey: "governmentId", documentType: "GOVERNMENT_ID" },
  { formKey: "addressProof", documentType: "ADDRESS_PROOF" },
];

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can complete onboarding." }, { status: 403 });
  }

  const formData = await request.formData();

  const businessName = String(formData.get("businessName") ?? "").trim();
  const businessType = String(formData.get("businessType") ?? "").trim();
  const registrationNumber = String(formData.get("registrationNumber") ?? "").trim();
  const taxId = String(formData.get("taxId") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!businessName || !businessType || !contactPhone || !address || !city) {
    return NextResponse.json(
      { error: "Business name, type, phone, address, and city are required." },
      { status: 400 },
    );
  }

  const existingProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    include: { documents: true },
  });

  const hasExistingBusinessLicense = existingProfile?.documents.some(
    (document) => document.documentType === "BUSINESS_LICENSE",
  );
  const hasExistingGovernmentId = existingProfile?.documents.some(
    (document) => document.documentType === "GOVERNMENT_ID",
  );

  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "owner-documents",
    session.user.id,
  );

  await mkdir(uploadDirectory, { recursive: true });

  const documentsToCreate: Array<{
    documentType: "BUSINESS_LICENSE" | "GOVERNMENT_ID" | "ADDRESS_PROOF";
    fileName: string;
    fileUrl: string;
    mimeType: string;
    size: number;
  }> = [];

  for (const definition of uploadDefinitions) {
    const file = formData.get(definition.formKey);

    if (!(file instanceof File) || file.size === 0) {
      continue;
    }

    const safeFileName = sanitizeFileName(file.name || `${definition.formKey}.bin`);
    const storedFileName = `${Date.now()}-${randomUUID()}-${safeFileName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDirectory, storedFileName);
    const fileUrl = `/uploads/owner-documents/${session.user.id}/${storedFileName}`;

    await writeFile(filePath, buffer);

    documentsToCreate.push({
      documentType: definition.documentType,
      fileName: file.name || storedFileName,
      fileUrl,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
  }

  const uploadedBusinessLicense = documentsToCreate.some(
    (document) => document.documentType === "BUSINESS_LICENSE",
  );
  const uploadedGovernmentId = documentsToCreate.some(
    (document) => document.documentType === "GOVERNMENT_ID",
  );

  if (!hasExistingBusinessLicense && !uploadedBusinessLicense) {
    return NextResponse.json(
      { error: "Business license document is required." },
      { status: 400 },
    );
  }

  if (!hasExistingGovernmentId && !uploadedGovernmentId) {
    return NextResponse.json(
      { error: "Government ID document is required." },
      { status: 400 },
    );
  }

  const ownerProfile = await prisma.ownerProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      businessName,
      businessType,
      registrationNumber: registrationNumber || null,
      taxId: taxId || null,
      contactPhone,
      address,
      city,
      description: description || null,
      status: "PENDING",
      isVerified: false,
      documents: documentsToCreate.length > 0 ? { create: documentsToCreate } : undefined,
    },
    update: {
      businessName,
      businessType,
      registrationNumber: registrationNumber || null,
      taxId: taxId || null,
      contactPhone,
      address,
      city,
      description: description || null,
      status: "PENDING",
      isVerified: false,
      documents: documentsToCreate.length > 0 ? { create: documentsToCreate } : undefined,
    },
    include: {
      documents: {
        orderBy: {
          uploadedAt: "desc",
        },
      },
    },
  });

  return NextResponse.json({
    message: "Owner onboarding submitted successfully.",
    profile: ownerProfile,
  });
}
