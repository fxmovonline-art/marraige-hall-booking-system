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
import { hash } from "bcryptjs";

import { prisma } from "../lib/prisma";

async function main() {
  const adminPasswordHash = await hash("Admin@123", 10);
  const ownerPasswordHash = await hash("Owner@123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@mhbs.local" },
    update: {
      name: "System Admin",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    create: {
      name: "System Admin",
      email: "admin@mhbs.local",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
  });

  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@mhbs.local" },
    update: {
      name: "Prime Venues",
      role: "OWNER",
      passwordHash: ownerPasswordHash,
    },
    create: {
      name: "Prime Venues",
      email: "owner@mhbs.local",
      role: "OWNER",
      passwordHash: ownerPasswordHash,
    },
  });

  await prisma.ownerProfile.upsert({
    where: { userId: ownerUser.id },
    update: {
      businessName: "Prime Venues",
      businessType: "Marriage Hall Operator",
      contactPhone: "+92 300 1112233",
      address: "45 Garden Town Main Boulevard",
      city: "Lahore",
      status: "APPROVED",
      isVerified: true,
    },
    create: {
      userId: ownerUser.id,
      businessName: "Prime Venues",
      businessType: "Marriage Hall Operator",
      contactPhone: "+92 300 1112233",
      address: "45 Garden Town Main Boulevard",
      city: "Lahore",
      status: "APPROVED",
      isVerified: true,
    },
  });

  const hallSeedData = [
    {
      name: "Royal Orchid Banquet",
      description: "Elegant indoor venue for premium wedding events.",
      imageUrls: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
      ],
      address: "12 Canal View Road",
      city: "Lahore",
      area: "Gulberg",
      capacity: 700,
      pricePerHead: "3500",
      pricePerDay: "320000",
      hasParking: true,
      hasAC: true,
      hasCatering: true,
    },
    {
      name: "Grand Sapphire Hall",
      description: "Spacious hall with dedicated bridal lounge and parking.",
      imageUrls: [
        "https://images.unsplash.com/photo-1478144592103-25e218a04891?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=80",
      ],
      address: "9 Main Ring Road",
      city: "Islamabad",
      area: "F-8",
      capacity: 950,
      pricePerHead: "4200",
      pricePerDay: "410000",
      hasParking: true,
      hasAC: true,
      hasCatering: false,
    },
    {
      name: "Palm Signature Marquee",
      description: "Hybrid marquee setup with climate control and stage lighting.",
      imageUrls: [
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1510070009289-b5bc34383727?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=80",
      ],
      address: "88 University Avenue",
      city: "Karachi",
      area: "DHA",
      capacity: 1200,
      pricePerHead: "4800",
      pricePerDay: "500000",
      hasParking: true,
      hasAC: false,
      hasCatering: true,
    },
  ];

  for (const hall of hallSeedData) {
    const existingHall = await prisma.hall.findFirst({
      where: {
        name: hall.name,
        ownerId: ownerUser.id,
      },
      select: {
        id: true,
      },
    });

    const slug = await generateUniqueSlug(hall.name);
    if (existingHall) {
      await prisma.hall.update({
        where: { id: existingHall.id },
        data: {
          slug,
          description: hall.description,
          imageUrls: hall.imageUrls,
          address: hall.address,
          city: hall.city,
          area: hall.area,
          capacity: hall.capacity,
          pricePerHead: hall.pricePerHead,
          pricePerDay: hall.pricePerDay,
          hasParking: hall.hasParking,
          hasAC: hall.hasAC,
          hasCatering: hall.hasCatering,
          status: "APPROVED",
          isVerified: true,
        },
      });
      continue;
    }

    await prisma.hall.create({
      data: {
        id: slug,
        ownerId: ownerUser.id,
        slug,
        name: hall.name,
        description: hall.description,
        imageUrls: hall.imageUrls,
        address: hall.address,
        city: hall.city,
        area: hall.area,
        capacity: hall.capacity,
        pricePerHead: hall.pricePerHead,
        pricePerDay: hall.pricePerDay,
        hasParking: hall.hasParking,
        hasAC: hall.hasAC,
        hasCatering: hall.hasCatering,
        status: "APPROVED",
        isVerified: true,
      },
    });
  }

  console.log("Seed complete", {
    adminEmail: adminUser.email,
    ownerEmail: ownerUser.email,
    hallsSeeded: hallSeedData.length,
  });
}

main()
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
