import { redirect } from "next/navigation";
import Link from "next/link";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  Users,
  UserPlus,
  Sparkles,
  Building2,
  User as UserIcon,
  ArrowUpRight,
  Crown,
  Activity,
  Download,
  ExternalLink,
  Radar,
} from "lucide-react";
import { getFounderSession } from "@/lib/founder-auth";
import { LogoMark } from "@/components/logo";
import { FounderLogoutButton, ExportCsvButton } from "@/components/founder-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yönetici Paneli — OtoSonar" };

type Record = {
  email: string;
  fullName?: string;
  userType: "buyer" | "dealer" | "broker";
  city?: string;
  referralSource?: string;
  queueNumber: number;
  createdAt: string;
};

async function readWaitlist(): Promise<Record[]> {
  const file = path.join(process.cwd(), "data", "waitlist.jsonl");
  try {
    const raw = await fs.readFile(file, "utf8");
    return raw
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as Record);
  } catch {
    return [];
  }
}

export default async function YoneticiPage() {
  const session = await getFounderSession();
  if (!session) redirect("/yonetici/giris");

  const records = await readWaitlist();
  const total = records.length;
  const dealers = records.filter((r) => r.userType === "dealer").length;
  const buyers = records.filter((r) => r.userType === "buyer").length;
  const brokers = records.filter((r) => r.userType === "broker").length;
  const recent = [...records]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);

  return (
    <main className="min-h-screen bg-bg text-white">
      <nav className="sticky top-0 z-30 backdrop-blur-lg bg-bg/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="text-xl font-black gradient-text">OtoSonar</span>
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              <Crown className="w-3 h-3" aria-hidden strokeWidth={2.5} />
              Kurucu
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-xs text-slate-400">Oturum</div>
              <div className="text-sm font-semibold tabular-nums">{session.email}</div>
            </div>
            <FounderLogoutButton />
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" aria-hidden strokeWidth={2.5} />
            Kurucu Panel · sınırsız erişim
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Hoş geldin, kurucu.</h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Burası senin komuta merkezin. Waitlist istatistikleri, sistem sağlığı, galerici demo
            hazırlığı ve CSV dışa aktarım.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard
            icon={<Users className="w-5 h-5" aria-hidden strokeWidth={2} />}
            label="Toplam kayıt"
            value={total.toString()}
            accent="accent"
          />
          <StatCard
            icon={<Building2 className="w-5 h-5" aria-hidden strokeWidth={2} />}
            label="Galerici"
            value={dealers.toString()}
            accent="accent2"
          />
          <StatCard
            icon={<UserIcon className="w-5 h-5" aria-hidden strokeWidth={2} />}
            label="Alıcı"
            value={buyers.toString()}
            accent="emerald"
          />
          <StatCard
            icon={<UserPlus className="w-5 h-5" aria-hidden strokeWidth={2} />}
            label="Komisyoncu"
            value={brokers.toString()}
            accent="warn"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold">Son kayıtlar</h2>
                <p className="text-xs text-slate-500 mt-0.5">En yeni 20 kişi</p>
              </div>
              <ExportCsvButton />
            </div>
            {recent.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" aria-hidden strokeWidth={1.5} />
                <p>Henüz kayıt yok. İlk kayıt geldiğinde burada göreceksin.</p>
              </div>
            ) : (
              <div className="-mx-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-border">
                      <th className="px-2 py-2">#</th>
                      <th className="px-2 py-2">E-posta</th>
                      <th className="px-2 py-2">Tür</th>
                      <th className="px-2 py-2 hidden md:table-cell">Şehir</th>
                      <th className="px-2 py-2 hidden md:table-cell">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.email} className="border-b border-border/50 hover:bg-panel/40 transition-colors">
                        <td className="px-2 py-2 tabular-nums text-slate-500">#{r.queueNumber}</td>
                        <td className="px-2 py-2 font-medium">{r.email}</td>
                        <td className="px-2 py-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              r.userType === "dealer"
                                ? "bg-accent2/10 text-accent2 border border-accent2/30"
                                : r.userType === "broker"
                                  ? "bg-warn/10 text-warn border border-warn/30"
                                  : "bg-accent/10 text-accent border border-accent/30"
                            }`}
                          >
                            {r.userType === "dealer"
                              ? "Galerici"
                              : r.userType === "broker"
                                ? "Komisyon"
                                : "Alıcı"}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-slate-400 hidden md:table-cell">
                          {r.city ?? "—"}
                        </td>
                        <td className="px-2 py-2 text-slate-500 text-xs hidden md:table-cell tabular-nums">
                          {formatDate(r.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="card p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" aria-hidden strokeWidth={2.5} />
                Hızlı aksiyonlar
              </h3>
              <div className="space-y-2">
                <QuickAction
                  href="/analiz"
                  title="Yeni analiz"
                  subtitle="Müşteriye canlı demo aç"
                  icon={<Radar className="w-4 h-4" aria-hidden strokeWidth={2} />}
                />
                <QuickAction
                  href="/bozdurma"
                  title="Bozdurma analizi"
                  subtitle="Müşteriden araç alırken üst limit"
                  icon={<Building2 className="w-4 h-4" aria-hidden strokeWidth={2} />}
                />
                <QuickAction
                  href="/pazar-arastir"
                  title="Pazar araştır"
                  subtitle="Marka/model fiyat bandı"
                  icon={<ArrowUpRight className="w-4 h-4" aria-hidden strokeWidth={2} />}
                />
                <QuickAction
                  href="/dashboard"
                  title="Dashboard"
                  subtitle="Analiz geçmişi"
                  icon={<Activity className="w-4 h-4" aria-hidden strokeWidth={2} />}
                />
                <QuickAction
                  href="/bekleme-listesi"
                  title="Bekleme listesi"
                  subtitle="Public duyuru sayfası"
                  icon={<ExternalLink className="w-4 h-4" aria-hidden strokeWidth={2} />}
                />
              </div>
            </div>

            <div className="card p-5 bg-gradient-to-br from-amber-500/5 to-accent/5 border-amber-500/20">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" aria-hidden strokeWidth={2.5} />
                Kurucu ayrıcalıkların
              </h3>
              <ul className="text-sm text-slate-300 space-y-2 mt-3">
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Sınırsız analiz, rate limit yok</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Tüm tier özellikleri (MAX dahil)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Canlı waitlist + CSV export</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Galerici demo hesabı hazır</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Ömür boyu ücretsiz</span>
                </li>
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-accent" aria-hidden strokeWidth={2.5} />
                Galerici tanıtım
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Sahada galericilere göstermek için hazırladığımız PDF sunumu:
              </p>
              <a
                href="/sunum.pdf"
                className="btn-primary w-full justify-center text-sm"
                download
              >
                <Download className="w-4 h-4" aria-hidden strokeWidth={2.5} />
                Sunum PDF'ini indir
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "accent" | "accent2" | "emerald" | "warn";
}) {
  const palette = {
    accent: "from-accent/10 to-accent/5 border-accent/30 text-accent",
    accent2: "from-accent2/10 to-accent2/5 border-accent2/30 text-accent2",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
    warn: "from-warn/10 to-warn/5 border-warn/30 text-warn",
  }[accent];
  return (
    <div className={`card p-5 bg-gradient-to-br ${palette}`}>
      <div className="flex items-center gap-3 mb-3 opacity-80">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-4xl font-black tabular-nums text-white">{value}</div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-panel/40 hover:bg-panel hover:border-slate-600 transition-colors group"
    >
      <div className="icon-badge">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-slate-500 truncate">{subtitle}</div>
      </div>
      <ArrowUpRight
        className="w-4 h-4 text-slate-500 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        aria-hidden
        strokeWidth={2}
      />
    </Link>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
