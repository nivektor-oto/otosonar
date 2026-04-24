import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { notFound } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  CreditCard,
  AlertTriangle,
  ScrollText,
  ShieldCheck,
  LogOut,
  Radar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Yönetim Paneli — OtoSonar",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  // Rate limit — yoğun tıklama/scraping koruması (IP başına 60/dk).
  const ip = await getClientIp();
  const rl = await checkRateLimit(`admin:ip:${ip}`, 60, 60);
  if (!rl.allowed) notFound();

  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-[#e5e7eb]">
      <div className="flex min-h-dvh">
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-black/40 backdrop-blur">
          <div className="px-5 py-5 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">OtoSonar</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Yönetim
                </div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
            <NavItem href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Özet" />
            <NavItem href="/admin/users" icon={<Users className="h-4 w-4" />} label="Kullanıcılar" />
            <NavItem href="/admin/listings" icon={<Store className="h-4 w-4" />} label="İlanlar" />
            <NavItem
              href="/admin/subscriptions"
              icon={<CreditCard className="h-4 w-4" />}
              label="Abonelikler"
            />
            <NavItem
              href="/admin/scraper"
              icon={<Radar className="h-4 w-4" />}
              label="Veri Havuzu"
            />
            <NavItem
              href="/admin/errors"
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Hata Logları"
            />
            <NavItem
              href="/admin/audit"
              icon={<ScrollText className="h-4 w-4" />}
              label="Denetim Kaydı"
            />
          </nav>

          <div className="px-3 py-4 border-t border-white/10 space-y-2">
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                Oturum
              </div>
              <div className="text-xs font-semibold truncate">{admin.email}</div>
              <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {admin.role}
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              Siteye dön
            </Link>
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:bg-white/5 hover:text-white transition"
    >
      <span className="text-neutral-500">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
