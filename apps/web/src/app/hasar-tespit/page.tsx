import { DamageUploader } from "./uploader";

export const metadata = { title: "Fotoğraftan Hasar Tespit — OtoSonar" };

export default function DamagePage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fotoğraftan Hasar Tespit</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Araç fotoğrafını yükle, Gemini Vision AI hasarları ve tamir maliyetini tahmin etsin.
          </p>
          <p className="mt-2 text-xs text-amber-400/80">
            Not: Ekspertiz yerine geçmez, yardımcı araçtır.
          </p>
        </div>
        <DamageUploader />
      </div>
    </main>
  );
}
