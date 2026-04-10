"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FormFields = ({ name, setName, description, setDescription, address, setAddress, city, setCity, area, setArea, contactPhone, setContactPhone, capacity, setCapacity, pricePerHead, setPricePerHead, pricePerDay, setPricePerDay, hasParking, setHasParking, hasAC, setHasAC, hasCatering, setHasCatering, images, setImages, error, loading, handleSubmit, handleFiles }: any) => (
  <form onSubmit={handleSubmit} className="space-y-6 md:space-y-7">
    <label className="block">
      <span className="text-sm font-medium text-zinc-700 block mb-2">Hall name</span>
      <input className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Grand Orchid Events" value={name} onChange={(e)=>setName(e.target.value)} required />
    </label>

    <label className="block">
      <span className="text-sm font-medium text-zinc-700 block mb-2">Short description</span>
      <textarea className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" rows={4} placeholder="A brief description for customers." value={description} onChange={(e)=>setDescription(e.target.value)} />
    </label>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <label>
        <span className="text-sm font-medium text-zinc-700 block mb-2">Address</span>
        <input className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="123 Main Boulevard" value={address} onChange={(e)=>setAddress(e.target.value)} required />
      </label>

      <label>
        <span className="text-sm font-medium text-zinc-700 block mb-2">City</span>
        <input className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Lahore" value={city} onChange={(e)=>setCity(e.target.value)} required />
      </label>

      <label>
        <span className="text-sm font-medium text-zinc-700 block mb-2">Area / Neighborhood</span>
        <input className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Johar Town" value={area} onChange={(e)=>setArea(e.target.value)} />
      </label>

      <label>
        <span className="text-sm font-medium text-zinc-700 block mb-2">Contact phone</span>
        <input className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="+92 300 0000000" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} />
      </label>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <label>
        <span className="text-sm font-medium text-zinc-700 block mb-2">Capacity (guests)</span>
        <input type="number" min={1} className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" value={capacity} onChange={(e)=>setCapacity(Number(e.target.value))} required />
      </label>

      <label>
        <span className="text-sm font-medium text-zinc-700 block mb-2">Price per head (PKR)</span>
        <input type="number" min={0} className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" value={pricePerHead} onChange={(e)=>setPricePerHead(Number(e.target.value))} />
      </label>

      <label>
        <span className="text-sm font-medium text-zinc-700 block mb-2">Price per day (PKR)</span>
        <input type="number" min={0} className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" value={pricePerDay} onChange={(e)=>setPricePerDay(Number(e.target.value))} />
      </label>
    </div>

    <div className="bg-zinc-50 rounded-lg p-5 border border-zinc-200">
      <p className="text-sm font-medium text-zinc-700 block mb-4">Amenities</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="inline-flex items-center gap-3 p-3 rounded-md border border-zinc-300 bg-white hover:bg-zinc-50 cursor-pointer transition-colors">
          <input type="checkbox" checked={hasParking} onChange={(e)=>setHasParking(e.target.checked)} className="rounded w-4 h-4 cursor-pointer" />
          <span className="text-sm text-zinc-700 font-medium">Parking</span>
        </label>
        <label className="inline-flex items-center gap-3 p-3 rounded-md border border-zinc-300 bg-white hover:bg-zinc-50 cursor-pointer transition-colors">
          <input type="checkbox" checked={hasAC} onChange={(e)=>setHasAC(e.target.checked)} className="rounded w-4 h-4 cursor-pointer" />
          <span className="text-sm text-zinc-700 font-medium">Air conditioning</span>
        </label>
        <label className="inline-flex items-center gap-3 p-3 rounded-md border border-zinc-300 bg-white hover:bg-zinc-50 cursor-pointer transition-colors">
          <input type="checkbox" checked={hasCatering} onChange={(e)=>setHasCatering(e.target.checked)} className="rounded w-4 h-4 cursor-pointer" />
          <span className="text-sm text-zinc-700 font-medium">On-site catering</span>
        </label>
      </div>
    </div>

    <div>
      <label className="block">
        <span className="text-sm font-medium text-zinc-700 block mb-2">Photos (upload multiple)</span>
        <input type="file" multiple accept="image/*" onChange={(e)=>handleFiles(e.target.files)} className="w-full px-4 py-3 text-sm text-zinc-700 border border-zinc-300 rounded-lg cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
      </label>
      {images.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((file: any, idx: number) => (
            <div key={idx} className="h-28 w-full overflow-hidden rounded-lg shadow-sm border border-zinc-200">
              <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}
    </div>

    {error ? <div className="text-sm text-rose-600 bg-rose-50 p-4 rounded-lg border border-rose-200">{error}</div> : null}

    <div className="flex gap-3 pt-6">
      <button type="submit" disabled={loading} className="flex-1 sm:flex-none rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50">
        {loading ? "Creating..." : "Create hall"}
      </button>
      <a href="/dashboard/owner" className="flex-1 sm:flex-none rounded-lg border border-zinc-300 px-6 py-3 text-base font-semibold text-zinc-700 hover:bg-zinc-100 text-center transition-colors">Cancel</a>
    </div>
  </form>
);

export default function AddHallPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [pricePerHead, setPricePerHead] = useState(0);
  const [pricePerDay, setPricePerDay] = useState(0);
  const [hasParking, setHasParking] = useState(false);
  const [hasAC, setHasAC] = useState(false);
  const [hasCatering, setHasCatering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setImages(Array.from(files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("description", description);
      fd.append("address", address);
      fd.append("city", city);
      fd.append("area", area);
      fd.append("contactPhone", contactPhone);
      fd.append("capacity", String(capacity));
      fd.append("pricePerHead", String(pricePerHead));
      fd.append("pricePerDay", String(pricePerDay));
      fd.append("hasParking", String(hasParking));
      fd.append("hasAC", String(hasAC));
      fd.append("hasCatering", String(hasCatering));

      images.forEach((file) => fd.append("images", file));

      const res = await fetch("/api/owner/halls", { method: "POST", body: fd });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to create hall");
      }

      const body = await res.json();
      const target = body.slug ? `/halls/${body.slug}` : `/halls/${body.id}`;
      router.push(target);
    } catch (err: any) {
      setError(err.message || "Failed to create hall");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff8e7_0%,#f4efe5_38%,#ffffff_100%)]">
      <div className="px-4 py-6 md:px-10 md:py-12 pb-20 md:pb-12">
        <div className="mx-auto max-w-7xl">
          {/* Desktop layout with sidebar placeholder */}
          <div className="hidden md:flex gap-8">
            <div className="w-64 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl md:rounded-3xl bg-white/90 border border-black/10 p-6 md:p-10 shadow-sm">
                <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 mb-8">Add a new hall</h2>
                <FormFields {...{ name, setName, description, setDescription, address, setAddress, city, setCity, area, setArea, contactPhone, setContactPhone, capacity, setCapacity, pricePerHead, setPricePerHead, pricePerDay, setPricePerDay, hasParking, setHasParking, hasAC, setHasAC, hasCatering, setHasCatering, images, setImages, error, loading, handleSubmit, handleFiles }} />
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden">
            <div className="rounded-xl border border-black/10 bg-white/90 p-4 shadow-sm">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-6">Add a new hall</h2>
              <FormFields {...{ name, setName, description, setDescription, address, setAddress, city, setCity, area, setArea, contactPhone, setContactPhone, capacity, setCapacity, pricePerHead, setPricePerHead, pricePerDay, setPricePerDay, hasParking, setHasParking, hasAC, setHasAC, hasCatering, setHasCatering, images, setImages, error, loading, handleSubmit, handleFiles }} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
