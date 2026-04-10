import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Readable } from "stream";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 100);
}

async function generateUniqueSlug(base: string) {
  let slug = slugify(base);
  let exists = await prisma.hall.findUnique({ where: { slug } });
  let suffix = 1;
  while (exists) {
    const candidate = `${slug}-${suffix}`;
    exists = await prisma.hall.findUnique({ where: { slug: candidate } });
    if (!exists) {
      slug = candidate;
      break;
    }
    suffix += 1;
  }
  return slug;
}

async function uploadToCloudinary(
  buffer: Buffer,
  fileName: string,
  folder: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Cloudinary upload failed: No result returned"));
        }
      },
    );

    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "OWNER") {
      return NextResponse.json({ message: "Only owners can create halls" }, { status: 403 });
    }

    const formData = await request.formData();

    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const area = String(formData.get("area") ?? "").trim();
    const contactPhone = String(formData.get("contactPhone") ?? "").trim();
    const capacity = Number(formData.get("capacity") ?? 0);
    const pricePerHead = formData.get("pricePerHead") ? String(formData.get("pricePerHead")) : null;
    const pricePerDay = formData.get("pricePerDay") ? String(formData.get("pricePerDay")) : null;
    const hasParking = String(formData.get("hasParking") ?? "false") === "true";
    const hasAC = String(formData.get("hasAC") ?? "false") === "true";
    const hasCatering = String(formData.get("hasCatering") ?? "false") === "true";

    if (!name || !address || !city || !capacity) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const imageUrls: string[] = [];

    // Upload images to Cloudinary
    const images = formData.getAll("images");
    for (const img of images) {
      if (!(img instanceof File) || img.size === 0) continue;

      try {
        const buffer = Buffer.from(await img.arrayBuffer());
        const fileName = sanitizeFileName(img.name || `hall-image-${Date.now()}`);
        const cloudinaryUrl = await uploadToCloudinary(
          buffer,
          fileName,
          `halls/${session.user.id}`,
        );
        imageUrls.push(cloudinaryUrl);
      } catch (uploadError: any) {
        return NextResponse.json(
          { message: `Image upload failed: ${uploadError.message}` },
          { status: 500 },
        );
      }
    }

    const slug = await generateUniqueSlug(name);

    const created = await prisma.hall.create({
      data: {
        id: slug,
        ownerId: session.user.id,
        slug,
        name,
        description: description || null,
        imageUrls,
        address,
        city,
        area: area || null,
        capacity,
        pricePerHead: pricePerHead ? pricePerHead : null,
        pricePerDay: pricePerDay || "0.00",
        hasParking,
        hasAC,
        hasCatering,
        status: "PENDING",
        isVerified: false,
      },
    });

    return NextResponse.json({ id: created.id, slug: created.slug ?? null });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to create hall: ${error.message}` },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER") {
    return NextResponse.json({ message: "Only owners can update halls" }, { status: 403 });
  }

  const body = await request.json();
  const { hallId, name, ...rest } = body;

  if (!hallId) {
    return NextResponse.json({ message: "Missing hallId" }, { status: 400 });
  }

  const hall = await prisma.hall.findUnique({ where: { id: hallId } });
  if (!hall) {
    return NextResponse.json({ message: "Hall not found" }, { status: 404 });
  }
  if (hall.ownerId !== session.user.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let slug = hall.slug;
  if (name && name !== hall.name) {
    slug = await generateUniqueSlug(name);
  }

  const updated = await prisma.hall.update({
    where: { id: hallId },
    data: {
      name: name ?? hall.name,
      slug,
      // Note: We don't change hall.id after creation to avoid breaking relations
      ...rest,
    },
  });

  return NextResponse.json({ id: updated.id, slug: updated.slug ?? null });
}
