"use client";

import { useTransition, useState } from "react";
import { deleteHall } from "@/app/actions/admin-actions";

type HallRow = {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
  pricePerDay: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
};

export function AdminHallsClient({ initialHalls }: { initialHalls: HallRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this hall listing?")) return;
    
    startTransition(async () => {
      setError(null);
      const res = await deleteHall(id);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">Live Listings</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Manage Approved Halls</h2>
        </div>
        <div className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
          {initialHalls.length} live
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-black/10 text-sm">
          <thead>
            <tr className="text-left text-zinc-500">
              <th className="px-4 py-3 font-medium">Hall</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Capacity / Price</th>
              <th className="px-4 py-3 font-medium">Listed</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {initialHalls.length > 0 ? (
              initialHalls.map((hall) => (
                <tr key={hall.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-medium text-zinc-950">{hall.name}</div>
                    <div className="mt-1 text-zinc-600">{hall.address}, {hall.city}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-zinc-900">{hall.ownerName}</div>
                    <div className="mt-1 text-zinc-600">{hall.ownerEmail}</div>
                  </td>
                  <td className="px-4 py-4 text-zinc-700">
                    <div>Cap: {hall.capacity}</div>
                    <div className="text-xs">PKR {hall.pricePerDay}</div>
                  </td>
                  <td className="px-4 py-4 text-zinc-700">{hall.createdAt}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(hall.id)}
                      className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  No live hall listings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
