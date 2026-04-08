// Script to add slugs to all existing halls in the database
import { prisma } from "../lib/prisma";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 100);
}

async function generateUniqueSlug(base: string): Promise<string> {
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

async function main() {
  const halls = await prisma.hall.findMany();
  for (const hall of halls) {
    if (!hall.slug && hall.name) {
      const slug = await generateUniqueSlug(hall.name);
      await prisma.hall.update({
        where: { id: hall.id },
        data: { slug },
      });
      console.log(`Updated hall ${hall.name} with slug: ${slug}`);
    }
  }
  console.log("Migration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
