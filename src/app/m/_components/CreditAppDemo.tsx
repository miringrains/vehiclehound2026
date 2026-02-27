"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { FileText, CheckCircle2, Bell, Mail, FileDown } from "lucide-react";

const steps = [
  { icon: FileText, title: "Customer Fills Out Form", desc: "Branded credit app on your storefront or embedded on your site." },
  { icon: FileDown, title: "PDF Auto-Generated", desc: "Grid-style application with your logo — ready for lenders instantly." },
  { icon: Bell, title: "You Get Notified", desc: "Full application + uploaded documents delivered to your email and portal." },
];

const fieldRows = [
  [
    { label: "First Name", value: "James" },
    { label: "Last Name", value: "Rodriguez" },
  ],
  [
    { label: "Date of Birth", value: "03/15/1988" },
    { label: "SSN", value: "•••-••-4521" },
  ],
  [
    { label: "Phone", value: "(305) 555-0172" },
    { label: "Email", value: "j.rodriguez@gmail.com" },
  ],
  [
    { label: "Address", value: "1420 Brickell Ave" },
    { label: "City, State, Zip", value: "Miami, FL 33131" },
  ],
  [
    { label: "Employer", value: "Meridian Capital" },
    { label: "Monthly Income", value: "$8,400" },
  ],
];

function TypingField({ label, value, active, delay }: { label: string; value: string; active: boolean; delay: number }) {
  const [chars, setChars] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) { setChars(0); return; }
    const timeout = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setChars((c) => {
          if (c >= value.length) {
            if (intervalRef.current != null) clearInterval(intervalRef.current);
            return c;
          }
          return c + 1;
        });
      }, 40 + Math.random() * 30);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current != null) clearInterval(intervalRef.current);
    };
  }, [active, value, delay]);

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.03] px-2 py-1 overflow-hidden">
      <p className="text-[5.5px] uppercase tracking-wider text-white/25">{label}</p>
      <div className="mt-0.5 h-2.5 flex items-center">
        {active && chars > 0 ? (
          <span className="text-[8px] text-white/70 font-mono">
            {value.slice(0, chars)}
            {chars < value.length && <span className="animate-pulse text-violet-400">|</span>}
          </span>
        ) : (
          <div className="h-2 w-3/4 rounded bg-white/[0.05]" />
        )}
      </div>
    </div>
  );
}

function MiniPdf({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mt-2 rounded-md border border-white/[0.08] bg-white/[0.04] p-2"
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="h-3 w-3 rounded bg-violet-500/20 flex items-center justify-center">
          <FileText className="h-2 w-2 text-violet-400" />
        </div>
        <span className="text-[7px] font-medium text-white/60">application-rodriguez.pdf</span>
      </div>
      {/* Tiny PDF grid preview */}
      <div className="space-y-0.5">
        <div className="h-1.5 rounded-sm bg-violet-500/10" />
        <div className="grid grid-cols-2 gap-0.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-1 rounded-sm bg-white/[0.04]" />
          ))}
        </div>
        <div className="h-1.5 rounded-sm bg-violet-500/10" />
        <div className="grid grid-cols-2 gap-0.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-1 rounded-sm bg-white/[0.04]" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function EmailNotification({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mt-2 rounded-md border border-white/[0.08] bg-white/[0.04] p-2"
    >
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded bg-emerald-500/20 flex items-center justify-center">
          <Mail className="h-2 w-2 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-[7px] font-medium text-white/60">New Credit Application</p>
          <p className="text-[6px] text-white/30">James Rodriguez · 2025 BMW 330i</p>
        </div>
        <span className="text-[6px] text-emerald-400">Just now</span>
      </div>
      <div className="mt-1.5 flex gap-1">
        <div className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[6px] text-white/40">PDF attached</div>
        <div className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[6px] text-white/40">License attached</div>
      </div>
    </motion.div>
  );
}

export function CreditAppDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const durations = [4000, 2500, 2500];
    const t = setTimeout(() => setStep((s) => (s + 1) % 3), durations[step]);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="rounded-b-lg overflow-hidden bg-[#0a0a0c]">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Form preview — left side */}
        <div className="p-4 md:p-5 border-r border-white/[0.06]">
          <div className="rounded-lg border border-white/[0.06] bg-[#111113] p-3 overflow-hidden">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-violet-400" />
                <span className="text-[9px] font-medium text-white">Credit Application</span>
              </div>
              {step === 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[6px] text-emerald-400/70"
                >
                  Filling out...
                </motion.span>
              )}
            </div>
            <div className="space-y-1.5">
              {fieldRows.map((row, ri) => (
                <div key={ri} className="grid grid-cols-2 gap-1.5">
                  {row.map((f) => (
                    <TypingField
                      key={f.label}
                      label={f.label}
                      value={f.value}
                      active={step === 0}
                      delay={ri * 300 + (f === row[1] ? 150 : 0)}
                    />
                  ))}
                </div>
              ))}
            </div>
            <motion.div
              animate={{
                backgroundColor: step === 0 ? "rgb(124, 58, 237)" : "rgb(74, 40, 167)",
                opacity: step === 0 ? 1 : 0.5,
              }}
              className="mt-2 rounded-md py-1.5 text-center text-[8px] font-medium text-white"
            >
              {step > 0 ? "Submitted" : "Submit Application"}
            </motion.div>
            {/* PDF preview appears in step 1 */}
            <MiniPdf visible={step >= 1} />
          </div>
        </div>

        {/* Steps flow — right side */}
        <div className="p-4 md:p-5 flex flex-col justify-center">
          <p className="mb-1 text-[9px] font-medium text-violet-400 uppercase tracking-widest">How it works</p>
          <p className="mb-4 text-[10px] text-white/50">From submission to your inbox in seconds.</p>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: i <= step ? 1 : 0.25,
                  x: i === step ? 0 : i < step ? 0 : 6,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-2.5"
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors duration-500"
                  style={{
                    background:
                      i === step
                        ? "rgba(124,58,237,0.15)"
                        : i < step
                          ? "rgba(52,211,153,0.1)"
                          : "rgba(255,255,255,0.04)",
                  }}
                >
                  {i < step ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" strokeWidth={1.75} />
                  ) : (
                    <s.icon
                      className="h-3 w-3 transition-colors duration-300"
                      style={{ color: i === step ? "#7c3aed" : "rgba(255,255,255,0.25)" }}
                      strokeWidth={1.75}
                    />
                  )}
                </div>
                <div>
                  <p className="text-[9px] font-medium text-white">{s.title}</p>
                  <p className="text-[7px] text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Email notification appears in step 2 */}
          <EmailNotification visible={step === 2} />

          {/* Step indicators */}
          <div className="mt-4 flex gap-1">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === step ? 20 : 8,
                  backgroundColor: i <= step ? "#7c3aed" : "rgba(255,255,255,0.08)",
                }}
                className="h-1 rounded-full"
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
