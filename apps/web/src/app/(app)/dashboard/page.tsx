import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  TrendingUp,
  MessageSquare,
  Bookmark,
  Bell,
  Car,
  Briefcase,
  ChartBar,
  Search,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { PageTour } from "@/components/page-tour";
import { getCurrentUser } from "@/lib/user-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kontrol Paneli — OtoSonar" };

function formatTL(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("tr-TR").format(n);
}

function formatRelative(d: Date) {
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa önce`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const isDealer = user.userType === "DEALER";

  return (
    <main className="min-h-dvh bg-bg text-white">
      <PageTour
        id="dashboard"
        version={1}
        steps={[
          {
            title: `Hoş geldin, ${user.fullName.split(" ")[0]}!`,
            body: "OtoSonar kontrol paneline hoş geldin. Burada araçlarını analiz eder, geçmiş raporlarını görür, hesap ayarlarını yönetirsin. Sadece 30 saniye — turu atlayabilir veya istediğin zaman /hesap sayfasından tekrar açabilirsin.",
          },
          {
            selector: "a[href='/analiz']",
            title: "Yeni Analiz",
            body: "Plaka, fotoğraf veya VIN ile araç analizi başlatmak için buradan başla. AI çift-model doğrulama ile arıza, hasar ve fiyat skorunu birkaç saniyede çıkarır.",
            cta: "Şimdi denemek istersen tıkla.",
          },
          {
            title: "Devam et",
            body: isDealer
              ? "Galerici hesabıyla kontrol panelinde ilan performansın, DealAlert listen ve müşteri sorularını göreceksin. Pazaryeri sayfasına da göz at."
              : "Alıcı hesabıyla geçmiş analizlerin, beğendiğin ilanlar ve fiyat takibin burada toplanır. İlk analizden sonra panel zenginleşir.",
          },
        ]}
      />
      <nav className="sticky top-0 z-30 backdrop-blur-lg bg-bg/85 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="text-xl font-black gradient-text">OtoSonar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/analiz"
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" aria-hidden strokeWidth={2.5} />
              Yeni Analiz
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Kontrol Paneli</h1>
          <p className="text-slate-400 mt-1">
            Hoş geldin, {user.fullName.split(" ")[0]}.
          </p>
        </header>

        {isDealer ? (
          <DealerDashboard userId={user.id} />
        ) : (
          <BuyerDashboard userId={user.id} />
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// DEALER DASHBOARD
// ---------------------------------------------------------------------------

async function DealerDashboard({ userId }: { userId: string }) {
  const [
    stockCount,
    stockValueAgg,
    activeListings,
    unreadAgg,
    recentBids,
  ] = await Promise.all([
    prisma.vehicle.count({
      where: { dealer: { userId }, status: "IN_STOCK" },
    }),
    prisma.vehicle.aggregate({
      where: { dealer: { userId }, status: "IN_STOCK" },
      _sum: { purchasePrice: true },
    }),
    prisma.marketplaceListing.count({
      where: { sellerId: userId, status: "ACTIVE" },
    }),
    prisma.conversation.aggregate({
      where: { sellerId: userId, sellerArchivedAt: null },
      _sum: { sellerUnread: true },
    }),
    prisma.marketplaceBid.findMany({
      where: { listing: { sellerId: userId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { listing: true },
    }),
  ]);

  const stockValue = stockValueAgg._sum.purchasePrice ?? 0;
  const unreadTotal = unreadAgg._sum.sellerUnread ?? 0;

  return (
    <>
      <section
        aria-label="Özet istatistikler"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KpiCard
          Icon={Car}
          label="Stokta araç"
          value={String(stockCount)}
          empty={stockCount === 0}
          emptyHref="/hesap/galerici/araclar"
          emptyLabel="Henüz araç yok — buradan ekle"
        />
        <KpiCard
          Icon={Briefcase}
          label="Toplam stok yatırımı"
          value={formatTL(stockValue)}
          unit="TL"
          empty={stockValue === 0}
          emptyHref="/hesap/galerici/araclar"
          emptyLabel="Alış fiyatlarını gir"
        />
        <KpiCard
          Icon={ChartBar}
          label="Aktif ilan"
          value={String(activeListings)}
          empty={activeListings === 0}
          emptyHref="/pazaryeri/ekle"
          emptyLabel="İlk ilanını yayınla"
        />
        <KpiCard
          Icon={MessageSquare}
          label="Okunmamış mesaj"
          value={String(unreadTotal)}
          highlight={unreadTotal > 0}
          empty={unreadTotal === 0}
          emptyHref="/hesap/mesajlar"
          emptyLabel="Mesaj kutusu boş"
        />
      </section>

      <section className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" aria-hidden />
            Son teklifler
          </h2>
          <Link
            href="/pazaryeri"
            className="text-xs text-accent hover:text-accent/80 transition"
          >
            Tümü →
          </Link>
        </div>
        {recentBids.length === 0 ? (
          <EmptyState
            title="Henüz teklif yok"
            hint="İlk ilanın canlıya çıkınca buradan teklifleri takip edeceksin."
            href="/pazaryeri/ekle"
            cta="İlan ekle"
          />
        ) : (
          <ul>
            {recentBids.map((b) => (
              <li
                key={b.id}
                className="px-6 py-4 border-b border-border/60 last:border-b-0 hover:bg-panel transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-medium text-sm">
                    {b.listing.brand} {b.listing.model}{" "}
                    <span className="text-slate-500">· {b.listing.year}</span>
                  </div>
                  <span className="text-sm font-bold text-success tabular-nums whitespace-nowrap">
                    {formatTL(b.amount)} TL
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden />
                  {formatRelative(b.createdAt)}
                  {b.retracted && (
                    <span className="ml-2 text-warn">· geri çekildi</span>
                  )}
                  {b.acceptedAt && (
                    <span className="ml-2 text-success">· kabul edildi</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="text-sm font-semibold mb-3 text-slate-300">
          Hızlı erişim
        </h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <QuickLink href="/hesap/galerici/araclar" Icon={Car}>
            Stok araçlarım
          </QuickLink>
          <QuickLink href="/pazaryeri/ekle" Icon={Plus}>
            İlan ekle
          </QuickLink>
          <QuickLink href="/bozdurma/masa" Icon={Briefcase}>
            Trade-in masası
          </QuickLink>
          <QuickLink href="/raporlar/trend" Icon={ChartBar}>
            Trend raporu
          </QuickLink>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// BUYER / BROKER / ADMIN DASHBOARD
// ---------------------------------------------------------------------------

async function BuyerDashboard({ userId }: { userId: string }) {
  const [
    analysisCount,
    savedCount,
    activeAlerts,
    unreadAgg,
    recentAnalyses,
  ] = await Promise.all([
    prisma.analysis.count({ where: { userId } }),
    prisma.savedListing.count({ where: { userId } }),
    prisma.priceAlert.count({ where: { userId, active: true } }),
    prisma.conversation.aggregate({
      where: { buyerId: userId, buyerArchivedAt: null },
      _sum: { buyerUnread: true },
    }),
    prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        emsalValue: true,
        negotiationScore: true,
        listing: {
          select: {
            brand: true,
            model: true,
            year: true,
            city: true,
            askingPrice: true,
          },
        },
      },
    }),
  ]);

  const unreadTotal = unreadAgg._sum.buyerUnread ?? 0;

  return (
    <>
      <section
        aria-label="Özet istatistikler"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KpiCard
          Icon={Search}
          label="Toplam analiz"
          value={String(analysisCount)}
          empty={analysisCount === 0}
          emptyHref="/analiz"
          emptyLabel="Henüz analiz yok — buradan başla"
        />
        <KpiCard
          Icon={Bookmark}
          label="Favori ilan"
          value={String(savedCount)}
          empty={savedCount === 0}
          emptyHref="/pazaryeri"
          emptyLabel="Favori yok — pazaryerine bak"
        />
        <KpiCard
          Icon={Bell}
          label="Aktif alarm"
          value={String(activeAlerts)}
          empty={activeAlerts === 0}
          emptyHref="/hesap/alarmlarim"
          emptyLabel="Alarm kur"
        />
        <KpiCard
          Icon={MessageSquare}
          label="Okunmamış mesaj"
          value={String(unreadTotal)}
          highlight={unreadTotal > 0}
          empty={unreadTotal === 0}
          emptyHref="/hesap/mesajlar"
          emptyLabel="Mesaj kutusu boş"
        />
      </section>

      <section className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" aria-hidden />
            Son analizlerin
          </h2>
          <Link
            href="/gecmis"
            className="text-xs text-accent hover:text-accent/80 transition"
          >
            Tümü →
          </Link>
        </div>
        {recentAnalyses.length === 0 ? (
          <EmptyState
            title="Henüz analiz yok"
            hint="İlk ilanı analiz et, sonuçları burada görürsün."
            href="/analiz"
            cta="Yeni analiz"
          />
        ) : (
          <ul>
            {recentAnalyses.map((a) => {
              const score = a.negotiationScore ?? 0;
              const badgeClass =
                score >= 60
                  ? "bg-success/15 text-success"
                  : score >= 30
                  ? "bg-warn/15 text-warn"
                  : "bg-slate-500/15 text-slate-400";
              return (
                <li
                  key={a.id}
                  className="px-6 py-4 border-b border-border/60 last:border-b-0 hover:bg-panel transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-medium text-sm">
                      {a.listing.brand ?? "—"} {a.listing.model ?? ""}
                      {a.listing.year && (
                        <span className="text-slate-500"> · {a.listing.year}</span>
                      )}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold tabular-nums ${badgeClass}`}
                    >
                      {a.negotiationScore != null ? a.negotiationScore : "—"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 tabular-nums">
                    {a.listing.askingPrice != null
                      ? `${formatTL(a.listing.askingPrice)} TL`
                      : "Fiyat —"}
                    {a.emsalValue != null && (
                      <span className="text-slate-500">
                        {" "}
                        · emsal {formatTL(a.emsalValue)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden />
                    {formatRelative(a.createdAt)}
                    {a.listing.city && <span className="ml-1">· {a.listing.city}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="text-sm font-semibold mb-3 text-slate-300">
          Hızlı erişim
        </h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <QuickLink href="/analiz" Icon={Plus}>
            Yeni analiz
          </QuickLink>
          <QuickLink href="/pazaryeri" Icon={Car}>
            Pazaryeri
          </QuickLink>
          <QuickLink href="/hesap/favoriler" Icon={Bookmark}>
            Favorilerim
          </QuickLink>
          <QuickLink href="/hesap/alarmlarim" Icon={Bell}>
            Alarmlarım
          </QuickLink>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// SHARED UI
// ---------------------------------------------------------------------------

type IconComp = React.ComponentType<{
  className?: string;
  "aria-hidden"?: boolean;
  strokeWidth?: number;
}>;

function KpiCard({
  Icon,
  label,
  value,
  unit,
  highlight,
  empty,
  emptyHref,
  emptyLabel,
}: {
  Icon: IconComp;
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
  empty?: boolean;
  emptyHref?: string;
  emptyLabel?: string;
}) {
  return (
    <div
      className={`card ${
        highlight ? "border-success/40" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          {label}
        </span>
        <Icon
          className={`w-4 h-4 ${highlight ? "text-success" : "text-accent"}`}
          aria-hidden
          strokeWidth={2}
        />
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-2xl font-bold tabular-nums ${
            highlight ? "text-success" : ""
          }`}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
      {empty && emptyHref && emptyLabel && (
        <Link
          href={emptyHref}
          className="text-xs mt-2 inline-flex items-center gap-1 text-accent hover:text-accent/80 transition"
        >
          {emptyLabel}
          <ArrowUpRight className="w-3 h-3" aria-hidden />
        </Link>
      )}
    </div>
  );
}

function QuickLink({
  href,
  Icon,
  children,
}: {
  href: string;
  Icon: IconComp;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 hover:border-accent hover:bg-panel transition-colors"
    >
      <Icon className="w-3.5 h-3.5 text-accent" aria-hidden />
      {children}
    </Link>
  );
}

function EmptyState({
  title,
  hint,
  href,
  cta,
}: {
  title: string;
  hint: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="text-sm font-medium text-slate-300 mb-1">{title}</div>
      <p className="text-xs text-slate-500 mb-4">{hint}</p>
      <Link href={href} className="btn-ghost text-sm inline-flex items-center gap-2">
        <Plus className="w-4 h-4" aria-hidden />
        {cta}
      </Link>
    </div>
  );
}
