"use client";
import { cn } from "@/lib/utils";
import React from "react";

const marriageFaqs = [
  {
    question: "How do I book a marriage hall?",
    answer:
      "Browse our verified halls, select your preferred venue, and use our secure online booking system to reserve your date instantly.",
  },
  {
    question: "Can I visit the hall before booking?",
    answer:
      "Absolutely! You can schedule a visit to any hall through our platform before making your final decision.",
  },
  {
    question: "What services are included in the booking?",
    answer:
      "Most bookings include venue setup, basic decor, and on-site support. Additional services like catering, photography, and custom decor can be added.",
  },
  {
    question: "Is there a cancellation policy?",
    answer:
      "Yes, each hall has its own cancellation policy. Please review the terms on the hall's detail page or contact our support for more information.",
  },
];

export function MarriageFaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start justify-center gap-8 px-4 md:px-0 py-16">
      <img
        className="max-w-sm w-full rounded-xl h-auto shadow-lg object-cover"
        src="/images/logo.png"
        alt="Marriage Hall FAQ"
      />
      <div>
        <p className="text-indigo-600 text-sm font-medium">FAQ's</p>
        <h2 className="text-3xl font-semibold">Frequently Asked Questions</h2>
        <p className="text-sm text-slate-500 mt-2 pb-4">
          Everything you need to know about booking your perfect marriage event with us.
        </p>
        {marriageFaqs.map((faq, index) => (
          <div
            className="border-b border-slate-200 py-4 cursor-pointer"
            key={index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">{faq.question}</h3>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`${openIndex === index ? "rotate-180" : ""} transition-all duration-500 ease-in-out`}
              >
                <path
                  d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                  stroke="#1D293D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              className={`text-sm text-slate-500 transition-all duration-500 ease-in-out max-w-md ${openIndex === index ? "opacity-100 max-h-[300px] translate-y-0 pt-4" : "opacity-0 max-h-0 -translate-y-2"}`}
            >
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
