import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { ApiKeyManager } from "./client";

export const dynamic = "force-dynamic";
export const metadata = { title: "CRM API Anahtarları — OtoSonar" };

export default async function DealerApiKeysPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=/hesap/galerici/api");

  const dealer = await prisma.dealer.findUnique({ where: { userId: user.id } });
  if (!dealer) redirect("/hesap/galerici");

  const keys = await prisma.dealerApiKey.findMany({
    where: { dealerId: dealer.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100">
      <div className="border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-3 uppercase tracking-wider">
            Geliştirici
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CRM / Excel API anahtarları</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Kendi galeri yazılımından (CRM, ERP, Excel makrosu) OtoSonar stoğuna otomatik araç ekleyebilirsin.
            Aşağıdan anahtar üret ve `X-API-Key` header'ı ile POST at.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <ApiKeyManager
          initialKeys={keys.map((k) => ({
            id: k.id,
            label: k.label,
            prefix: k.prefix,
            createdAt: k.createdAt.toISOString(),
            lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
            revokedAt: k.revokedAt?.toISOString() ?? null,
            requestsCount: k.requestsCount,
          }))}
        />
      </div>
    </main>
  );
}
