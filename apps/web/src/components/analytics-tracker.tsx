"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId(): string {
  try {
    const k = "otosonar_analytics";
    let v = localStorage.getItem(k);
    if (!v) {
      v = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const params = new URLSearchParams(window.location.search);
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        sessionId,
        event: "pageview",
        path: pathname,
        referer: document.referrer || undefined,
        utmSource: params.get("utm_source") || undefined,
        utmMedium: params.get("utm_medium") || undefined,
        utmCampaign: params.get("utm_campaign") || undefined,
      }),
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
