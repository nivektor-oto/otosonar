import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";
import { ProfileSection } from "./profile-section";
import { SessionsSection } from "./sessions-section";
import { PushToggle } from "./push-toggle";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hesabım — OtoSonar" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [analysisCount, damageCount, plateCount, activeSub, sessions, creditDays, dealer, buyerPrefs] =
    await Promise.all([
      prisma.analysis.count({ where: { userId: user.id } }),
      prisma.damageAnalysis.count({ where: { userId: user.id } }),
      prisma.plateRecognition.count({ where: { userId: user.id } }),
      prisma.subscription.findFirst({
        where: { userId: user.id, status: { in: ["ACTIVE", "TRIAL"] } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.userSession.findMany({
        where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { lastSeenAt: "desc" },
      }),
      prisma.creditLedger
        .aggregate({ where: { userId: user.id }, _sum: { amountDays: true } })
        .then((r) => r._sum.amountDays ?? 0),
      prisma.dealer.findUnique({ where: { userId: user.id } }),
      prisma.buyerPreferences.findUnique({ where: { userId: user.id } }),
    ]);

  const customerNum = `OS-${String(user.customerNumber).padStart(6, "0")}`;
  const persona = (user.quizResult as { persona?: string; recommendedTier?: string } | null)?.persona ?? null;

  return (
    <main className="px-4 py-10 text-neutral-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-emerald-400">{customerNum}</div>
            <h1 className="text-2xl font-bold">Hoş geldin, {user.fullName.split(" ")[0]}</h1>
            <p className="text-sm text-neutral-400">{user.email}</p>
          </div>
          <LogoutButton />
        </header>

        {!user.emailVerified && (
          <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 p-4 text-sm text-amber-200">
            E-posta adresin doğrulanmadı. E-posta servisi lansmanla birlikte aktifleşecek; o zaman linki atacağız.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Müşteri No" value={customerNum} />
          <Card title="Hesap tipi" value={user.userType} />
          <Card
            title="Abonelik"
            value={activeSub ? `${activeSub.tier} (${activeSub.status})` : "Yok"}
          />
          <Card title="Kredi (gün)" value={String(creditDays)} highlight={creditDays > 0} />
          <Card title="Toplam analiz" value={String(analysisCount)} />
          <Card title="Hasar analizi" value={String(damageCount)} />
          <Card title="Plaka okuma" value={String(plateCount)} />
          <Card title="Persona" value={persona ?? "—"} />
        </div>

        <ProfileSection
          fullName={user.fullName}
          phone={user.phone}
          marketingOptIn={user.marketingOptIn}
          userType={user.userType}
          hasDealer={!!dealer}
          dealerSummary={
            dealer
              ? {
                  companyName: dealer.companyName,
                  cityId: dealer.cityId,
                  taxNo: dealer.taxNo,
                  verificationStatus: dealer.verificationStatus,
                }
              : null
          }
          prefsSummary={
            buyerPrefs
              ? {
                  budgetMin: buyerPrefs.budgetMin,
                  budgetMax: buyerPrefs.budgetMax,
                  brands: buyerPrefs.brands,
                  cities: buyerPrefs.cities,
                }
              : null
          }
        />

        <section className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <h2 className="mb-3 text-sm font-semibold">Hızlı erişim</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <QuickLink href="/analiz">Yeni analiz</QuickLink>
            {user.userType === "DEALER" && <QuickLink href="/bozdurma">Bozdurma</QuickLink>}
            <QuickLink href="/hasar-tespit">Hasar tespit</QuickLink>
            <QuickLink href="/plaka-oku">Plaka oku</QuickLink>
            <QuickLink href="/pazaryeri">Pazaryeri</QuickLink>
            <QuickLink href="/gecmis">Geçmişim</QuickLink>
            <QuickLink href="/davet">Davet et</QuickLink>
            <QuickLink href="/quiz">Persona quiz</QuickLink>
            <QuickLink href="/hesap/guvenlik">2FA güvenlik</QuickLink>
          </div>
        </section>

        <PushToggle />

        <SessionsSection
          sessions={sessions.map((s) => ({
            id: s.id,
            userAgent: s.userAgent,
            lastSeenAt: s.lastSeenAt.toISOString(),
            createdAt: s.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}

function Card({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-emerald-700/50 bg-emerald-900/10" : "border-neutral-800 bg-[#12121a]"
      }`}
    >
      <div className="text-xs text-neutral-500">{title}</div>
      <div className={`mt-1 text-lg font-semibold ${highlight ? "text-emerald-400" : ""}`}>{value}</div>
    </div>
  );
}

function QuickLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-neutral-700 px-3 py-1.5 hover:border-emerald-500 hover:bg-neutral-900"
    >
      {children}
    </Link>
  );
}
