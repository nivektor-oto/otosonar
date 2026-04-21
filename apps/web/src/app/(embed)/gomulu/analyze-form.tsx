"use client";

import { useState } from "react";

interface Props {
  isLight: boolean;
  partner: string | null;
}

export function AnalyzeForm({ isLight, partner }: Props) {
  const [url, setUrl] = useState("");

  const border = isLight ? "#e5e7eb" : "#1f1f2e";
  const bg = isLight ? "#ffffff" : "#12121a";

  return (
    <form
      method="GET"
      action="https://otosonar.com/analiz"
      target="_blank"
      style={{
        maxWidth: 500,
        margin: "0 auto",
        padding: 20,
        border: `1px solid ${border}`,
        borderRadius: 16,
        background: bg,
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>OtoSonar ile analiz et</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, opacity: 0.7 }}>
        Sahibinden/arabam ilanını yapıştır, 10 saniyede AI analiz al.
      </p>

      <input
        type="url"
        name="url"
        required
        placeholder="https://www.sahibinden.com/ilan/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          fontSize: 14,
          border: `1px solid ${border}`,
          borderRadius: 8,
          background: isLight ? "#ffffff" : "#0a0a0f",
          color: isLight ? "#0a0a0f" : "#e5e7eb",
          boxSizing: "border-box",
        }}
      />
      {partner && <input type="hidden" name="partner" value={partner} />}

      <button
        type="submit"
        style={{
          marginTop: 12,
          width: "100%",
          padding: "10px 16px",
          fontSize: 14,
          fontWeight: 600,
          background: "#10b981",
          color: "#000",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Analiz et
      </button>

      <div style={{ marginTop: 12, fontSize: 11, opacity: 0.5, textAlign: "center" }}>
        <a
          href="https://otosonar.com"
          target="_blank"
          rel="noopener"
          style={{ color: "inherit" }}
        >
          Powered by OtoSonar
        </a>
      </div>
    </form>
  );
}
