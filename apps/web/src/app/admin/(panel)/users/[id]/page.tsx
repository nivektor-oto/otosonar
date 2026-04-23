import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { UserActionButtons } from "./user-action-buttons";
import { ArrowLeft, Mail, Phone, Calendar, Radar, Store, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetail({ params }: PageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      dealer: true,
      subscriptions: { orderBy: { createdAt: "desc" } },
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { listing: { select: { brand: true, model: true, year: true } } },
      },
    },
  });
  if (!user) notFound();

  const [listings, sentMessages] = await Promise.all([
    prisma.marketplaceListing.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.message.findMany({
      where: { senderId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { conversation: { select: { id: true, listingId: true } } },
    }),
  ]);

  const isSelf = user.id === admin.id;
  const viewerIsFullAdmin = admin.role === "ADMIN";

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white mb-4"
      >
        <ArrowLeft className="h-3 w-3" /> Kullanıcılar
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            Kullanıcı #{user.customerNumber}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{user.fullName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </span>
            {user.phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {user.phone}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {user.createdAt.toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2">
            <Tag color={roleColor(user.role)}>{user.role}</Tag>
            <Tag color="neutral">{user.userType}</Tag>
            {user.disabledAt ? <Tag color="red">Askıda</Tag> : <Tag color="emerald">Aktif</Tag>}
            {user.deletedAt ? <Tag color="red">Silindi</Tag> : null}
          </div>
          <UserActionButtons
            userId={user.id}
            disabled={!!user.disabledAt}
            role={user.role}
            viewerIsFullAdmin={viewerIsFullAdmin}
            isSelf={isSelf}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profil">
          <Row label="Müşteri No" value={`#${user.customerNumber}`} />
          <Row label="E-posta doğrulandı" value={user.emailVerified ? "Evet" : "Hayır"} />
          <Row label="Telefon doğrulandı" value={user.phoneVerified ? "Evet" : "Hayır"} />
          <Row label="TOTP" value={user.totpEnabled ? "Aktif" : "Kapalı"} />
          <Row label="KVKK" value={user.kvkkConsentAt ? "Onaylı" : "Yok"} />
          <Row label="Pazarlama izni" value={user.marketingOptIn ? "Evet" : "Hayır"} />
          <Row
            label="Son giriş"
            value={user.lastLoginAt?.toLocaleString("tr-TR") ?? "—"}
          />
          {user.disabledAt ? (
            <Row
              label="Askıya alındı"
              value={user.disabledAt.toLocaleString("tr-TR")}
              danger
            />
          ) : null}
          {user.dealer ? (
            <>
              <Row label="Şirket" value={user.dealer.companyName} />
              <Row label="Vergi no" value={user.dealer.taxNo ?? "—"} />
              <Row label="Doğrulama" value={user.dealer.verificationStatus} />
            </>
          ) : null}
        </Card>

        <Card title="Abonelik geçmişi" icon={<Calendar className="h-4 w-4" />}>
          {user.subscriptions.length === 0 ? (
            <Empty>Henüz abonelik yok.</Empty>
          ) : (
            <ul className="space-y-2 text-sm">
              {user.subscriptions.map((s) => (
                <li
                  key={s.id}
                  className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">
                      {s.tier} · {s.billingPeriod}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {s.createdAt.toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                  <Tag color={subColor(s.status)}>{s.status}</Tag>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Son 10 analiz" icon={<Radar className="h-4 w-4" />}>
          {user.analyses.length === 0 ? (
            <Empty>Analiz yok.</Empty>
          ) : (
            <ul className="space-y-2 text-sm">
              {user.analyses.map((a) => (
                <li
                  key={a.id}
                  className="p-3 rounded-lg bg-black/40 border border-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {a.listing.brand ?? "—"} {a.listing.model ?? ""}{" "}
                      {a.listing.year ? `(${a.listing.year})` : ""}
                    </div>
                    <span className="text-[10px] text-neutral-500 tabular-nums">
                      {a.createdAt.toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-neutral-400">
                    Emsal: {a.emsalValue ? formatTL(a.emsalValue) : "—"} · Skor:{" "}
                    {a.negotiationScore ?? "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Son 10 ilan" icon={<Store className="h-4 w-4" />}>
          {listings.length === 0 ? (
            <Empty>Yayınlanan ilan yok.</Empty>
          ) : (
            <ul className="space-y-2 text-sm">
              {listings.map((l) => (
                <li
                  key={l.id}
                  className="p-3 rounded-lg bg-black/40 border border-white/5"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/admin/listings/${l.id}`}
                      className="font-medium hover:text-emerald-400"
                    >
                      {l.brand} {l.model} ({l.year})
                    </Link>
                    <Tag color={listingColor(l.status)}>{l.status}</Tag>
                  </div>
                  <div className="mt-1 text-xs text-neutral-400">
                    {formatTL(l.askingPrice)} · {l.city}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Son 10 mesaj" icon={<MessageSquare className="h-4 w-4" />}>
          {sentMessages.length === 0 ? (
            <Empty>Mesaj yok.</Empty>
          ) : (
            <ul className="space-y-2 text-sm">
              {sentMessages.map((m) => (
                <li key={m.id} className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span className="font-mono">{m.conversation.id.slice(0, 8)}</span>
                    <span>{m.createdAt.toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="text-sm line-clamp-2">{m.body}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 text-sm last:border-0">
      <span className="text-neutral-400">{label}</span>
      <span className={danger ? "text-red-400 font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-4 text-center text-sm text-neutral-500">{children}</div>;
}

function Tag({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "emerald" | "red" | "amber" | "cyan" | "neutral" | "violet";
}) {
  const map = {
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    neutral: "bg-white/5 text-neutral-300 border-white/10",
    violet: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  }[color];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${map}`}
    >
      {children}
    </span>
  );
}

function roleColor(role: string): "amber" | "cyan" | "neutral" {
  if (role === "ADMIN") return "amber";
  if (role === "MODERATOR") return "cyan";
  return "neutral";
}

function subColor(
  status: string,
): "emerald" | "red" | "amber" | "cyan" | "neutral" | "violet" {
  if (status === "ACTIVE") return "emerald";
  if (status === "TRIAL") return "cyan";
  if (status === "PAST_DUE") return "amber";
  if (status === "CANCELED" || status === "EXPIRED") return "red";
  return "neutral";
}

function listingColor(
  status: string,
): "emerald" | "red" | "amber" | "cyan" | "neutral" | "violet" {
  if (status === "ACTIVE") return "emerald";
  if (status === "SOLD") return "violet";
  if (status === "REJECTED" || status === "TAKEDOWN") return "red";
  if (status === "DRAFT") return "amber";
  return "neutral";
}

function formatTL(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}
