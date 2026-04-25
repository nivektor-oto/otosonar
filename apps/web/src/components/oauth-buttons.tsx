"use client";

import { useEffect, useState } from "react";

export function OAuthButtons({ mode }: { mode: "giris" | "kayit" }) {
  const [google, setGoogle] = useState(false);
  const [apple, setApple] = useState(false);
  // ref'i ilk render'da SSR/CSR aynı (null) — sonra effect'te set edilir.
  // Hydration mismatch'i (#418) önler.
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then((d) => {
        setGoogle(!!d.google);
        setApple(!!d.apple);
      })
      .catch(() => undefined);
    setRef(new URLSearchParams(window.location.search).get("ref"));
  }, []);

  return (
    <div className="space-y-2">
      {google ? (
        <a
          href={`/api/auth/google?mode=${mode}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`}
          className="flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
        >
          <GoogleIcon /> Google ile {mode === "kayit" ? "kayıt ol" : "devam et"}
        </a>
      ) : (
        <div
          title="Google OAuth henüz yapılandırılmadı. GOOGLE_CLIENT_ID/SECRET env'e eklenince aktifleşir."
          aria-disabled
          className="flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-2.5 text-sm text-neutral-500"
        >
          <GoogleIcon muted /> Google ile giriş yakında
        </div>
      )}

      <div
        title={apple ? "" : "Apple Developer hesabı gerekli. Hazır olduğunda aktifleşir."}
        aria-disabled={!apple}
        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
          apple
            ? "border border-neutral-700 bg-black text-white hover:bg-neutral-900"
            : "border border-neutral-800 bg-neutral-900/60 text-neutral-500"
        }`}
      >
        <AppleIcon muted={!apple} />{" "}
        {apple ? `Apple ile ${mode === "kayit" ? "kayıt ol" : "devam et"}` : "Apple ile giriş yakında"}
      </div>

      <div className="flex items-center gap-3 py-1 text-xs text-neutral-500">
        <span className="h-px flex-1 bg-neutral-800" />
        <span>veya</span>
        <span className="h-px flex-1 bg-neutral-800" />
      </div>
    </div>
  );
}

function GoogleIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden style={{ opacity: muted ? 0.4 : 1 }}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A7.05 7.05 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function AppleIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden style={{ opacity: muted ? 0.4 : 1 }}>
      <path
        fill="currentColor"
        d="M16.52 12.94c-.02-2.2 1.8-3.27 1.88-3.32-1.03-1.5-2.62-1.71-3.19-1.74-1.35-.14-2.64.79-3.33.79-.7 0-1.75-.77-2.89-.75-1.48.02-2.86.87-3.62 2.2-1.56 2.7-.39 6.7 1.1 8.89.75 1.07 1.64 2.27 2.79 2.22 1.13-.05 1.56-.73 2.93-.73 1.37 0 1.75.73 2.94.71 1.22-.02 1.98-1.1 2.71-2.18.87-1.23 1.22-2.45 1.24-2.51-.03-.01-2.38-.9-2.38-3.58zM14.64 6.25c.6-.74 1.01-1.76.9-2.79-.87.04-1.94.58-2.56 1.32-.57.65-1.06 1.71-.92 2.72.98.08 1.97-.5 2.58-1.25z"
      />
    </svg>
  );
}
