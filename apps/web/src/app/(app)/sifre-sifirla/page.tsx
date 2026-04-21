import { Suspense } from "react";
import { ResetPasswordClient } from "./client";

export const metadata = { title: "Şifre sıfırla — OtoSonar" };

export default function ResetPasswordPage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Yeni şifre</h1>
        <Suspense fallback={<div className="text-center text-sm text-neutral-500">Yükleniyor…</div>}>
          <ResetPasswordClient />
        </Suspense>
      </div>
    </main>
  );
}
