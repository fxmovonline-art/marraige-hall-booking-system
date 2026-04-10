"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type PendingHall = {
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

type PendingOwnerApplication = {
  id: string;
  businessName: string;
  businessType: string;
  city: string;
  contactPhone: string;
  ownerName: string;
  ownerEmail: string;
  documentCount: number;
  documents: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    documentType: string;
  }>;
  createdAt: string;
};

type AdminComplaint = {
  id: string;
  subject: string;
  message: string;
  status: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
};

type Props = {
  initialPendingHalls: PendingHall[];
  initialPendingOwnerApplications: PendingOwnerApplication[];
  initialComplaints: AdminComplaint[];
};

type ReviewEntity = "hall" | "ownerApplication" | "complaint";
type ReviewDecision = "APPROVE" | "REJECT" | "RESOLVE";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminControlCenter({
  initialPendingHalls,
  initialPendingOwnerApplications,
  initialComplaints,
}: Props) {
  const router = useRouter();
  const [pendingHalls, setPendingHalls] = useState(initialPendingHalls);
  const [pendingOwnerApplications, setPendingOwnerApplications] = useState(
    initialPendingOwnerApplications,
  );
  const [complaints, setComplaints] = useState(initialComplaints);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reviewItem(
    entityType: ReviewEntity,
    entityId: string,
    decision: ReviewDecision,
  ) {
    setFeedback(null);
    setError(null);
    setActiveAction(`${entityType}:${entityId}:${decision}`);

    startTransition(async () => {
      let response;
      if (entityType === "complaint") {
        response = await fetch("/api/admin/complaints", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ complaintId: entityId, status: "RESOLVED" }),
        });
      } else {
        response = await fetch("/api/admin/review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ entityType, entityId, decision }),
        });
      }

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Unable to update status.");
        setActiveAction(null);
        return;
      }

      if (entityType === "hall") {
        setPendingHalls((items) =>
          items.filter((item) => item.id !== entityId),
        );
      } else if (entityType === "ownerApplication") {
        setPendingOwnerApplications((items) =>
          items.filter((item) => item.id !== entityId),
        );
      } else if (entityType === "complaint") {
        setComplaints((items) =>
          items.map((item) => item.id === entityId ? { ...item, status: "RESOLVED" } : item),
        );
      }

      setFeedback(
        `${entityType === "hall" ? "Hall listing" : entityType === "complaint" ? "Complaint" : "Owner application"} marked as ${decision.toLowerCase()}d.`,
      );
      setActiveAction(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {feedback ? (
        <div className="rounded-lg md:rounded-2xl border border-emerald-200 bg-emerald-50 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg md:rounded-2xl border border-red-200 bg-red-50 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Pending Halls Section */}
      <section className="rounded-xl md:rounded-[2rem] border border-black/10 bg-white p-4 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Pending halls
            </p>
            <h2 className="mt-1 md:mt-2 text-xl md:text-2xl font-semibold text-zinc-950">
              Hall listing approvals
            </h2>
          </div>
          <div className="rounded-full bg-zinc-100 px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium text-zinc-700 whitespace-nowrap">
            {pendingHalls.length} pending
          </div>
        </div>

        <div className="mt-4 md:mt-6 overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <table className="min-w-full divide-y divide-black/10 text-xs md:text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-2 md:px-4 py-2 md:py-3 font-medium">Hall</th>
                <th className="px-2 md:px-4 py-2 md:py-3 font-medium">Owner</th>
                <th className="hidden sm:table-cell px-2 md:px-4 py-2 md:py-3 font-medium">Capacity</th>
                <th className="hidden md:table-cell px-2 md:px-4 py-2 md:py-3 font-medium">Price</th>
                <th className="hidden lg:table-cell px-2 md:px-4 py-2 md:py-3 font-medium">Submitted</th>
                <th className="px-2 md:px-4 py-2 md:py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {pendingHalls.length > 0 ? (
                pendingHalls.map((hall) => (
                  <tr key={hall.id} className="align-top">
                    <td className="px-2 md:px-4 py-3 md:py-4">
                      <div className="font-medium text-zinc-950 text-xs md:text-sm">
                        {hall.name}
                      </div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {hall.address}, {hall.city}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-3 md:py-4">
                      <div className="font-medium text-zinc-900 text-xs md:text-sm">
                        {hall.ownerName}
                      </div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {hall.ownerEmail}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-2 md:px-4 py-3 md:py-4 text-zinc-700 text-xs md:text-sm">{hall.capacity}</td>
                    <td className="hidden md:table-cell px-2 md:px-4 py-3 md:py-4 text-zinc-700 text-xs md:text-sm">
                      {hall.pricePerDay}
                    </td>
                    <td className="hidden lg:table-cell px-2 md:px-4 py-3 md:py-4 text-zinc-700 text-xs md:text-sm">
                      {formatDate(hall.createdAt)}
                    </td>
                    <td className="px-2 md:px-4 py-3 md:py-4">
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => reviewItem("hall", hall.id, "APPROVE")}
                          className="rounded-full bg-emerald-600 px-2 md:px-4 py-1 md:py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {activeAction === `hall:${hall.id}:APPROVE`
                            ? "Approving..."
                            : "Approve"}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => reviewItem("hall", hall.id, "REJECT")}
                          className="rounded-full bg-red-600 px-2 md:px-4 py-1 md:py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                        >
                          {activeAction === `hall:${hall.id}:REJECT`
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-2 md:px-4 py-6 md:py-10 text-center text-zinc-500 text-xs md:text-sm"
                  >
                    No pending hall listings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pending Owners Section */}
      <section className="rounded-xl md:rounded-[2rem] border border-black/10 bg-white p-4 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Pending owners
            </p>
            <h2 className="mt-1 md:mt-2 text-xl md:text-2xl font-semibold text-zinc-950">
              Owner application approvals
            </h2>
          </div>
          <div className="rounded-full bg-zinc-100 px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium text-zinc-700 whitespace-nowrap">
            {pendingOwnerApplications.length} pending
          </div>
        </div>

        <div className="mt-4 md:mt-6 overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <table className="min-w-full divide-y divide-black/10 text-xs md:text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-2 md:px-4 py-2 md:py-3 font-medium">Business</th>
                <th className="px-2 md:px-4 py-2 md:py-3 font-medium">Owner</th>
                <th className="hidden sm:table-cell px-2 md:px-4 py-2 md:py-3 font-medium">Contact</th>
                <th className="hidden md:table-cell px-2 md:px-4 py-2 md:py-3 font-medium">Documents</th>
                <th className="hidden lg:table-cell px-2 md:px-4 py-2 md:py-3 font-medium">Submitted</th>
                <th className="px-2 md:px-4 py-2 md:py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {pendingOwnerApplications.length > 0 ? (
                pendingOwnerApplications.map((application) => (
                  <tr key={application.id} className="align-top">
                    <td className="px-2 md:px-4 py-3 md:py-4">
                      <div className="font-medium text-zinc-950 text-xs md:text-sm">
                        {application.businessName}
                      </div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {application.businessType} • {application.city}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-3 md:py-4">
                      <div className="font-medium text-zinc-900 text-xs md:text-sm">
                        {application.ownerName}
                      </div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {application.ownerEmail}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-2 md:px-4 py-3 md:py-4 text-zinc-700 text-xs md:text-sm">
                      {application.contactPhone}
                    </td>
                    <td className="hidden md:table-cell px-2 md:px-4 py-3 md:py-4">
                      <div className="space-y-1">
                        <div className="text-xs md:text-sm text-zinc-700">
                          {application.documentCount} linked
                        </div>
                        <div className="flex flex-col gap-1 md:gap-2">
                          {application.documents.map((document) => (
                            <a
                              key={document.id}
                              href={document.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4"
                            >
                              {document.documentType}: {document.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-zinc-700">
                      {formatDate(application.createdAt)}
                    </td>
                    <td className="px-2 md:px-4 py-3 md:py-4">
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            reviewItem(
                              "ownerApplication",
                              application.id,
                              "APPROVE",
                            )
                          }
                          className="rounded-full bg-emerald-600 px-2 md:px-4 py-1 md:py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {activeAction ===
                          `ownerApplication:${application.id}:APPROVE`
                            ? "Approving..."
                            : "Approve"}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            reviewItem(
                              "ownerApplication",
                              application.id,
                              "REJECT",
                            )
                          }
                          className="rounded-full bg-red-600 px-2 md:px-4 py-1 md:py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                        >
                          {activeAction ===
                          `ownerApplication:${application.id}:REJECT`
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-2 md:px-4 py-6 md:py-10 text-center text-zinc-500 text-xs md:text-sm"
                  >
                    No pending owner applications.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Complaints Section */}
      <section className="rounded-xl md:rounded-[2rem] border border-black/10 bg-white p-4 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">
              User Feedback
            </p>
            <h2 className="mt-1 md:mt-2 text-xl md:text-2xl font-semibold text-zinc-950">
              User Complaints
            </h2>
          </div>
          <div className="rounded-full bg-zinc-100 px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium text-zinc-700 whitespace-nowrap">
            {complaints.filter(c => c.status === "PENDING").length} pending
          </div>
        </div>

        <div className="mt-4 md:mt-6 overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <table className="min-w-full divide-y divide-black/10 text-xs md:text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-2 md:px-4 py-2 md:py-3 font-medium">Customer</th>
                <th className="hidden sm:table-cell px-2 md:px-4 py-2 md:py-3 font-medium">Subject</th>
                <th className="hidden md:table-cell px-2 md:px-4 py-2 md:py-3 font-medium">Message</th>
                <th className="px-2 md:px-4 py-2 md:py-3 font-medium">Status</th>
                <th className="hidden lg:table-cell px-2 md:px-4 py-2 md:py-3 font-medium">Submitted</th>
                <th className="px-2 md:px-4 py-2 md:py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {complaints.length > 0 ? (
                complaints.map((complaint) => (
                  <tr key={complaint.id} className="align-top">
                    <td className="px-2 md:px-4 py-3 md:py-4">
                      <div className="font-medium text-zinc-900 text-xs md:text-sm">
                        {complaint.customerName}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {complaint.customerEmail}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-2 md:px-4 py-3 md:py-4 max-w-xs">
                      <div className="font-semibold text-zinc-950 text-xs md:text-sm">
                        {complaint.subject}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-2 md:px-4 py-3 md:py-4 max-w-md">
                      <div className="text-zinc-600 leading-relaxed italic text-xs md:text-sm">
                        "{complaint.message}"
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-3 md:py-4">
                      <span className={`inline-flex items-center rounded-full px-2 md:px-2.5 py-0.5 text-xs font-bold ${
                        complaint.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-2 md:px-4 py-3 md:py-4 text-xs md:text-sm text-zinc-700">
                      {formatDate(complaint.createdAt)}
                    </td>
                    <td className="px-2 md:px-4 py-3 md:py-4">
                      {complaint.status === "PENDING" ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => reviewItem("complaint", complaint.id, "RESOLVE")}
                          className="rounded-full bg-zinc-950 px-2 md:px-4 py-1 md:py-2 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"
                        >
                          {activeAction === `complaint:${complaint.id}:RESOLVE`
                            ? "Resolving..."
                            : "Mark Resolved"}
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-400 font-medium">Handled</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-2 md:px-4 py-6 md:py-10 text-center text-zinc-500 text-xs md:text-sm"
                  >
                    No complaints registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
