"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileText, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

const fields = [
  { label: "First Name", value: "John" },
  { label: "Last Name", value: "Smith" },
  { label: "Email", value: "john@email.com" },
  { label: "Phone", value: "(555) 123-4567" },
];

export function CreditAppDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 md:flex-row md:gap-4">
      {/* Step 1: Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full flex-1 rounded-xl border border-border/40 bg-card/60 p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-400">
            1
          </div>
          <span className="text-xs font-semibold text-foreground">Customer Fills Form</span>
        </div>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 + i * 0.2 }}
              className="flex items-center gap-2"
            >
              <span className="w-16 text-[9px] text-muted-foreground">{f.label}</span>
              <div className="flex-1 rounded border border-border/30 bg-background/60 px-2 py-1">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.7 + i * 0.2 }}
                  className="text-[10px] text-foreground"
                >
                  {f.value}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.3 }}
        className="shrink-0"
      >
        <ArrowRight className="h-5 w-5 rotate-90 text-violet-500 md:rotate-0" />
      </motion.div>

      {/* Step 2: PDF */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.7, duration: 0.5 }}
        className="w-full flex-1 rounded-xl border border-border/40 bg-card/60 p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-400">
            2
          </div>
          <span className="text-xs font-semibold text-foreground">PDF Generated</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/40 p-3">
          <FileText className="h-8 w-8 text-red-400" />
          <div>
            <p className="text-[10px] font-medium text-foreground">Credit-Application-John-Smith.pdf</p>
            <p className="text-[9px] text-muted-foreground">Grid-style form with all applicant data</p>
          </div>
        </div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 2.2, duration: 0.3 }}
        className="shrink-0"
      >
        <ArrowRight className="h-5 w-5 rotate-90 text-violet-500 md:rotate-0" />
      </motion.div>

      {/* Step 3: Email */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 2.4, duration: 0.5 }}
        className="w-full flex-1 rounded-xl border border-border/40 bg-card/60 p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
            3
          </div>
          <span className="text-xs font-semibold text-foreground">Dealer Gets Notified</span>
        </div>
        <div className="space-y-2 rounded-lg border border-border/30 bg-background/40 p-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-violet-400" />
            <span className="text-[10px] font-medium text-foreground">New Credit Application</span>
          </div>
          <p className="text-[9px] text-muted-foreground">
            PDF + license attached directly to the email
          </p>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="text-[9px] text-emerald-400">Delivered</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
