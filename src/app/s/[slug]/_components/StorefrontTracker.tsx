"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  const KEY = "vh_session_id";
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function StorefrontTracker({ apiKey }: { apiKey: string }) {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const sessionId = getSessionId();
    const isDetail = /\/vehicle\//.test(pathname);
    const eventName = isDetail ? "detail_view" : "page_view";

    const vehicleMatch = pathname.match(/\/vehicle\/([^/]+)/);
    const vehicleId = vehicleMatch?.[1] ?? null;

    const body = JSON.stringify({
      events: [
        {
          event: eventName,
          vehicle_id: vehicleId,
          session_id: sessionId,
          url: window.location.href,
          referrer: document.referrer || null,
          source: "storefront",
        },
      ],
    });

    fetch("/api/widget/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname, apiKey]);

  return null;
}
