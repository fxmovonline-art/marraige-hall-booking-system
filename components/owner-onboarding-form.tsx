"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";
type DocumentType = "BUSINESS_LICENSE" | "GOVERNMENT_ID" | "ADDRESS_PROOF" | "OTHER";

type ExistingDocument = {
  id: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
};

type InitialProfile = {
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;
  contactPhone: string;
  address: string;
  city: string;
  description: string;
  status: VerificationStatus;
  documents: ExistingDocument[];
} | null;

type StepKey = "business" | "contact" | "documents";

type FormState = {
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;
  contactPhone: string;
  address: string;
  city: string;
  description: string;
  businessLicense: File | null;
  governmentId: File | null;
  addressProof: File | null;
};

const steps: Array<{ key: StepKey; title: string; description: string }> = [
  {
    key: "business",
    title: "Business Profile",
    description: "Tell us about your company and how it operates.",
  },
  {
    key: "contact",
    title: "Contact Details",
    description: "Provide contact and location information for verification.",
  },
  {
    key: "documents",
    title: "Verification Documents",
    description: "Upload business and identity proof to complete onboarding.",
  },
];

function prettyStatus(status: VerificationStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function prettyDocumentType(documentType: DocumentType) {
  return documentType
    .split("_")
    .map((value) => value.charAt(0) + value.slice(1).toLowerCase())
    .join(" ");
}

export function OwnerOnboardingForm({ initialProfile }: { initialProfile: InitialProfile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus>(initialProfile?.status ?? "PENDING");
  const [existingDocuments, setExistingDocuments] = useState<ExistingDocument[]>(initialProfile?.documents ?? []);
  const [formState, setFormState] = useState<FormState>({
    businessName: initialProfile?.businessName ?? "",
    businessType: initialProfile?.businessType ?? "",
    registrationNumber: initialProfile?.registrationNumber ?? "",
    taxId: initialProfile?.taxId ?? "",
    contactPhone: initialProfile?.contactPhone ?? "",
    address: initialProfile?.address ?? "",
    city: initialProfile?.city ?? "",
    description: initialProfile?.description ?? "",
    businessLicense: null,
    governmentId: null,
    addressProof: null,
  });

  const hasExistingBusinessLicense = useMemo(
    () => existingDocuments.some((document) => document.documentType === "BUSINESS_LICENSE"),
    [existingDocuments],
  );
  const hasExistingGovernmentId = useMemo(
    () => existingDocuments.some((document) => document.documentType === "GOVERNMENT_ID"),
    [existingDocuments],
  );

  function updateField(field: keyof FormState, value: string | File | null) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateStep(stepIndex: number) {
    if (stepIndex === 0) {
      if (!formState.businessName || !formState.businessType) {
        return "Business name and business type are required.";
      }
    }

    if (stepIndex === 1) {
      if (!formState.contactPhone || !formState.address || !formState.city) {
        return "Contact phone, address, and city are required.";
      }
    }

    if (stepIndex === 2) {
      if (!hasExistingBusinessLicense && !formState.businessLicense) {
        return "Upload a business license to continue.";
      }

      if (!hasExistingGovernmentId && !formState.governmentId) {
        return "Upload a government ID to continue.";
      }
    }

    return null;
  }

  function goToNextStep() {
    const validationError = validateStep(currentStep);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function goToPreviousStep() {
    setErrorMessage(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateStep(2);

    if (validationError) {
      setErrorMessage(validationError);
      setCurrentStep(2);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = new FormData();

    payload.append("businessName", formState.businessName);
    payload.append("businessType", formState.businessType);
    payload.append("registrationNumber", formState.registrationNumber);
    payload.append("taxId", formState.taxId);
    payload.append("contactPhone", formState.contactPhone);
    payload.append("address", formState.address);
    payload.append("city", formState.city);
    payload.append("description", formState.description);

    if (formState.businessLicense) {
      payload.append("businessLicense", formState.businessLicense);
    }

    if (formState.governmentId) {
      payload.append("governmentId", formState.governmentId);
    }

    if (formState.addressProof) {
      payload.append("addressProof", formState.addressProof);
    }

    startTransition(async () => {
      const response = await fetch("/api/owner/onboarding", {
        method: "POST",
        body: payload,
      });

      const result = (await response.json()) as {
        error?: string;
        message?: string;
        profile?: {
          status: VerificationStatus;
          documents: ExistingDocument[];
        };
      };

      if (!response.ok) {
        setSuccessMessage(null);
        setErrorMessage(result.error ?? "Unable to submit onboarding details.");
        return;
      }

      setStatus(result.profile?.status ?? "PENDING");
      setExistingDocuments(result.profile?.documents ?? existingDocuments);
      setFormState((current) => ({
        ...current,
        businessLicense: null,
        governmentId: null,
        addressProof: null,
      }));
      setSuccessMessage(result.message ?? "Onboarding submitted.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Owner Verification
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              Complete your onboarding
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Submit your business details and verification documents. Your profile status remains pending until review is completed.
            </p>
          </div>
          <div className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            Status: {prettyStatus(status)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`rounded-3xl border p-5 text-left transition ${
                isActive
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : isComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-black/10 bg-white text-zinc-700"
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.24em] opacity-80">
                Step {index + 1}
              </div>
              <div className="mt-3 text-lg font-semibold">{step.title}</div>
              <p className="mt-2 text-sm leading-6 opacity-80">{step.description}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-zinc-950">{steps[currentStep].title}</h3>
          <p className="mt-2 text-sm text-zinc-600">{steps[currentStep].description}</p>
        </div>

        {currentStep === 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800">Business name</span>
              <input
                value={formState.businessName}
                onChange={(event) => updateField("businessName", event.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-zinc-950 text-zinc-900"
                placeholder="Grand Orchid Events"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800">Business type</span>
              <input
                value={formState.businessType}
                onChange={(event) => updateField("businessType", event.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-zinc-950 text-zinc-900"
                placeholder="Marriage hall management"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800">Registration number</span>
              <input
                value={formState.registrationNumber}
                onChange={(event) => updateField("registrationNumber", event.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-zinc-950 text-zinc-900"
                placeholder="REG-2026-001"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800">Tax ID</span>
              <input
                value={formState.taxId}
                onChange={(event) => updateField("taxId", event.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-zinc-950 text-zinc-900"
                placeholder="TIN-998877"
              />
            </label>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800">Contact phone</span>
              <input
                value={formState.contactPhone}
                onChange={(event) => updateField("contactPhone", event.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-zinc-950 text-zinc-900"
                placeholder="+92 300 0000000"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800">City</span>
              <input
                value={formState.city}
                onChange={(event) => updateField("city", event.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-zinc-950 text-zinc-900"
                placeholder="Lahore"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-zinc-800">Business address</span>
              <input
                value={formState.address}
                onChange={(event) => updateField("address", event.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-zinc-950 text-zinc-900"
                placeholder="123 Main Boulevard, Johar Town"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-zinc-800">Business description</span>
              <textarea
                value={formState.description}
                onChange={(event) => updateField("description", event.target.value)}
                  className="min-h-32 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none transition focus:border-zinc-950 text-zinc-900"
                placeholder="Describe your venue operations, services, and market position."
              />
            </label>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-800">Business license</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(event) => updateField("businessLicense", event.target.files?.[0] ?? null)}
                  className="w-full rounded-2xl border border-dashed border-black/20 px-4 py-3 text-sm text-zinc-900"
                />
                {hasExistingBusinessLicense ? (
                  <p className="text-xs text-emerald-700">Existing business license already linked to your profile.</p>
                ) : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-zinc-800">Government ID</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(event) => updateField("governmentId", event.target.files?.[0] ?? null)}
                    className="w-full rounded-2xl border border-dashed border-black/20 px-4 py-3 text-sm text-zinc-900"
                />
                {hasExistingGovernmentId ? (
                  <p className="text-xs text-emerald-700">Existing government ID already linked to your profile.</p>
                ) : null}
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-zinc-800">Address proof (optional)</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(event) => updateField("addressProof", event.target.files?.[0] ?? null)}
                  className="w-full rounded-2xl border border-dashed border-black/20 px-4 py-3 text-sm text-zinc-900"
                />
              </label>
            </div>

            <div className="rounded-3xl bg-zinc-50 p-5">
              <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Linked documents
              </h4>
              <div className="mt-4 grid gap-3">
                {existingDocuments.length > 0 ? (
                  existingDocuments.map((document) => (
                    <a
                      key={document.id}
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-700 transition hover:border-zinc-950"
                    >
                      <span>{prettyDocumentType(document.documentType)}</span>
                      <span className="truncate pl-4 text-zinc-500">{document.fileName}</span>
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">No verification documents linked yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={goToPreviousStep}
            disabled={currentStep === 0 || isPending}
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Submitting..." : "Submit for review"}
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
