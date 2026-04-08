"use client";

import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (query) params.set("q", query);
    router.push(`/halls?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="relative mx-auto mt-10 flex w-full max-w-3xl flex-col divide-y divide-zinc-200 overflow-hidden rounded-3xl border border-white/20 bg-white/90 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] md:flex-row md:divide-x md:divide-y-0"
    >
      <div className="flex flex-1 items-center gap-3 px-4 py-3">
        <MapPin className="h-5 w-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Which city are you in?"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
        />
      </div>
      
      <div className="flex flex-[1.2] items-center gap-3 px-4 py-3">
        <Search className="h-5 w-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search hall name or area..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
        />
      </div>

      <button
        type="submit"
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#014421] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#013220] active:scale-95"
      >
        <span className="relative z-10 flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Halls
        </span>
        <div className="absolute inset-0 z-0 bg-linear-to-r from-emerald-600/0 via-white/10 to-emerald-600/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      </button>
    </form>
  );
}
