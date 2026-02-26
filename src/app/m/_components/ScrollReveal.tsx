"use client";

import { motion } from "framer-motion";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
};

const offsets = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: -40 },
  right: { x: 40 },
  none: {},
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(4px)", ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
