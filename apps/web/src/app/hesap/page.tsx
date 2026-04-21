import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hesabım — OtoSonar" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [analysisCount, activeSub] = await Promise.all([
    prisma.analysis.count({ where: { userId: user.id } }),
    prisma.subscription.findFirst({
      where: { userId: user.id, status: { in: ["ACTIVE", "TRIAL"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="min-h-dvh bg-[#0a0a0f] text-neutral-100 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hesabım</h1>
            <p className="text-sm text-neutral-400">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        {!user.emailVerified && (
          <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 p-4 text-sm text-amber-200">
            E-posta adresin doğrulanmadı.{" "}
            <Link href="/eposta-dogrula" className="underline">
              Doğrulama linkini kullan
            </Link>
            .
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Ad soyad" value={user.fullName} />
          <Card title="Hesap tipi" value={user.userType} />
          <Card title="Toplam analiz" value={String(analysisCount)} />
          <Card
            title="Abonelik"
            value={activeSub ? `${activeSub.tier} (${activeSub.status})` : "Yok"}
          />
        </div>

        <div className="rounded-xl border border-neutral-800 bg-[#12121a] p-4">
          <h2 className="mb-2 text-sm font-semibold">Hızlı Eylemler</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/analiz" className="rounded-lg border border-neutral-700 px-3 py-1.5 hover:bg-neutral-900">
              Yeni analiz
            </Link>
            {user.userType === "DEALER" && (
              <Link href="/bozdurma" className="rounded-lg border border-neutral-700 px-3 py-1.5 hover:bg-neutral-900">
                Bozdurma
              </Link>
            )}
            <Link href="/fiyatlandirma" className="rounded-lg border border-neutral-700 px-3 py-1.5 hover:bg-neutral-900">
              Abonelik
            </Link>
            <Link href="/davet" className="rounded-lg border border-neutral-700 px-3 py-1.5 hover:bg-neutral-900">
              Davet kodum
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#12121a] p-4">
      <div className="text-xs text-neutral-500">{title}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
