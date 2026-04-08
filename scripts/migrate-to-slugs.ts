// @ts-ignore
if (typeof process.loadEnvFile === 'function') {
  // @ts-ignore
  process.loadEnvFile('.env');
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 100);
}

async function generateUniqueSlug(base: string, idToIgnore?: string) {
  let slug = slugify(base);
  let exists = await prisma.hall.findFirst({ 
    where: { 
      slug,
      NOT: idToIgnore ? { id: idToIgnore } : undefined
    } 
  });
  let suffix = 1;
  while (exists) {
    const candidate = `${slug}-${suffix}`;
    exists = await prisma.hall.findFirst({ 
      where: { 
        slug: candidate,
        NOT: idToIgnore ? { id: idToIgnore } : undefined
      } 
    });
    if (!exists) {
      slug = candidate;
      break;
    }
    suffix += 1;
  }
  return slug;
}

async function main() {
  console.log("Starting migration: Syncing Hall IDs and Slugs with names...");

  const halls = await prisma.hall.findMany({
    include: {
      bookings: true,
      locks: true,
    },
  });

  for (const hall of halls) {
    const targetSlug = await generateUniqueSlug(hall.name, hall.id);
    console.log(`Processing hall: ${hall.name} (${hall.id}) -> Target Slug: ${targetSlug}`);

    // If ID already matches slug and slug is correct, skip
    if (hall.id === targetSlug && hall.slug === targetSlug) {
      console.log(`  Skipping: Already matches.`);
      continue;
    }

    // Step 1: Ensure slug field is populated (temporary if we're changing ID)
    await prisma.hall.update({
      where: { id: hall.id },
      data: { slug: targetSlug },
    });

    // Step 2: If we want to change the ID, we must create a new record and delete the old one
    // OR use raw query if Prisma doesn't support updating @id directly easily.
    // Since we have relations (bookings, locks) with ON UPDATE CASCADE (default),
    // a raw UPDATE query on the IDs should work if the DB supports it.
    
    // However, some DBs don't propagate ID changes well if not configured.
    // Let's use a safer approach for this environment: raw SQL update if it's Postgres.
    try {
      // Postgres supports updating primary keys and cascading if the constraint is set.
      // We'll update the ID directly.
      await prisma.$executeRawUnsafe(`UPDATE "Hall" SET id = $1 WHERE id = $2`, targetSlug, hall.id);
      console.log(`  Success: ID updated to ${targetSlug}`);
    } catch (error) {
      console.error(`  Error updating ID for ${hall.name}:`, error);
      // Fallback: If it's a seed or fresh DB, we might want to just keep the slug field.
      // But the user specifically asked for ID to be the name.
    }
  }

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
