"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, Printer, FileText } from "lucide-react";
import { AiDisclaimer } from "@/components/ai-disclaimer";

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
type Condition = "MUKEMMEL" | "IYI" | "ORTA" | "KOTU";

interface Vehicle {
  id: string;
  plate: string | null;
  brand: string;
  model: string;
  variant: string | null;
  year: number;
  km: number;
  color: string | null;
  fuelType: string | null;
}

interface Offer {
  emsalSaleValue: number;
  maxBuyPrice: number;
  suggestedOffer: number;
  walkAwayPrice: number;
  expectedMarginTL: number;
  expectedMarginPct: number;
  stockTimeDays: number;
  sellConfidence: number;
  buyScore: number;
  recommendation: "AL" | "PAZARLIK_YAP" | "REDDET";
  summary: string;
  rationale: string;
}

interface EmsalListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  city: string;
  askingPrice: number;
  createdAt: string;
}

interface DeskMeta {
  durationMs?: number;
  provider?: string;
  emsalCount?: number | null;
}

export function TradeInDesk({ dealerName, vehicles }: { dealerName: string; vehicles: Vehicle[] }) {
  const [mode, setMode] = useState<"stock" | "manual">(vehicles.length ? "stock" : "manual");
  const [selectedId, setSelectedId] = useState<string>(vehicles[0]?.id ?? "");
  const [manual, setManual] = useState({ brand: "", model: "", year: "", km: "", plate: "" });
  const [condition, setCondition] = useState<Condition>("IYI");
  const [damageNote, setDamageNote] = useState("");
  const [customerAskingPrice, setCustomerAskingPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [emsalListings, setEmsalListings] = useState<EmsalListing[]>([]);
  const [meta, setMeta] = useState<DeskMeta | null>(null);
  const [vehicleSnapshot, setVehicleSnapshot] = useState<{ brand: string; model: string; year: number; km: number; plate?: string } | null>(null);

  function buildVehicle() {
    if (mode === "stock") {
      const v = vehicles.find((x) => x.id === selectedId);
      if (!v) return null;
      return {
        brand: v.brand,
        model: v.model,
        variant: v.variant ?? undefined,
        year: v.year,
        km: v.km,
        plate: v.plate ?? undefined,
      };
    }
    const year = parseInt(manual.year, 10);
    const km = parseInt(manual.km.replace(/\D/g, ""), 10);
    if (!manual.brand || !manual.model || !year || !km) return null;
    return {
      brand: manual.brand,
      model: manual.model,
      year,
      km,
      plate: manual.plate || undefined,
    };
  }

  async function onCompute() {
    const v = buildVehicle();
    if (!v) {
      toast.error("Araç bilgileri eksik.");
      return;
    }
    setLoading(true);
    setOffer(null);
    try {
      const payload = {
        brand: v.brand,
        model: v.model,
        variant: (v as { variant?: string }).variant,
        year: v.year,
        km: v.km,
        condition,
        hasDamage: /hasar|değişen|boya/i.test(damageNote),
        hasPaintChange: /boya/i.test(damageNote),
        hasMajorService: false,
        customerAskingPrice: customerAskingPrice ? parseInt(customerAskingPrice.replace(/\D/g, ""), 10) : undefined,
        targetMarginPct: 0.12,
        quickSale: false,
        description: damageNote || "Stok trade-in — hızlı değerlendirme.",
      };
      const r = await fetch("/api/bozdurma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        toast.error("Teklif hesaplanamadı");
        return;
      }
      setOffer(data.buyback ?? data.result);
      setEmsalListings(Array.isArray(data.emsalListings) ? data.emsalListings : []);
      setMeta(data.meta ?? null);
      setVehicleSnapshot({ brand: v.brand, model: v.model, year: v.year, km: v.km, plate: (v as { plate?: string }).plate });
      toast.success("Teklif hazır");
    } catch {
      toast.error("Ağ hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 print:space-y-2">
      <div className="rounded-2xl border border-border bg-panel/30 p-5 print:hidden">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setMode("stock")}
            disabled={!vehicles.length}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              mode === "stock"
                ? "bg-accent text-black"
                : "bg-panel/60 border border-border text-slate-300 hover:text-white"
            } ${!vehicles.length ? "opacity-40" : ""}`}
          >
            Stoktan seç ({vehicles.length})
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              mode === "manual"
                ? "bg-accent text-black"
                : "bg-panel/60 border border-border text-slate-300 hover:text-white"
            }`}
          >
            Manuel gir
          </button>
        </div>

        {mode === "stock" && vehicles.length > 0 && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-border bg-panel/60 px-3 py-2 text-sm"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate ? `${v.plate} · ` : ""}
                {v.brand} {v.model} {v.variant ? `(${v.variant})` : ""} · {v.year} · {v.km.toLocaleString("tr-TR")} km
              </option>
            ))}
          </select>
        )}

        {mode === "manual" && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Field label="Plaka">
              <input
                className="input uppercase font-mono"
                placeholder="34 ABC 123"
                value={manual.plate}
                onChange={(e) => setManual({ ...manual, plate: e.target.value })}
              />
            </Field>
            <Field label="Marka *">
              <input
                className="input"
                placeholder="BMW"
                value={manual.brand}
                onChange={(e) => setManual({ ...manual, brand: e.target.value })}
              />
            </Field>
            <Field label="Model *">
              <input
                className="input"
                placeholder="3.20"
                value={manual.model}
                onChange={(e) => setManual({ ...manual, model: e.target.value })}
              />
            </Field>
            <Field label="Yıl *">
              <input
                className="input tabular-nums"
                placeholder="2018"
                value={manual.year}
                onChange={(e) => setManual({ ...manual, year: e.target.value })}
              />
            </Field>
            <Field label="Km *">
              <input
                className="input tabular-nums"
                placeholder="120000"
                value={manual.km}
                onChange={(e) => setManual({ ...manual, km: e.target.value })}
              />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <Field label="Kozmetik durum">
            <select
              className="input"
              value={condition}
              onChange={(e) => setCondition(e.target.value as Condition)}
            >
              <option value="MUKEMMEL">Mükemmel</option>
              <option value="IYI">İyi</option>
              <option value="ORTA">Orta</option>
              <option value="KOTU">Kötü</option>
            </select>
          </Field>
          <Field label="Müşteri istediği (TL)">
            <input
              className="input tabular-nums"
              placeholder="720000"
              value={customerAskingPrice}
              onChange={(e) => setCustomerAskingPrice(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field label="Hasar notu">
            <input
              className="input"
              placeholder="Örn: 2 parça boyalı, çamurluk değişen"
              value={damageNote}
              onChange={(e) => setDamageNote(e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-5">
          <button
            onClick={onCompute}
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                Hesaplanıyor…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden strokeWidth={2.5} />
                AI teklif üret
              </>
            )}
          </button>
        </div>
      </div>

      {offer && vehicleSnapshot && (
        <>
          <div className="print:hidden">
            <AiDisclaimer
              emsalCount={meta?.emsalCount ?? emsalListings.length}
              durationMs={meta?.durationMs}
              provider={meta?.provider}
            />
          </div>
          <CustomerPrintout dealerName={dealerName} vehicle={vehicleSnapshot} offer={offer} />
          {emsalListings.length > 0 && (
            <div className="rounded-2xl border border-border bg-panel/40 p-5 print:hidden">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
                Gerçek benzer ilanlar ({emsalListings.length})
              </div>
              <ul className="space-y-2">
                {emsalListings.map((l) => (
                  <li key={l.id}>
                    <a
                      href={`/pazaryeri/${l.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-panel/60 hover:bg-panel px-3 py-2 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white truncate">
                          {l.brand} {l.model} · {l.year}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {l.km.toLocaleString("tr-TR")} km · {l.city}
                        </div>
                      </div>
                      <div className="text-sm font-bold tabular-nums text-accent shrink-0">
                        {TL.format(l.askingPrice)}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-semibold">
        {label}
      </div>
      {children}
    </label>
  );
}

function CustomerPrintout({
  dealerName,
  vehicle,
  offer,
}: {
  dealerName: string;
  vehicle: { brand: string; model: string; year: number; km: number; plate?: string };
  offer: Offer;
}) {
  const today = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  const recColor = offer.recommendation === "AL" ? "#10b981" : offer.recommendation === "PAZARLIK_YAP" ? "#f59e0b" : "#ef4444";
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Printer className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          Müşteriye yazdır
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-white text-slate-900 p-6 print:border-0 print:shadow-none print:rounded-none">
        <header className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Trade-in teklifi
            </div>
            <div className="text-lg font-black mt-1">{dealerName}</div>
            <div className="text-xs text-slate-500 mt-1">OtoSonar · AI destekli teklif</div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>{today}</div>
            {vehicle.plate && (
              <div className="font-mono text-sm text-slate-900 mt-1">{vehicle.plate}</div>
            )}
          </div>
        </header>

        <section className="mt-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Araç</div>
          <div className="text-xl font-bold mt-1">
            {vehicle.brand} {vehicle.model} · {vehicle.year}
          </div>
          <div className="text-sm text-slate-600 mt-0.5">
            {vehicle.km.toLocaleString("tr-TR")} km
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <PrintMetric label="Teklif" value={TL.format(offer.suggestedOffer)} tone="#10b981" big />
          <PrintMetric label="Üst alım" value={TL.format(offer.maxBuyPrice)} />
          <PrintMetric label="Tahmini satış" value={TL.format(offer.emsalSaleValue)} />
          <PrintMetric label="Vazgeçme" value={TL.format(offer.walkAwayPrice)} />
        </section>

        <section className="mt-6 rounded-xl border p-4" style={{ borderColor: recColor + "40", background: recColor + "08" }}>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: recColor }}>
            Tavsiye · {offer.recommendation.replace("_", " ")}
          </div>
          <p className="text-sm mt-1 text-slate-800 leading-relaxed">{offer.summary}</p>
        </section>

        <section className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Beklenen marj
            </div>
            <div className="text-lg font-bold tabular-nums" style={{ color: offer.expectedMarginTL > 0 ? "#047857" : "#dc2626" }}>
              {offer.expectedMarginTL > 0 ? "+" : ""}
              {TL.format(offer.expectedMarginTL)}
            </div>
            <div className="text-xs text-slate-500">%{Math.round(offer.expectedMarginPct * 100)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Stok süresi
            </div>
            <div className="text-lg font-bold">~{offer.stockTimeDays} gün</div>
            <div className="text-xs text-slate-500">güven %{offer.sellConfidence}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Alım skoru
            </div>
            <div className="text-lg font-bold tabular-nums">{offer.buyScore} / 100</div>
          </div>
        </section>

        <p className="mt-6 text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 pt-4">
          Bu teklif OtoSonar AI tarafından piyasa verisiyle üretildi. Nihai fiyat ekspertiz sonrası kesinleşir. Geçerlilik: bu günün pazar değeri ile sınırlıdır. Müşteri imzası:
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6 text-xs text-slate-500 print:mt-10">
          <div className="border-t border-slate-300 pt-2">Müşteri adı / imza</div>
          <div className="border-t border-slate-300 pt-2">{dealerName} yetkili / imza</div>
        </div>
        <div className="mt-6 text-[9px] text-slate-400 flex items-center gap-1">
          <FileText className="w-3 h-3" aria-hidden strokeWidth={2} />
          OtoSonar · otosonar.com · AI yardımcıdır, resmi ekspertiz yerine geçmez
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function PrintMetric({ label, value, tone, big }: { label: string; value: string; tone?: string; big?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">{label}</div>
      <div
        className={`font-black tabular-nums mt-1 ${big ? "text-2xl" : "text-lg"}`}
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
