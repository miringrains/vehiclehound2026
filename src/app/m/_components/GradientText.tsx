"use client";

import { motion } from "framer-motion";

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
};

export function GradientText({
  children,
  className = "",
  from = "#7C3AED",
  to = "#4F46E5",
}: GradientTextProps) {
  return (
    <motion.span
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {children}
    </motion.span>
  );
}
