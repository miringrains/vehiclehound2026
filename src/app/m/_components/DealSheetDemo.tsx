"use client";

import { motion } from "framer-motion";
import { Car } from "lucide-react";

const options = [
  {
    label: "Option A",
    type: "Finance",
    term: "60 mo",
    vehicle: "2025 BMW 330i",
    monthly: "$487",
    rows: [
      ["Selling Price", "$42,500"],
      ["Down Payment", "$5,000"],
      ["APR", "5.49%"],
      ["Amount Financed", "$39,425"],
      ["Total Cost", "$49,210"],
    ],
  },
  {
    label: "Option B",
    type: "Finance",
    term: "72 mo",
    vehicle: "2025 BMW 330i",
    monthly: "$421",
    rows: [
      ["Selling Price", "$42,500"],
      ["Down Payment", "$5,000"],
      ["APR", "6.29%"],
      ["Amount Financed", "$39,425"],
      ["Total Cost", "$52,332"],
    ],
  },
  {
    label: "Option C",
    type: "Lease",
    term: "39 mo",
    vehicle: "2025 BMW 330i",
    monthly: "$429",
    rows: [
      ["Selling Price", "$42,500"],
      ["Down Payment", "$3,000"],
      ["Mileage", "7,500/yr"],
      ["Residual", "58%"],
      ["Due at Signing", "$4,248"],
    ],
  },
];

export function DealSheetDemo() {
  return (
    <div className="rounded-b-lg overflow-hidden bg-[#0a0a0c] p-4 md:p-5">
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.4 }}
        className="mb-3 flex items-center justify-between"
      >
        <div>
          <p className="text-[10px] font-semibold text-white">Deal Comparison — John Smith</p>
          <p className="text-[7px] text-white/40">Created just now · 3 options</p>
        </div>
        <div className="flex gap-1.5">
          <div className="rounded-md border border-white/[0.08] px-2 py-0.5 text-[7px] text-white/50">Export PDF</div>
          <div className="rounded-md bg-violet-600 px-2 py-0.5 text-[7px] text-white">Send to Customer</div>
        </div>
      </motion.div>

      {/* Option cards */}
      <div className="flex gap-2 overflow-hidden">
        {options.map((opt, i) => (
          <motion.div
            key={opt.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-[#111113] overflow-hidden"
          >
            {/* Card header */}
            <div className="border-b border-white/[0.06] px-3 py-2">
              <p className="text-[9px] font-medium text-white">{opt.label}</p>
              <p className="text-[7px] text-white/40">{opt.type} · {opt.term}</p>
            </div>

            <div className="p-3 space-y-2.5">
              {/* Vehicle */}
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-white/[0.05]">
                  <Car className="h-2.5 w-2.5 text-white/40" />
                </div>
                <p className="text-[8px] font-medium text-white/70">{opt.vehicle}</p>
              </div>

              {/* Monthly payment box */}
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.9 + i * 0.12, duration: 0.3 }}
                className="rounded-md border border-violet-500/10 bg-violet-500/[0.05] py-2 text-center"
              >
                <p className="text-base font-semibold text-violet-400">{opt.monthly}</p>
                <p className="text-[7px] text-white/30">per month</p>
              </motion.div>

              {/* Detail rows */}
              <div className="space-y-1">
                {opt.rows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[7px] text-white/35">{label}</span>
                    <span className="text-[7px] font-medium text-white/70">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
