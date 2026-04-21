"use client";

import { useEffect } from "react";

function getSessionId(): string | undefined {
  try {
    return localStorage.getItem("otosonar_analytics") ?? undefined;
  } catch {
    return undefined;
  }
}

export function ErrorReporter() {
  useEffect(() => {
    function send(message: string, stack: string | undefined, source?: string) {
      try {
        fetch("/api/errors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            message: message.slice(0, 2000),
            stack: stack?.slice(0, 8000),
            path: window.location.pathname,
            sessionId: getSessionId(),
            metadata: { source, ua: navigator.userAgent.slice(0, 200) },
          }),
        }).catch(() => undefined);
      } catch {
        /* noop */
      }
    }

    function onError(ev: ErrorEvent) {
      send(ev.message || "window.error", ev.error?.stack, "window.error");
    }
    function onRejection(ev: PromiseRejectionEvent) {
      const reason = ev.reason;
      const msg = typeof reason === "string" ? reason : reason?.message ?? String(reason);
      send(msg || "unhandled promise rejection", reason?.stack, "unhandledrejection");
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
