"use client";

import { Aurora } from "@/components/ui/aurora";

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-background" />
      <Aurora
        colorStops={["#3A29FF", "#7C3AED", "#4F46E5"]}
        speed={0.6}
        amplitude={1.2}
        blend={0.6}
        className="absolute inset-0 opacity-60"
      />
    </div>
  );
}
