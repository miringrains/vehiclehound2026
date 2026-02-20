"use client";

import { Aurora } from "@/components/ui/aurora";

type AuroraBackdropProps = {
  /** Lower opacity for a more subtle effect (e.g. behind dashboard). */
  subtle?: boolean;
};

export function AuroraBackdrop({ subtle = false }: AuroraBackdropProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-background" />
      <Aurora
        colorStops={["#3A29FF", "#7C3AED", "#4F46E5"]}
        speed={subtle ? 0.4 : 0.6}
        amplitude={1.2}
        blend={0.6}
        className={subtle ? "absolute inset-0 opacity-40" : "absolute inset-0 opacity-60"}
      />
    </div>
  );
}
