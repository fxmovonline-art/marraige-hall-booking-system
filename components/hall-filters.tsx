"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";

type Props = {
  cityOptions: string[];
  initialFilters: {
    q: string;
    city: string;
    area: string;
    minCapacity: string;
    maxCapacity: string;
    minPrice: string;
    maxPrice: string;
    priceMode: string;
    parking: boolean;
    ac: boolean;
    catering: boolean;
    onlyApproved: boolean;
  };
};

export function HallFilters({ cityOptions, initialFilters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState(initialFilters);

  const applyFilters = (newFilters: typeof filters) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        if (value) params.set(key, "1");
        else params.delete(key);
      } else if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/halls?${params.toString()}`);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    const updated = { ...filters, [name]: newValue };
    setFilters(updated);
    
    // Auto-apply for checkboxes and selects
    if (type === "checkbox" || e.target.tagName === "SELECT") {
      applyFilters(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(filters);
  };

  return (
    <aside className={`h-fit rounded-3xl border border-black/10 bg-white p-6 shadow-sm transition-opacity ${isPending ? "opacity-70" : ""}`}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="q" className="text-sm font-medium text-zinc-800">Hall Name (Fuzzy search)</label>
          <input
            id="q"
            name="q"
            value={filters.q}
            onChange={handleChange}
            placeholder="e.g. royal orchid"
            className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="city" className="text-sm font-medium text-zinc-800">City</label>
          <select
            id="city"
            name="city"
            value={filters.city}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          >
            <option value="">All cities</option>
            {cityOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="area" className="text-sm font-medium text-zinc-800">Area</label>
          <input
            id="area"
            name="area"
            value={filters.area}
            onChange={handleChange}
            placeholder="e.g. DHA"
            className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="minCapacity" className="text-sm font-medium text-zinc-800">Min capacity</label>
            <input
              id="minCapacity"
              name="minCapacity"
              type="number"
              min={0}
              value={filters.minCapacity}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="maxCapacity" className="text-sm font-medium text-zinc-800">Max capacity</label>
            <input
              id="maxCapacity"
              name="maxCapacity"
              type="number"
              min={0}
              value={filters.maxCapacity}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-zinc-800">Price Mode</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm cursor-pointer">
              <input 
                type="radio" 
                name="priceMode" 
                value="total" 
                checked={filters.priceMode === "total"} 
                onChange={() => {
                  const updated = { ...filters, priceMode: "total" };
                  setFilters(updated);
                  applyFilters(updated);
                }} 
              />
              Total
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm cursor-pointer">
              <input 
                type="radio" 
                name="priceMode" 
                value="perHead" 
                checked={filters.priceMode === "perHead"} 
                onChange={() => {
                  const updated = { ...filters, priceMode: "perHead" };
                  setFilters(updated);
                  applyFilters(updated);
                }} 
              />
              Per-head
            </label>
          </div>
        
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                name="onlyApproved" 
                checked={filters.onlyApproved} 
                onChange={handleChange}
                className="rounded" 
              />
              <span className="text-sm text-zinc-700">Only approved & verified</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="minPrice" className="text-sm font-medium text-zinc-800">Min price</label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              min={0}
              value={filters.minPrice}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="text-sm font-medium text-zinc-800">Max price</label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min={0}
              value={filters.maxPrice}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-zinc-800">Amenities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${filters.parking ? "border-zinc-950 bg-zinc-950 text-white" : "border-black/15 text-zinc-700 hover:border-black/30"}`}>
              <input type="checkbox" name="parking" checked={filters.parking} onChange={handleChange} className="hidden" />
              Parking
            </label>
            <label className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${filters.ac ? "border-zinc-950 bg-zinc-950 text-white" : "border-black/15 text-zinc-700 hover:border-black/30"}`}>
              <input type="checkbox" name="ac" checked={filters.ac} onChange={handleChange} className="hidden" />
              AC
            </label>
            <label className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${filters.catering ? "border-zinc-950 bg-zinc-950 text-white" : "border-black/15 text-zinc-700 hover:border-black/30"}`}>
              <input type="checkbox" name="catering" checked={filters.catering} onChange={handleChange} className="hidden" />
              Catering
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            type="submit" 
            disabled={isPending}
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:bg-zinc-400"
          >
            {isPending ? "Applying..." : "Apply"}
          </button>
          <button
            type="button"
            onClick={() => {
              const reset = {
                q: "",
                city: "",
                area: "",
                minCapacity: "",
                maxCapacity: "",
                minPrice: "",
                maxPrice: "",
                priceMode: "total",
                parking: false,
                ac: false,
                catering: false,
                onlyApproved: false,
              };
              setFilters(reset);
              applyFilters(reset);
            }}
            className="inline-flex items-center justify-center rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Reset
          </button>
        </div>
      </form>
    </aside>
  );
}
