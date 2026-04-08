"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import BlobImage from "./BlobImage";

type PricingMode = "perHead" | "total";
type BookingSlot = "LUNCH" | "DINNER";

type AddOn = {
  id: string;
  label: string;
  price: number;
};

type HallPackage = {
  id: string;
  label: string;
  multiplier: number;
  description: string;
};

type Props = {
  hallId: string;
  hallName: string;
  imageUrls: string[];
  bookedSlots: Array<{
    eventDate: string;
    slot: BookingSlot;
  }>;
  basePricePerHead: number | null;
  basePricePerDay: number;
  defaultGuestCount: number;
  defaultContactName: string;
  defaultContactEmail: string;
};

type InvoicePayload = {
  hallName: string;
  bookingId: string;
  eventDate: string;
  slot: BookingSlot;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageName: string;
  addOns: string[];
  totalPrice: number;
  initialInstallmentAmount: number;
  remainingAmount: number;
};

const packages: HallPackage[] = [
  {
    id: "classic",
    label: "Classic",
    multiplier: 1,
    description: "Venue only with standard setup.",
  },
  {
    id: "signature",
    label: "Signature",
    multiplier: 1.2,
    description: "Includes decor upgrade and AC optimization.",
  },
  {
    id: "royal",
    label: "Royal",
    multiplier: 1.5,
    description: "Premium decor, full catering support, VIP flow.",
  },
];

const addOns: AddOn[] = [
  {
    id: "live-music",
    label: "Live Music Band",
    price: 85000,
  },
  {
    id: "premium-lighting",
    label: "Premium Lighting",
    price: 45000,
  },
  {
    id: "bridal-suite",
    label: "Bridal Suite",
    price: 30000,
  },
  {
    id: "valet",
    label: "Valet Parking",
    price: 20000,
  },
];

