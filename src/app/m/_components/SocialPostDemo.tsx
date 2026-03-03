"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Download,
  RefreshCw,
  Instagram,
  Facebook,
  Check,
} from "lucide-react";
import Image from "next/image";

const ease = [0.16, 1, 0.3, 1] as const;

const formats = [
  { id: "ig-post", label: "Post", sub: "1:1", icon: Instagram, active: true },
  { id: "ig-story", label: "Story", sub: "9:16", icon: Instagram, active: false },
  { id: "fb-post", label: "Post", sub: "16:9", icon: Facebook, active: false },
];

function ShimmerBar({ delay }: { delay: number }) {
  return (
    <motion.div
      className="h-1 rounded-full bg-gradient-to-r from-violet-500/0 via-violet-500/40 to-violet-500/0"
      initial={{ x: "-100%" }}
      animate={{ x: "200%" }}
      transition={{
        duration: 1.2,
        ease: "easeInOut",
        repeat: Infinity,
        delay,
      }}
    />
  );
}

function GeneratedGraphic() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease }}
      className="relative aspect-square w-full overflow-hidden rounded-lg shadow-2xl shadow-orange-500/10"
    >
      <Image
        src="/demo/social-post-demo.png"
        alt="AI-generated social media ad for 2025 BMW 330i"
        fill
        className="object-cover"
        sizes="400px"
      />
    </motion.div>
  );
}

export function SocialPostDemo() {
  const [step, setStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const durations = [3500, 2200, 4000];
    timerRef.current = setTimeout(
      () => setStep((s) => (s + 1) % 3),
      durations[step]
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step]);

  return (
    <div className="overflow-hidden rounded-lg bg-[#0a0a0c]">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: vehicle card + controls */}
        <div className="p-4 md:p-5 border-r border-white/[0.06]">
          {/* Vehicle card */}
          <div className="rounded-lg border border-white/[0.06] bg-[#111113] overflow-hidden">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src="/demo/bmw-330i.jpg"
                alt="2025 BMW 330i"
                fill
                className="object-cover"
                sizes="300px"
              />
              {/* Status badge */}
              <div className="absolute top-2 left-2 rounded bg-emerald-500/90 px-1.5 py-0.5 text-[6px] font-medium text-white">
                Active
              </div>
            </div>
            <div className="p-2.5">
              <p className="text-[10px] font-semibold text-white">
                2025 BMW 330i
              </p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-[9px] font-medium text-violet-400">
                  $389/mo
                </span>
                <span className="text-[7px] text-white/30">Lease</span>
              </div>
              <div className="mt-1.5 flex gap-1">
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[6px] text-white/40">
                  Alpine White
                </span>
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[6px] text-white/40">
                  12k mi/yr
                </span>
              </div>
            </div>
          </div>

          {/* Format selector */}
          <div className="mt-3">
            <p className="text-[7px] uppercase tracking-widest text-white/30 mb-1.5">
              Format
            </p>
            <div className="flex gap-1.5">
              {formats.map((f) => (
                <motion.div
                  key={f.id}
                  animate={{
                    borderColor: f.active
                      ? "rgba(124,58,237,0.4)"
                      : "rgba(255,255,255,0.06)",
                    backgroundColor: f.active
                      ? "rgba(124,58,237,0.08)"
                      : "rgba(255,255,255,0.02)",
                  }}
                  className="flex-1 rounded-md border px-2 py-1.5 text-center cursor-pointer"
                >
                  <f.icon
                    className="mx-auto h-2.5 w-2.5"
                    style={{
                      color: f.active
                        ? "rgb(167,139,250)"
                        : "rgba(255,255,255,0.3)",
                    }}
                  />
                  <p
                    className="mt-0.5 text-[7px] font-medium"
                    style={{
                      color: f.active
                        ? "rgb(196,181,253)"
                        : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {f.label}
                  </p>
                  <p className="text-[5.5px] text-white/20">{f.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <motion.div
            animate={{
              backgroundColor:
                step === 0
                  ? "rgb(124, 58, 237)"
                  : step === 1
                    ? "rgb(91, 33, 182)"
                    : "rgb(74, 40, 167)",
              scale: step === 1 ? 0.98 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-lg py-2 cursor-pointer"
          >
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Sparkles className="h-3 w-3 text-white" />
                  <span className="text-[9px] font-medium text-white">
                    Generate Social Post
                  </span>
                </motion.div>
              )}
              {step === 1 && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <RefreshCw className="h-3 w-3 text-white/70" />
                  </motion.div>
                  <span className="text-[9px] font-medium text-white/70">
                    Generating...
                  </span>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="h-3 w-3 text-emerald-300" />
                  <span className="text-[9px] font-medium text-emerald-200">
                    Generated
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Progress during generation */}
          <AnimatePresence>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                <div className="overflow-hidden rounded-full">
                  <ShimmerBar delay={0} />
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="h-2 w-2 text-violet-400" />
                  </motion.div>
                  <span className="text-[7px] text-white/30">
                    AI composing scene &amp; typography...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: generated result */}
        <div className="p-4 md:p-5 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step < 2 ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease }}
                className="flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-white/[0.08] bg-white/[0.02]"
              >
                <motion.div
                  animate={
                    step === 1
                      ? { opacity: [0.2, 0.5, 0.2], scale: [0.95, 1.05, 0.95] }
                      : { opacity: 0.15 }
                  }
                  transition={
                    step === 1
                      ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      : {}
                  }
                >
                  <Sparkles className="h-6 w-6 text-violet-500" />
                </motion.div>
                <p className="mt-2 text-[8px] text-white/25">
                  {step === 1
                    ? "Creating your social post..."
                    : "Your AI-generated post will appear here"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <GeneratedGraphic />

                {/* Action buttons below graphic */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4, ease }}
                  className="mt-2 flex gap-1.5"
                >
                  <div className="flex flex-1 items-center justify-center gap-1 rounded-md bg-violet-600/20 py-1.5 cursor-pointer">
                    <Download className="h-2.5 w-2.5 text-violet-300" />
                    <span className="text-[7px] font-medium text-violet-300">
                      Download
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-1 rounded-md bg-white/[0.05] py-1.5 cursor-pointer">
                    <RefreshCw className="h-2.5 w-2.5 text-white/40" />
                    <span className="text-[7px] font-medium text-white/40">
                      Regenerate
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step indicators */}
          <div className="mt-4 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === step ? 20 : 8,
                  backgroundColor:
                    i <= step ? "#7c3aed" : "rgba(255,255,255,0.08)",
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
