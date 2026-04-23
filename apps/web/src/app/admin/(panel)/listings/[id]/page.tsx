import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ModerationPanel } from "./moderation-panel";
import { ArrowLeft, Calendar, MapPin, Gauge, Palette, User as UserIcon } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminListingDetail({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
  if (!listing) notFound();

  const [seller, moderator, bidCount, recentAudit] = await Promise.all([
    prisma.user.findUnique({
      where: { id: listing.sellerId },
      select: { id: true, email: true, fullName: true, userType: true, role: true },
    }),
    listing.moderatedByUserId
      ? prisma.user.findUnique({
          where: { id: listing.moderatedByUserId },
          select: { email: true },
        })
      : Promise.resolve(null),
    prisma.marketplaceBid.count({ where: { listingId: id } }),
    prisma.adminAuditLog.findMany({
      where: { targetType: "listing", targetId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const photos: string[] = Array.isArray(listing.photosJson)
    ? (listing.photosJson as unknown[]).filter((x): x is string => typeof x === "string")
    : [];

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl">
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white mb-4"
      >
        <ArrowLeft className="h-3 w-3" /> İlanlar
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            İlan {listing.status}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {listing.brand} {listing.model} ({listing.year})
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {listing.city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5" />
              {listing.km.toLocaleString("tr-TR")} km
            </span>
            {listing.bodyType ? (
              <span className="inline-flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                {listing.bodyType}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {listing.createdAt.toLocaleDateString("tr-TR")}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-500">Satış fiyatı</div>
          <div className="text-2xl font-black tabular-nums">{formatTL(listing.askingPrice)}</div>
          {listing.reportCount > 0 ? (
            <div className="mt-1 text-xs font-semibold text-red-400">
              {listing.reportCount} şikayet
            </div>
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <ModerationPanel listingId={listing.id} status={listing.status} />

          {listing.rejectionReason ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-red-300 mb-2">
                Mevcut moderasyon notu
              </div>
              <p className="text-sm text-red-100 whitespace-pre-wrap">
                {listing.rejectionReason}
              </p>
              {moderator ? (
                <div className="mt-3 text-[10px] text-red-300/70">
                  {moderator.email} · {listing.moderatedAt?.toLocaleString("tr-TR") ?? ""}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-bold mb-3">Açıklama</h3>
            {listing.description ? (
              <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            ) : (
              <p className="text-sm text-neutral-500">Açıklama yok.</p>
            )}
          </div>

          {photos.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="font-bold mb-3">Fotoğraflar ({photos.length})</h3>
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 12).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`foto ${i + 1}`}
                    className="aspect-video w-full rounded-lg object-cover border border-white/10"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-bold mb-3">Son moderasyon aktivitesi</h3>
            {recentAudit.length === 0 ? (
              <p className="text-sm text-neutral-500">Henüz kayıt yok.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentAudit.map((a) => (
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
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Satıcı
            </h3>
            {seller ? (
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-xs text-neutral-500">E-posta</div>
                  <Link
                    href={`/admin/users/${seller.id}`}
                    className="font-medium hover:text-emerald-400"
                  >
                    {seller.email}
                  </Link>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Ad Soyad</div>
                  <div>{seller.fullName}</div>
                </div>
                <div className="flex gap-2 pt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10">
                    {seller.userType}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10">
                    {seller.role}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Satıcı bulunamadı.</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <h3 className="font-bold">Özet</h3>
            <Row label="ID" value={listing.id} mono />
            <Row label="Durum" value={listing.status} />
            <Row
              label="Teklif sayısı"
              value={bidCount.toString()}
            />
            <Row label="Acil" value={listing.isUrgent ? "Evet" : "Hayır"} />
            <Row label="Açık arttırma" value={listing.isAuction ? "Evet" : "Hayır"} />
            {listing.auctionEndsAt ? (
              <Row
                label="Arttırma bitiş"
                value={listing.auctionEndsAt.toLocaleString("tr-TR")}
              />
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
      <span className={mono ? "font-mono text-[10px] text-neutral-300" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}

function formatTL(n: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}
