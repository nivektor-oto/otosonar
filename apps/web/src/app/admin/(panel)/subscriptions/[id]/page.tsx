import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionActions } from "./subscription-actions";
import { ArrowLeft, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSubscriptionDetail({ params }: PageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          customerNumber: true,
          userType: true,
        },
      },
    },
  });
  if (!sub) notFound();

  const [payments, audit] = await Promise.all([
    prisma.paymentIntent.findMany({
      where: { subscriptionId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.adminAuditLog.findMany({
      where: { targetType: "subscription", targetId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const hasRefundable = payments.some((p) => p.status === "SUCCESS");
  const canDoAction = admin.role === "ADMIN";

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl">
      <Link
        href="/admin/subscriptions"
        className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white mb-4"
      >
        <ArrowLeft className="h-3 w-3" /> Abonelikler
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            Abonelik {sub.status}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-violet-400" />
            {sub.tier} · {sub.billingPeriod === "MONTHLY" ? "Aylık" : "Yıllık"}
          </h1>
          <div className="mt-2 text-sm text-neutral-400">
            <Link
              href={`/admin/users/${sub.user.id}`}
              className="hover:text-emerald-400"
            >
              {sub.user.email}
            </Link>{" "}
            · {sub.user.fullName} · #{sub.user.customerNumber}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-bold mb-4">Eylemler</h3>
            {canDoAction ? (
              <SubscriptionActions
                subscriptionId={sub.id}
                status={sub.status}
                canRefund={hasRefundable}
              />
            ) : (
              <p className="text-sm text-neutral-500">
                İptal/iade yetkisi yalnızca ADMIN rolünde.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-bold mb-4">Ödeme geçmişi ({payments.length})</h3>
            {payments.length === 0 ? (
              <p className="text-sm text-neutral-500">Ödeme kaydı yok.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold tabular-nums">
                        {formatKurus(p.amountKurus)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {p.provider} · {p.createdAt.toLocaleString("tr-TR")}
                      </div>
                      {p.failReason ? (
                        <div className="mt-1 text-xs text-red-300">
                          Sebep: {p.failReason}
                        </div>
                      ) : null}
                    </div>
                    <PaymentTag status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-bold mb-4">Denetim kaydı</h3>
            {audit.length === 0 ? (
              <p className="text-sm text-neutral-500">Henüz admin eylemi yok.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {audit.map((a) => (
                  <li
                    key={a.id}
                    className="p-3 rounded-lg bg-black/40 border border-white/5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400">{a.action}</span>
                      <span className="text-neutral-500">
                        {a.createdAt.toLocaleString("tr-TR")}
                      </span>
                    </div>
                    {a.payload ? (
                      <pre className="mt-2 text-[10px] text-neutral-400 font-mono whitespace-pre-wrap">
                        {JSON.stringify(a.payload, null, 2)}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-1">
            <h3 className="font-bold mb-3">Abonelik</h3>
            <Row label="ID" value={sub.id} mono />
            <Row label="Kullanıcı tipi" value={sub.user.userType} />
            <Row label="Durum" value={sub.status} />
            <Row label="Tier" value={sub.tier} />
            <Row label="Dönem" value={sub.billingPeriod} />
            <Row
              label="Deneme bitiş"
              value={sub.trialEndsAt?.toLocaleDateString("tr-TR") ?? "—"}
            />
            <Row
              label="Dönem başlangıç"
              value={sub.currentPeriodStart?.toLocaleDateString("tr-TR") ?? "—"}
            />
            <Row
              label="Dönem bitiş"
              value={sub.currentPeriodEnd?.toLocaleDateString("tr-TR") ?? "—"}
            />
            <Row
              label="Dönem sonu iptali"
              value={sub.cancelAtPeriodEnd ? "Evet" : "Hayır"}
            />
            {sub.iyzicoSubscriptionRef ? (
              <Row label="İyzico ref" value={sub.iyzicoSubscriptionRef} mono />
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs border-b border-white/5 last:border-0">
      <span className="text-neutral-400">{label}</span>
      <span className={mono ? "font-mono text-[10px] text-neutral-300 truncate max-w-[60%]" : "font-medium text-right"}>
        {value}
      </span>
    </div>
  );
}

function PaymentTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    SUCCESS: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    FAILED: "bg-red-500/15 text-red-400 border-red-500/30",
    REFUNDED: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
        map[status] ?? "bg-white/5 text-neutral-400 border-white/10"
      }`}
    >
      {status}
    </span>
  );
}

function formatKurus(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(kurus / 100);
}
