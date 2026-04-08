import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { HallDetailClient } from "@/components/hall-detail-client";
import { prisma } from "@/lib/prisma";

type PageProps = {
	params: Promise<{ slug: string }>;
};

const fallbackImages = [
	"https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80",
	"https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80",
	"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
];

export default async function HallDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const session = await getServerSession(authOptions);

	// Try to find by slug first, fallback to id if not found
	let hall = await prisma.hall.findUnique({
		where: { slug },
		include: {
			owner: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			bookings: {
				select: {
					eventDate: true,
					slot: true,
				},
			},
		},
	});

	if (!hall) {
		// fallback: try to find by id if slug is not found
		hall = await prisma.hall.findUnique({
			where: { id: slug },
			include: {
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				bookings: {
					select: {
						eventDate: true,
						slot: true,
					},
				},
			},
		});
	}

	if (!hall) {
		notFound();
	}

	const isOwner = session?.user?.id && hall.owner?.id === session.user.id;

	// Only show unapproved/unverified halls to their owner (or admins later).
	if (!isOwner && (hall.status !== "APPROVED" || !hall.isVerified)) {
		notFound();
	}

	const bookedSlots = hall.bookings.map((booking) => ({
		eventDate: booking.eventDate.toISOString(),
		slot: booking.slot,
	}));
	const galleryImages = hall.imageUrls.length > 0 ? hall.imageUrls : fallbackImages;

	return (
		<main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10 md:px-10">
			<section className="mb-8 rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-sm">
				<p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Hall Details</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">{hall.name}</h1>
				<p className="mt-3 max-w-3xl text-base leading-8 text-zinc-600">
					{hall.description ?? "An approved and verified hall ready for your special event."}
				</p>
				<div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-700">
					<span className="rounded-full bg-zinc-100 px-3 py-1">{hall.address}</span>
					<span className="rounded-full bg-zinc-100 px-3 py-1">{hall.area ? `${hall.area}, ` : ""}{hall.city}</span>
					<span className="rounded-full bg-zinc-100 px-3 py-1">Capacity {hall.capacity}</span>
					<span className="rounded-full bg-zinc-100 px-3 py-1">Listed by {hall.owner.name}</span>
				</div>
			</section>

			<HallDetailClient
				hallId={hall.id}
				hallName={hall.name}
				imageUrls={galleryImages}
				bookedSlots={bookedSlots}
				basePricePerHead={hall.pricePerHead ? Number(hall.pricePerHead.toString()) : null}
				basePricePerDay={Number(hall.pricePerDay.toString())}
				defaultGuestCount={Math.min(400, hall.capacity)}
				defaultContactName={session?.user?.name ?? ""}
				defaultContactEmail={session?.user?.email ?? ""}
			/>
		</main>
	);
}

