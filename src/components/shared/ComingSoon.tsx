"use client";

import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

export function ComingSoon({ title }: { title: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-4 rounded-xl bg-muted p-4">
        <Construction
          size={32}
          strokeWidth={ICON_STROKE_WIDTH}
          className="text-muted-foreground"
        />
      </div>
      <h1 className="text-heading-2 mb-2">{title}</h1>
      <p className="text-body-sm text-muted-foreground max-w-md">
        This feature is currently under development and will be available soon.
      </p>
    </motion.div>
  );
}
