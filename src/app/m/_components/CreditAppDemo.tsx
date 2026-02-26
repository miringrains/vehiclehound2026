"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, CheckCircle2, Bell, ArrowRight } from "lucide-react";

const steps = [
  { icon: FileText, title: "Customer Fills Out Form", desc: "Branded credit app on your storefront or embedded on your site." },
  { icon: CheckCircle2, title: "Application Generated", desc: "Professional PDF with their license — auto-generated, no manual work." },
  { icon: Bell, title: "You Get Notified Instantly", desc: "Full application + docs delivered to your email and portal." },
];

const fields = [
  ["First Name", "Last Name"],
  ["Date of Birth", "SSN"],
  ["Phone", "Email"],
  ["Address", "City, State, Zip"],
  ["Employer", "Monthly Income"],
];

export function CreditAppDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 3), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-b-lg overflow-hidden bg-[#0a0a0c]">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Form preview */}
        <div className="p-4 md:p-5 border-r border-white/[0.06]">
          <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-3 overflow-hidden">
            <div className="mb-2 flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-violet-400" />
              <span className="text-[9px] font-semibold text-white">Credit Application</span>
            </div>
            <div className="space-y-1.5">
              {fields.map((row, ri) => (
                <motion.div
                  key={ri}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step === 0 ? 1 : 0.4 }}
                  transition={{ delay: ri * 0.08, duration: 0.3 }}
                  className="grid grid-cols-2 gap-1.5"
                >
                  {row.map((f) => (
                    <div key={f} className="rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1">
                      <p className="text-[6px] uppercase tracking-wider text-white/30">{f}</p>
                      <div className="mt-0.5 h-2 w-3/4 rounded bg-white/[0.06]" />
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
            <motion.div
              animate={{ opacity: step === 0 ? 1 : 0.4 }}
              className="mt-2 rounded-md bg-violet-600 py-1.5 text-center text-[8px] font-medium text-white"
            >
              Submit Application
            </motion.div>
          </div>
        </div>

        {/* Steps flow */}
        <div className="p-4 md:p-5 flex flex-col justify-center">
          <p className="mb-1 text-[9px] font-medium text-violet-400 uppercase tracking-widest">How it works</p>
          <p className="mb-4 text-[10px] text-white/50">From submission to your inbox in seconds.</p>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: i === step ? 1 : 0.3,
                  x: i === step ? 0 : 4,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-2.5"
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors duration-300"
                  style={{
                    background: i === step ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
                  }}
                >
                  <s.icon
                    className="h-3 w-3 transition-colors duration-300"
                    style={{ color: i === step ? "#7c3aed" : "rgba(255,255,255,0.3)" }}
                    strokeWidth={1.75}
                  />
                </div>
                <div>
                  <p className="text-[9px] font-medium text-white">{s.title}</p>
                  <p className="text-[7px] text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Step indicators */}
          <div className="mt-4 flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === step ? 20 : 8,
                  background: i === step ? "#7c3aed" : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
