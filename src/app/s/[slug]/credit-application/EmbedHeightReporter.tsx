"use client";

import { useEffect } from "react";

export function EmbedHeightReporter() {
  useEffect(() => {
    if (window.self === window.top) return;

    function report() {
      const h = document.documentElement.scrollHeight;
      window.parent.postMessage(
        JSON.stringify({ type: "vh-credit-app-height", height: h }),
        "*",
      );
    }

    const ro = new ResizeObserver(report);
    ro.observe(document.body);
    report();

    return () => ro.disconnect();
  }, []);

  return null;
}
