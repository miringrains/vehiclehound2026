"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

function segmentToLabel(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body-sm">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home size={14} strokeWidth={ICON_STROKE_WIDTH} />
      </Link>
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight
              size={12}
              strokeWidth={ICON_STROKE_WIDTH}
              className="text-muted-foreground"
            />
            {isLast ? (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {segmentToLabel(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {segmentToLabel(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
