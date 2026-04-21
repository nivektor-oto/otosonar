import { Suspense } from "react";
import { VerifyEmailClient } from "./client";

export const metadata = { title: "E-posta doğrula — OtoSonar" };

export default function VerifyEmailPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold">E-posta doğrulama</h1>
        <Suspense fallback={<p className="text-sm text-neutral-500">Yükleniyor…</p>}>
          <VerifyEmailClient />
        </Suspense>
      </div>
    </main>
  );
}
