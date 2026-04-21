"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        message: error.message || "global_error",
        stack: error.stack,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        metadata: { digest: error.digest, source: "global-error" },
      }),
    }).catch(() => undefined);
  }, [error]);

  return (
    <html lang="tr">
      <body style={{ background: "#0a0a0f", color: "#e5e7eb", fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 420,
              textAlign: "center",
              border: "1px solid #1f1f2e",
              borderRadius: 16,
              padding: 32,
              background: "#12121a",
            }}
          >
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Bir hata oluştu</h1>
            <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 12 }}>
              Ekip hatayı otomatik olarak aldı. Şunu deneyebilirsin:
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  background: "#10b981",
                  color: "#000",
                  fontWeight: 600,
                  borderRadius: 8,
                  padding: "10px 16px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Tekrar dene
              </button>
              <a
                href="/"
                style={{
                  border: "1px solid #2a2a38",
                  color: "#e5e7eb",
                  borderRadius: 8,
                  padding: "10px 16px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Ana sayfa
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
