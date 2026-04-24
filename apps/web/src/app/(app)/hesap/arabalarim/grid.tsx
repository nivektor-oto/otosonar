"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Car, Gauge, Trash2, AlertCircle, Calendar } from "lucide-react";

export interface GarageVehicleDTO {
  id: string;
  plate: string | null;
  brand: string;
  model: string;
  year: number;
  variant: string | null;
  kmCurrent: number | null;
  kmLastUpdatedAt: string | null;
  colorHex: string | null;
  fuelType: string | null;
  transmission: string | null;
  photoUrl: string | null;
  inspectionDueAt: string | null;
  inspectionNotifyDaysBefore: number;
  insuranceDueAt: string | null;
  insuranceNotifyDaysBefore: number;
  mtvDueAt: string | null;
  mtvNotifyDaysBefore: number;
  notes: string | null;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((t - now) / (24 * 3600 * 1000));
}

function mostUrgent(v: GarageVehicleDTO): { label: string; days: number; kind: string } | null {
  const items: Array<{ label: string; iso: string | null; threshold: number; kind: string }> = [
    { label: "Muayene", iso: v.inspectionDueAt, threshold: v.inspectionNotifyDaysBefore, kind: "inspection" },
    { label: "Sigorta", iso: v.insuranceDueAt, threshold: v.insuranceNotifyDaysBefore, kind: "insurance" },
    { label: "MTV", iso: v.mtvDueAt, threshold: v.mtvNotifyDaysBefore, kind: "mtv" },
  ];
  let best: { label: string; days: number; kind: string } | null = null;
  for (const it of items) {
    const d = daysUntil(it.iso);
    if (d == null) continue;
    if (d < -14) continue; // çok eski gecikmiş, göz ardı
    if (best == null || d < best.days) {
      best = { label: it.label, days: d, kind: it.kind };
    }
  }
  return best;
}

export function GarageGrid({ initial }: { initial: GarageVehicleDTO[] }) {
  const [vehicles, setVehicles] = useState(initial);

  async function handleDelete(id: string) {
    if (!confirm("Bu aracı garajdan çıkar (satıldı olarak işaretle)?")) return;
    const res = await fetch(`/api/garage/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error("Çıkarılamadı");
      return;
    }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    toast.success("Araç garajdan çıkarıldı");
  }

  async function handleKmUpdate(id: string, current: number | null) {
    const input = prompt(
      `Güncel km? (şu anki: ${current?.toLocaleString("tr-TR") ?? "—"})`,
      current ? String(current) : "",
    );
    if (!input) return;
    const km = parseInt(input.replace(/\D/g, ""), 10);
    if (!Number.isFinite(km) || km < 0) {
      toast.error("Geçersiz km");
      return;
    }
    const res = await fetch(`/api/garage/${id}/km-update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kmCurrent: km }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.error === "km_regression" ? "Kilometre geriye gitmez" : "Güncellenemedi");
      return;
    }
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, kmCurrent: data.vehicle.kmCurrent, kmLastUpdatedAt: data.vehicle.kmLastUpdatedAt }
          : v,
      ),
    );
    toast.success("Kilometre güncellendi");
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-700 bg-[#12121a] p-12 text-center">
        <Car className="mx-auto mb-3 h-12 w-12 text-neutral-600" aria-hidden strokeWidth={1.5} />
        <p className="mb-1 text-lg font-semibold">Garajın boş</p>
        <p className="mb-5 text-sm text-neutral-400">
          Aracını ekle, OtoSonar muayene/sigorta/MTV bitimlerini senin için takip etsin.
        </p>
        <Link
          href="/hesap/arabalarim/ekle"
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-600/20"
        >
          + İlk aracımı ekle
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((v) => {
        const urgent = mostUrgent(v);
        const badgeRed = urgent && urgent.days <= 7;
        const badgeAmber = urgent && urgent.days > 7 && urgent.days <= 30;

        return (
          <div
            key={v.id}
            className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#12121a] transition hover:border-emerald-700/40"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
              {v.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.photoUrl} alt={`${v.brand} ${v.model}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-700">
                  <Car className="h-16 w-16" aria-hidden strokeWidth={1.2} />
                </div>
              )}
              {v.colorHex && (
                <span
                  className="absolute right-3 top-3 inline-block h-5 w-5 rounded-full border border-white/30 shadow"
                  style={{ backgroundColor: v.colorHex.startsWith("#") ? v.colorHex : `#${v.colorHex}` }}
                  title="Renk"
                />
              )}
              {urgent && (
                <span
                  className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    badgeRed
                      ? "bg-red-500/95 text-white"
                      : badgeAmber
                      ? "bg-amber-500/95 text-black"
                      : "bg-emerald-500/95 text-black"
                  }`}
                >
                  <AlertCircle className="h-3 w-3" aria-hidden strokeWidth={3} />
                  {urgent.days < 0
                    ? `${urgent.label} ${-urgent.days} gün geçmiş`
                    : urgent.days === 0
                    ? `${urgent.label} bugün`
                    : `${urgent.label} ${urgent.days} gün kaldı`}
                </span>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-bold text-white">
                    {v.brand} {v.model}{" "}
                    <span className="text-neutral-500">{v.year}</span>
                  </div>
                  {v.variant && <div className="truncate text-xs text-neutral-500">{v.variant}</div>}
                </div>
                {v.plate && (
                  <span className="shrink-0 rounded border border-neutral-700 bg-neutral-950 px-2 py-0.5 font-mono text-xs text-neutral-300">
                    {v.plate}
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-400">
                <div className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
                  {v.kmCurrent != null ? `${v.kmCurrent.toLocaleString("tr-TR")} km` : "—"}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
                  {v.inspectionDueAt
                    ? new Date(v.inspectionDueAt).toLocaleDateString("tr-TR")
                    : "muayene —"}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => handleKmUpdate(v.id, v.kmCurrent)}
                  className="flex-1 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium hover:border-emerald-600 hover:text-emerald-400"
                >
                  Km güncelle
                </button>
                <Link
                  href={`/hesap/arabalarim/${v.id}`}
                  className="flex-1 rounded-lg border border-neutral-700 px-3 py-1.5 text-center text-xs font-medium hover:border-emerald-600 hover:text-emerald-400"
                >
                  Detay
                </Link>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="rounded-lg border border-neutral-700 p-1.5 text-red-400 hover:border-red-500 hover:bg-red-500/10"
                  aria-label="Garajdan çıkar"
                  title="Garajdan çıkar"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
