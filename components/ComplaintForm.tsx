"use client";

import { useState } from "react";

type Props = {
  onSuccess: () => void;
  onCancel: () => void;
};

export default function ComplaintForm({ onSuccess, onCancel }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/user/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, message }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit complaint.");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/95 p-6 shadow-xl backdrop-blur-sm animate-in fade-in zoom-in duration-300">
      <h3 className="text-xl font-bold text-zinc-950 mb-4">Submit a Complaint</h3>
      <p className="text-sm text-zinc-600 mb-6">Describe the issue you're facing, and our admin team will review it.</p>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-zinc-800 mb-1">Subject</label>
          <input
            id="subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-green-600 transition-colors placeholder:text-zinc-400"
            placeholder="Brief subject of your complaint"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-zinc-800 mb-1">Message</label>
          <textarea
            id="message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-green-600 transition-colors placeholder:text-zinc-400"
            placeholder="Explain the situation in details..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:bg-zinc-400 transition-all shadow-md active:scale-95"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
