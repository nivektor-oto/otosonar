"use client";

function getSessionId(): string {
  try {
    const k = "otosonar_analytics";
    let v = localStorage.getItem(k);
    if (!v) {
      v = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

/**
 * Fire-and-forget event tracker. Call from onClick / form submit handlers.
 * Never throws; analytics must not break UX.
 */
export function trackEvent(event: string, metadata?: Record<string, unknown>): void {
  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        sessionId: getSessionId(),
        event,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        metadata,
      }),
    }).catch(() => undefined);
  } catch {
    /* noop */
  }
}