const slotLabels: Record<BookingSlot, string> = {
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

const stepLabels = ["Date & Slot", "Package & Add-ons", "Summary & Details"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function HallDetailClient({
  hallId,
  hallName,
  imageUrls,
  bookedSlots,
  basePricePerHead,
  basePricePerDay,
  defaultGuestCount,
  defaultContactName,
  defaultContactEmail,
}: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot>("LUNCH");
  const [guestCount, setGuestCount] = useState(defaultGuestCount);
  const [pricingMode, setPricingMode] = useState<PricingMode>(basePricePerHead ? "perHead" : "total");
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0].id);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [contactName, setContactName] = useState(defaultContactName);
  const [contactEmail, setContactEmail] = useState(defaultContactEmail);
  const [contactPhone, setContactPhone] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [lockId, setLockId] = useState<string | null>(null);
  const [lockExpiresAt, setLockExpiresAt] = useState<string | null>(null);
  const [lockNow, setLockNow] = useState(() => Date.now());
  const [isLocking, setIsLocking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedDateKey = useMemo(() => {
    if (!selectedDate) {
      return "";
    }

    return selectedDate.toISOString().slice(0, 10);
  }, [selectedDate]);

  const disabledDates = useMemo(
    () => bookedSlots.filter((entry) => entry.slot === selectedSlot).map((entry) => new Date(entry.eventDate)),
    [bookedSlots, selectedSlot],
  );

  const selectedPackage = packages.find((item) => item.id === selectedPackageId) ?? packages[0];
  const selectedAddOns = addOns.filter((item) => selectedAddOnIds.includes(item.id));

  const addOnTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const baseAmount = pricingMode === "perHead" && basePricePerHead ? basePricePerHead * guestCount : basePricePerDay;
  const packageAdjustedAmount = Math.round(baseAmount * selectedPackage.multiplier);
  const totalAmount = packageAdjustedAmount + addOnTotal;
  const initialInstallmentAmount = Math.round(totalAmount * 0.25);
  const remainingAmount = totalAmount - initialInstallmentAmount;

  const lockRemainingSeconds = useMemo(() => {
    if (!lockExpiresAt) {
      return 0;
    }

    const remaining = Math.floor((new Date(lockExpiresAt).getTime() - lockNow) / 1000);
    return remaining > 0 ? remaining : 0;
  }, [lockExpiresAt, lockNow]);

  const lockTimerLabel = useMemo(() => {
    const minutes = Math.floor(lockRemainingSeconds / 60);
    const seconds = lockRemainingSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [lockRemainingSeconds]);

  useEffect(() => {
    if (!lockExpiresAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setLockNow(Date.now());

      if (new Date(lockExpiresAt).getTime() <= Date.now()) {
        setLockId(null);
        setLockExpiresAt(null);
        setCurrentStep(1);
        setErrorMessage("Your 15-minute lock expired. Please reselect date and slot.");
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [lockExpiresAt]);

  useEffect(() => {
    return () => {
      if (!lockId) {
        return;
      }

      fetch("/api/bookings/lock", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lockId }),
      }).catch(() => undefined);
    };
  }, [lockId]);

  function showNextImage() {
    setActiveImageIndex((current) => (current + 1) % imageUrls.length);
  }

  function showPreviousImage() {
    setActiveImageIndex((current) => (current - 1 + imageUrls.length) % imageUrls.length);
  }

  function toggleAddOn(addOnId: string) {
    setSelectedAddOnIds((current) => {
      if (current.includes(addOnId)) {
        return current.filter((item) => item !== addOnId);
      }

      return [...current, addOnId];
    });
  }

  async function handleStepOneContinue() {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedDateKey) {
      setErrorMessage("Please select an event date.");
      return;
    }

    setIsLocking(true);

    try {
      if (lockId) {
        await fetch("/api/bookings/lock", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lockId }),
        }).catch(() => undefined);
      }

      const response = await fetch("/api/bookings/lock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hallId,
          eventDate: selectedDateKey,
          slot: selectedSlot,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(typeof data.error === "string" ? data.error : "Unable to lock this slot.");
        return;
      }

      setLockId(typeof data.lockId === "string" ? data.lockId : null);
      setLockExpiresAt(typeof data.expiresAt === "string" ? data.expiresAt : null);
      setLockNow(Date.now());
      setCurrentStep(2);
    } finally {
      setIsLocking(false);
    }
  }

  function handleStepTwoContinue() {
    if (!lockId || !lockExpiresAt || lockRemainingSeconds <= 0) {
      setErrorMessage("Your slot lock is missing or expired. Please choose date and slot again.");
      setCurrentStep(1);
      return;
    }

    setErrorMessage(null);
    setCurrentStep(3);
  }

  async function handleBookingSubmit() {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedDateKey || !lockId || !lockExpiresAt || lockRemainingSeconds <= 0) {
      setErrorMessage("Your slot lock expired. Please restart from Step 1.");
      setCurrentStep(1);
      return;
    }

    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      setErrorMessage("Please provide name, email, and phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hallId,
          eventDate: selectedDateKey,
          slot: selectedSlot,
          guestCount,
          totalPrice: totalAmount,
          packageName: selectedPackage.label,
          addOns: selectedAddOns.map((item) => item.label),
          contactName,
          contactEmail,
          contactPhone,
          specialNotes,
          paymentMethod: "CARD",
        }),
      });

      const data = await response.json().catch(() => ({})) as {
        error?: string;
        invoice?: InvoicePayload;
      };

      if (!response.ok) {
        setErrorMessage(typeof data.error === "string" ? data.error : "Booking submission failed.");
        if (response.status === 409) {
          setCurrentStep(1);
          setLockId(null);
          setLockExpiresAt(null);
        }
        return;
      }

      if (data.invoice) {
        await generateInvoicePdf(data.invoice);
      }

      setSuccessMessage("Booking request submitted with PENDING_CONFIRMATION status.");
      setLockId(null);
      setLockExpiresAt(null);
      setCurrentStep(1);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function generateInvoicePdf(invoice: InvoicePayload) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(18);
    doc.text("MHBS Invoice", 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Booking ID: ${invoice.bookingId}`, 14, y);
    y += 7;
    doc.text(`Hall: ${invoice.hallName}`, 14, y);
    y += 7;
    doc.text(`Event Date: ${new Date(invoice.eventDate).toLocaleDateString("en-PK")}`, 14, y);
    y += 7;
    doc.text(`Slot: ${slotLabels[invoice.slot]}`, 14, y);
    y += 10;

    doc.text(`Customer: ${invoice.customerName}`, 14, y);
    y += 7;
    doc.text(`Email: ${invoice.customerEmail}`, 14, y);
    y += 7;
    doc.text(`Phone: ${invoice.customerPhone}`, 14, y);
    y += 10;

    doc.text(`Package: ${invoice.packageName}`, 14, y);
    y += 7;
    doc.text(`Add-ons: ${invoice.addOns.length > 0 ? invoice.addOns.join(", ") : "None"}`, 14, y);
    y += 10;

    doc.text(`Total Booking Amount: ${formatCurrency(invoice.totalPrice)}`, 14, y);
    y += 7;
    doc.text(`Initial Installment (25%): ${formatCurrency(invoice.initialInstallmentAmount)}`, 14, y);
    y += 7;
    doc.text(`Remaining Amount: ${formatCurrency(invoice.remainingAmount)}`, 14, y);

    doc.save(`invoice-${invoice.bookingId}.pdf`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Debug panel: shows raw bookedSlots and selected state (remove in production) */}
      <div className="col-span-full">
        <details className="mb-4 rounded-md border border-black/10 bg-white p-3 text-sm">
          <summary className="cursor-pointer font-medium">Debug: Booking data (click to expand)</summary>
          <div className="mt-2 text-xs text-zinc-700">
            <div>bookedSlots.length: {bookedSlots?.length ?? 0}</div>
            <pre className="mt-2 max-h-64 overflow-auto text-[11px] bg-zinc-50 p-2">{JSON.stringify(bookedSlots, null, 2)}</pre>
            <div className="mt-2">selectedSlot: {selectedSlot}</div>
            <div>selectedDate: {selectedDate ? selectedDate.toISOString().slice(0,10) : "(none)"}</div>
          </div>
        </details>
      </div>
      <section className="space-y-8">
        <div className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex justify-center py-6">
            <BlobImage 
              src={imageUrls[activeImageIndex]} 
              alt={`${hallName} gallery image ${activeImageIndex + 1}`} 
              className="w-full max-w-md md:max-w-lg lg:max-w-xl text-[#014421]" 
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={showPreviousImage}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {imageUrls.map((imageUrl, index) => (
                <button
                  key={imageUrl}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-2.5 w-8 rounded-full transition ${
                    index === activeImageIndex ? "bg-zinc-900" : "bg-zinc-300"
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={showNextImage}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Next
            </button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-950">Availability Calendar</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Booked dates are disabled for the selected slot in Step 1.
          </p>
          <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">
            Current slot: <span className="font-semibold">{slotLabels[selectedSlot]}</span>
          </div>
          <div className="mt-5 overflow-x-auto">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDates}
              fromDate={new Date()}
            />
          </div>
          {/* Booked dates list (visible to owner / debug) */}
          {bookedSlots.length > 0 ? (
            <div className="mt-4 rounded-md border border-black/5 bg-white p-3 text-sm text-zinc-700">
              <div className="font-semibold text-zinc-900">Booked Dates (by slot)</div>
              <ul className="mt-2 space-y-1">
                {bookedSlots.slice(0, 10).map((b) => (
                  <li key={`${b.eventDate}-${b.slot}`}>
                    {new Date(b.eventDate).toLocaleDateString("en-PK")} — {slotLabels[b.slot]}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-950">Booking Wizard</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Complete 3 steps to request your booking. Selected slot stays locked for 15 minutes.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isDone = stepNumber < currentStep;

              return (
                <div
                  key={label}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                    isActive
                      ? "bg-zinc-900 text-white"
                      : isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {stepNumber}. {label}
                </div>
              );
            })}
          </div>

          {lockExpiresAt && lockRemainingSeconds > 0 ? (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Slot lock active for {lockTimerLabel}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-6 space-y-5">
            {currentStep === 1 ? (
              <>
                <div>
                  <p className="text-sm font-medium text-zinc-800">Select slot</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm text-zinc-900">
                      <input
                        type="radio"
                        name="slot"
                        value="LUNCH"
                        checked={selectedSlot === "LUNCH"}
                        onChange={() => setSelectedSlot("LUNCH")}
                      />
                      Lunch
                    </label>
                    <label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm text-zinc-900">
                      <input
                        type="radio"
                        name="slot"
                        value="DINNER"
                        checked={selectedSlot === "DINNER"}
                        onChange={() => setSelectedSlot("DINNER")}
                      />
                      Dinner
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-800">Select event date</p>
                  <div className="mt-3 overflow-x-auto rounded-xl border border-black/10 p-3">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={disabledDates}
                      fromDate={new Date()}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStepOneContinue}
                  disabled={isLocking}
                  className="w-full rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {isLocking ? "Locking..." : "Continue to Step 2"}
                </button>
              </>
            ) : null}

            {currentStep === 2 ? (
              <>
                <div>
                  <p className="text-sm font-medium text-zinc-800">Pricing mode</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm text-zinc-900">
                      <input
                        type="radio"
                        name="pricingMode"
                        value="total"
                        checked={pricingMode === "total"}
                        onChange={() => setPricingMode("total")}
                      />
                      Total
                    </label>
                    <label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm text-zinc-900">
                      <input
                        type="radio"
                        name="pricingMode"
                        value="perHead"
                        checked={pricingMode === "perHead"}
                        onChange={() => setPricingMode("perHead")}
                        disabled={!basePricePerHead}
                      />
                      Per-head
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="guestCount" className="text-sm font-medium text-zinc-800">
                    Guest count
                  </label>
                  <input
                    id="guestCount"
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setGuestCount(Number.isFinite(value) && value > 0 ? value : 1);
                    }}
                    className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-800">Select package</p>
                  <div className="mt-2 space-y-2">
                    {packages.map((item) => (
                      <label
                        key={item.id}
                        className={`block rounded-xl border p-3 transition ${
                          selectedPackageId === item.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-black/10"
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>{item.label}</span>
                          <span>x{item.multiplier}</span>
                        </div>
                        <p className={`mt-1 text-xs ${selectedPackageId === item.id ? "text-white/80" : "text-zinc-600"}`}>
                          {item.description}
                        </p>
                        <input
                          className="hidden"
                          type="radio"
                          name="package"
                          value={item.id}
                          checked={selectedPackageId === item.id}
                          onChange={() => setSelectedPackageId(item.id)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-800">Add-ons</p>
                  <div className="mt-2 space-y-2">
                    {addOns.map((item) => (
                      <label key={item.id} className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm text-zinc-900">
                        <span>{item.label}</span>
                        <span className="flex items-center gap-3">
                          <span>{formatCurrency(item.price)}</span>
                          <input
                            type="checkbox"
                            checked={selectedAddOnIds.includes(item.id)}
                            onChange={() => toggleAddOn(item.id)}
                          />
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStepTwoContinue}
                    className="w-full rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                  >
                    Continue to Step 3
                  </button>
                </div>
              </>
            ) : null}

            {currentStep === 3 ? (
              <>
                <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
                  <p><span className="font-semibold text-zinc-900">Date:</span> {selectedDate?.toLocaleDateString("en-PK", { dateStyle: "full" }) ?? "Not selected"}</p>
                  <p className="mt-1"><span className="font-semibold text-zinc-900">Slot:</span> {slotLabels[selectedSlot]}</p>
                  <p className="mt-1"><span className="font-semibold text-zinc-900">Package:</span> {selectedPackage.label}</p>
                  <p className="mt-1"><span className="font-semibold text-zinc-900">Add-ons:</span> {selectedAddOns.length > 0 ? selectedAddOns.map((item) => item.label).join(", ") : "None"}</p>
                  <p className="mt-1"><span className="font-semibold text-zinc-900">Guests:</span> {guestCount}</p>
                </div>

                <div>
                  <label htmlFor="contactName" className="text-sm font-medium text-zinc-800">Full name</label>
                  <input
                    id="contactName"
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="text-sm font-medium text-zinc-800">Email</label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="text-sm font-medium text-zinc-800">Phone</label>
                  <input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label htmlFor="specialNotes" className="text-sm font-medium text-zinc-800">Special notes</label>
                  <textarea
                    id="specialNotes"
                    value={specialNotes}
                    onChange={(event) => setSpecialNotes(event.target.value)}
                    className="mt-2 min-h-24 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-zinc-900"
                  />
                </div>

                <div className="rounded-2xl bg-zinc-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Estimated Total</div>
                  <div className="mt-2 text-3xl font-semibold text-zinc-950">{formatCurrency(totalAmount)}</div>
                  <p className="mt-2 text-xs text-zinc-600">
                    Base {pricingMode === "perHead" && basePricePerHead
                      ? `${formatCurrency(basePricePerHead)} per guest`
                      : `${formatCurrency(basePricePerDay)} fixed`} with {selectedPackage.label} package and {selectedAddOns.length} add-on(s).
                  </p>
                  <p className="mt-2 text-xs text-zinc-700">
                    Pay now (25%): <span className="font-semibold">{formatCurrency(initialInstallmentAmount)}</span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Remaining after booking: {formatCurrency(remainingAmount)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                  >
                    {isSubmitting ? "Processing Payment..." : `Pay ${formatCurrency(initialInstallmentAmount)} & Submit`}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
