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

  const lastSegment = segments[segments.length - 1];
  const isUuid = /^[0-9a-f]{8}-/.test(lastSegment);
  const displaySegments = isUuid ? segments.slice(0, -1) : segments;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body-sm min-w-0">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <Home size={14} strokeWidth={ICON_STROKE_WIDTH} />
      </Link>

      {/* On mobile, only show the last crumb */}
      {displaySegments.length > 0 && (
        <>
          {/* Middle segments — hidden on mobile */}
          {displaySegments.slice(0, -1).map((segment, i) => {
            const href = "/" + segments.slice(0, i + 1).join("/");
            return (
              <span key={href} className="hidden sm:flex items-center gap-1.5">
                <ChevronRight size={12} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[160px]"
                >
                  {segmentToLabel(segment)}
                </Link>
              </span>
            );
          })}

          {/* Last segment — always shown */}
          <span className="flex items-center gap-1.5 min-w-0">
            <ChevronRight size={12} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[160px] sm:max-w-[200px]">
              {segmentToLabel(displaySegments[displaySegments.length - 1])}
            </span>
          </span>
        </>
      )}
    </nav>
  );
}
