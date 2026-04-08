import type { Prisma } from "@/app/generated/prisma/client";
import Link from "next/link";
import { HallImage } from "@/components/hall-image";
import { HallFilters } from "@/components/hall-filters";

import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

type SearchParamValue = string | string[] | undefined;

type PageProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

function getSingleValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parseNumber(value: string) {
  if (!value || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBooleanToggle(value: string) {
  return value === "1" || value === "true" || value === "on";
}

function toPrismaDecimalString(value: number) {
  return value.toFixed(2);
}

export default async function HallDiscoveryPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};

  const nameQuery = getSingleValue(params.q).trim();
  const city = getSingleValue(params.city).trim();
  const area = getSingleValue(params.area).trim();
  const minCapacity = parseNumber(getSingleValue(params.minCapacity));
  const maxCapacity = parseNumber(getSingleValue(params.maxCapacity));
  const minPrice = parseNumber(getSingleValue(params.minPrice));
  const maxPrice = parseNumber(getSingleValue(params.maxPrice));
  const priceMode = getSingleValue(params.priceMode) === "perHead" ? "perHead" : "total";
  const withParking = parseBooleanToggle(getSingleValue(params.parking));
  const withAC = parseBooleanToggle(getSingleValue(params.ac));
  const withCatering = parseBooleanToggle(getSingleValue(params.catering));
  const onlyApproved = parseBooleanToggle(getSingleValue(params.onlyApproved));

  // enforce public visibility rules: only show APPROVED and VERIFIED halls by default
  const andClauses: Prisma.HallWhereInput[] = [
    { status: "APPROVED" },
    { isVerified: true },
  ];

  // if the user explicitly unchecks 'onlyApproved', we might show all, but for now
  // let's follow the user's audit request: "Confirm only 'Approved' halls are visible"
  // so we keep these as base filters.

  if (city) {
    andClauses.push({
      city: {
        equals: city,
        mode: "insensitive",
      },
    });
  }

  if (area) {
    andClauses.push({
      area: {
        contains: area,
        mode: "insensitive",
      },
    });
  }

  if (typeof minCapacity === "number" || typeof maxCapacity === "number") {
    andClauses.push({
      capacity: {
        ...(typeof minCapacity === "number" ? { gte: minCapacity } : {}),
        ...(typeof maxCapacity === "number" ? { lte: maxCapacity } : {}),
      },
    });
  }

  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    const field = priceMode === "perHead" ? "pricePerHead" : "pricePerDay";

    andClauses.push({
      [field]: {
        ...(typeof minPrice === "number" ? { gte: toPrismaDecimalString(minPrice) } : {}),
        ...(typeof maxPrice === "number" ? { lte: toPrismaDecimalString(maxPrice) } : {}),
      },
    });
  }

  if (withParking) {
    andClauses.push({ hasParking: true });
  }

  if (withAC) {
    andClauses.push({ hasAC: true });
  }

  if (withCatering) {
    andClauses.push({ hasCatering: true });
  }

  if (nameQuery) {
    const tokens = nameQuery
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    andClauses.push({
      OR: [
        {
          name: {
            contains: nameQuery,
            mode: "insensitive",
          },
        },
        {
          AND: tokens.map((token) => ({
            name: {
              contains: token,
              mode: "insensitive",
            },
          })),
        },
      ],
    });
  }

  const where: Prisma.HallWhereInput = {
    AND: andClauses,
  };

  const [halls, cities] = await Promise.all([
    prisma.hall.findMany({
      where,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.hall.findMany({
      where: {
        status: "APPROVED",
      },
      select: {
        city: true,
      },
      distinct: ["city"],
      orderBy: {
        city: "asc",
      },
    }),
  ]);

  // helpful counts for debugging when no halls are returned due to approval filters
  const totalHallsCount = await prisma.hall.count();
  const approvedHallsCount = await prisma.hall.count({ where: { status: "APPROVED", isVerified: true } });

  const cityOptions = cities.map((entry) => entry.city);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10 md:px-10">
      <section className="mb-8 rounded-4xl border border-black/10 bg-white/80 p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Hall Discovery</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">Find your ideal wedding venue</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-600">
          Use advanced filters for city, area, capacity, budget, and amenities to narrow down approved halls quickly.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <HallFilters 
          cityOptions={cityOptions} 
          initialFilters={{
            q: nameQuery,
            city,
            area,
            minCapacity: typeof minCapacity === "number" ? String(minCapacity) : "",
            maxCapacity: typeof maxCapacity === "number" ? String(maxCapacity) : "",
            minPrice: typeof minPrice === "number" ? String(minPrice) : "",
            maxPrice: typeof maxPrice === "number" ? String(maxPrice) : "",
            priceMode,
            parking: withParking,
            ac: withAC,
            catering: withCatering,
            onlyApproved,
          }}
        />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-950">Matching Halls</h2>
            <div className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">{halls.length} results</div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {halls.length > 0 ? (
              halls.map((hall) => (
                <article key={hall.id} className="flex flex-col rounded-[1.4rem] border border-black/10 bg-white p-5 shadow-sm">
                  {hall.imageUrls && hall.imageUrls.length > 0 && (
                    <div className="mb-4 aspect-4/3 w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                      <HallImage 
                        src={hall.imageUrls[0]} 
                        alt={hall.name} 
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-zinc-950">{hall.name}</h3>
                  <p className="mt-2 text-sm text-zinc-600">{hall.address}, {hall.area ? `${hall.area}, ` : ""}{hall.city}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-zinc-50 px-3 py-2 text-zinc-700">Capacity: {hall.capacity}</div>
                    <div className="rounded-lg bg-zinc-50 px-3 py-2 text-zinc-700">Total: PKR {hall.pricePerDay.toString()}</div>
                    <div className="rounded-lg bg-zinc-50 px-3 py-2 text-zinc-700 col-span-2">
                      Per-head: {hall.pricePerHead ? `PKR ${hall.pricePerHead.toString()}` : "N/A"}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {hall.hasParking ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Parking</span> : null}
                    {hall.hasAC ? <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">AC</span> : null}
                    {hall.hasCatering ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Catering</span> : null}
                  </div>

                  <p className="mt-4 text-xs text-zinc-500">Listed by {hall.owner.name}</p>
                  <Link
                    href={`/halls/${hall.slug || hall.id}`}
                    className="mt-4 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    View Details
                  </Link>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-black/20 bg-white p-8 text-sm text-zinc-600 md:col-span-2 xl:col-span-3">
                <div className="mb-3 font-semibold">No halls match your filters.</div>
                <div className="text-sm text-zinc-600">Try widening the range or clearing some toggles.</div>
                <div className="mt-4 text-xs text-zinc-500">
                  Debug: There are {totalHallsCount} halls in the database, of which {approvedHallsCount} are approved & verified and shown publicly.
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
