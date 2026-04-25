"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Check, AlertTriangle, X, Sparkles } from "lucide-react";
import { ListingCoachPanel } from "@/components/listing-coach-panel";

type Status = "IN_STOCK" | "LISTED" | "RESERVED" | "SOLD";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string | null;
  year: number;
  plate?: string | null;
  km?: number | null;
  color?: string | null;
  fuelType?: string | null;
  bodyType?: string | null;
  purchasePrice?: number | null;
  expenseTotal?: number | null;
  askingPrice?: number | null;
  inspectionDueDate?: string | null;
  insurancePolicyEnd?: string | null;
  status: Status;
  soldPrice?: number | null;
  createdAt: string;
}

export function VehicleManager({ initialVehicles }: { initialVehicles: Vehicle[] }) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [adding, setAdding] = useState(false);
  const [coachOpenId, setCoachOpenId] = useState<string | null>(null);

  async function onCreate(v: Partial<Vehicle>) {
    const res = await fetch("/api/dealer/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.error === "plate_exists" ? "Bu plaka zaten kayıtlı" : "Araç eklenemedi");
      return false;
    }
    setVehicles((prev) => [data.vehicle, ...prev]);
    setAdding(false);
    toast.success("Araç eklendi");
    router.refresh();
    return true;
  }

  async function onDelete(id: string) {
    if (!confirm("Bu aracı kalıcı silmek istiyor musun?")) return;
    const res = await fetch(`/api/dealer/vehicles/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error("Silinemedi");
      return;
    }
    setVehicles((prev) => prev.filter((x) => x.id !== id));
    toast.success("Silindi");
  }

  async function onMarkSold(id: string) {
    const priceStr = prompt("Satış fiyatı (TL):");
    if (!priceStr) return;
    const price = parseInt(priceStr.replace(/\D/g, ""), 10);
    if (!price || price <= 0) return;
    const res = await fetch(`/api/dealer/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SOLD", soldPrice: price }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error("Güncellenemedi");
      return;
    }
    setVehicles((prev) => prev.map((x) => (x.id === id ? { ...x, ...data.vehicle } : x)));
    toast.success("Satış kaydedildi");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Araç listesi ({vehicles.length})</h2>
        <button
          onClick={() => setAdding(true)}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          Araç ekle
        </button>
      </div>

      {adding && <NewVehicleForm onCancel={() => setAdding(false)} onSubmit={onCreate} />}

      {vehicles.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-border bg-panel/20 p-10 text-center">
          <p className="text-sm text-slate-400">Stoğun boş. İlk aracı ekle.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm min-w-[920px]">
            <thead className="bg-panel/60 text-left">
              <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 font-semibold">Plaka / Araç</th>
                <th className="px-3 py-3 font-semibold">Yıl</th>
                <th className="px-3 py-3 font-semibold">Km</th>
                <th className="px-3 py-3 font-semibold">Alış</th>
                <th className="px-3 py-3 font-semibold">Maliyet</th>
                <th className="px-3 py-3 font-semibold">Hedef</th>
                <th className="px-3 py-3 font-semibold">Vize</th>
                <th className="px-3 py-3 font-semibold">Sigorta</th>
                <th className="px-3 py-3 font-semibold">Durum</th>
                <th className="px-3 py-3 font-semibold text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <VehicleRow
                  key={v.id}
                  v={v}
                  onDelete={onDelete}
                  onMarkSold={onMarkSold}
                  coachOpen={coachOpenId === v.id}
                  onToggleCoach={() =>
                    setCoachOpenId((prev) => (prev === v.id ? null : v.id))
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function VehicleRow({
  v,
  onDelete,
  onMarkSold,
  coachOpen,
  onToggleCoach,
}: {
  v: Vehicle;
  onDelete: (id: string) => void;
  onMarkSold: (id: string) => void;
  coachOpen: boolean;
  onToggleCoach: () => void;
}) {
  const totalCost = (v.purchasePrice ?? 0) + (v.expenseTotal ?? 0);
  const margin = v.askingPrice && totalCost ? v.askingPrice - totalCost : null;
  const vizeDate = v.inspectionDueDate ? new Date(v.inspectionDueDate) : null;
  const vizeSoon = vizeDate && vizeDate.getTime() - Date.now() < 60 * 86400 * 1000;

  return (
    <>
    <tr className="border-t border-border hover:bg-panel/40">
      <td className="px-4 py-3">
        <div className="font-semibold text-white font-mono text-xs">
          {v.plate ?? "—"}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {v.brand} {v.model} {v.variant ? `· ${v.variant}` : ""}
        </div>
      </td>
      <td className="px-3 py-3 tabular-nums">{v.year}</td>
      <td className="px-3 py-3 tabular-nums text-slate-300">
        {v.km ? `${v.km.toLocaleString("tr-TR")} km` : "—"}
      </td>
      <td className="px-3 py-3 tabular-nums text-slate-300">
        {v.purchasePrice ? `${v.purchasePrice.toLocaleString("tr-TR")} ₺` : "—"}
      </td>
      <td className="px-3 py-3 tabular-nums text-slate-300">
        {v.expenseTotal ? `${v.expenseTotal.toLocaleString("tr-TR")} ₺` : "—"}
      </td>
      <td className="px-3 py-3 tabular-nums">
        {v.askingPrice ? (
          <>
            <div className="text-white font-semibold">
              {v.askingPrice.toLocaleString("tr-TR")} ₺
            </div>
            {margin != null && (
              <div className={`text-[10px] ${margin > 0 ? "text-emerald-400" : "text-red-400"}`}>
                marj {margin > 0 ? "+" : ""}
                {margin.toLocaleString("tr-TR")} ₺
              </div>
            )}
          </>
        ) : (
          <span className="text-slate-500">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-xs">
        {vizeDate ? (
          <span className={vizeSoon ? "text-amber-400 font-semibold" : "text-slate-300"}>
            {vizeDate.toLocaleDateString("tr-TR")}
            {vizeSoon && (
              <AlertTriangle className="w-3 h-3 inline ml-1" aria-hidden strokeWidth={2.5} />
            )}
          </span>
        ) : (
          <span className="text-slate-500">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-xs text-slate-300">
        {v.insurancePolicyEnd ? new Date(v.insurancePolicyEnd).toLocaleDateString("tr-TR") : "—"}
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={v.status} />
        {v.status === "SOLD" && v.soldPrice && (
          <div className="text-[10px] text-emerald-400 mt-1 tabular-nums">
            {v.soldPrice.toLocaleString("tr-TR")} ₺
          </div>
        )}
      </td>
      <td className="px-3 py-3 text-right whitespace-nowrap">
        <button
          onClick={onToggleCoach}
          className={`text-[11px] mr-2 font-semibold inline-flex items-center gap-1 ${
            coachOpen ? "text-emerald-300" : "text-emerald-400 hover:text-emerald-300"
          }`}
          aria-label="AI İlan Koçu"
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
          AI Koç
        </button>
        {v.status !== "SOLD" && (
          <button
            onClick={() => onMarkSold(v.id)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 mr-2 font-semibold"
          >
            Sattım
          </button>
        )}
        <button
          onClick={() => onDelete(v.id)}
          className="text-red-400 hover:text-red-300"
          aria-label="Sil"
        >
          <Trash2 className="w-4 h-4" aria-hidden strokeWidth={2} />
        </button>
      </td>
    </tr>
    {coachOpen && (
      <tr className="border-t border-border bg-panel/20">
        <td colSpan={10} className="px-4 py-4">
          <ListingCoachPanel vehicleId={v.id} />
        </td>
      </tr>
    )}
    </>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const meta = {
    IN_STOCK: { label: "Stokta", tone: "bg-slate-500/20 text-slate-300" },
    LISTED: { label: "İlanda", tone: "bg-accent/20 text-accent" },
    RESERVED: { label: "Rezerv", tone: "bg-amber-500/20 text-amber-300" },
    SOLD: { label: "Satıldı", tone: "bg-emerald-500/20 text-emerald-300" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.tone}`}>
      {meta.label}
    </span>
  );
}

function NewVehicleForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (v: Record<string, unknown>) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = fd.get(k);
      const s = typeof v === "string" ? v.replace(/\D/g, "") : "";
      return s ? parseInt(s, 10) : undefined;
    };
    const str = (k: string) => {
      const v = fd.get(k);
      return typeof v === "string" && v.trim() ? v.trim() : undefined;
    };
    const date = (k: string) => {
      const v = fd.get(k);
      return typeof v === "string" && v ? new Date(v).toISOString() : undefined;
    };
    const payload = {
      brand: str("brand") ?? "",
      model: str("model") ?? "",
      variant: str("variant"),
      year: num("year") ?? new Date().getFullYear(),
      plate: str("plate"),
      km: num("km"),
      color: str("color"),
      fuelType: str("fuelType"),
      bodyType: str("bodyType"),
      purchasePrice: num("purchasePrice"),
      purchaseDate: date("purchaseDate"),
      expenseTotal: num("expenseTotal"),
      askingPrice: num("askingPrice"),
      insurancePolicyEnd: date("insurancePolicyEnd"),
      inspectionDueDate: date("inspectionDueDate"),
      insuranceType: str("insuranceType"),
      status: "IN_STOCK" as const,
    };
    await onSubmit(payload);
    setSubmitting(false);
  }

  const input = "w-full rounded-lg border border-border bg-panel/60 px-3 py-2 text-sm focus:border-accent focus:outline-none";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-accent2/5 to-transparent p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Yeni araç</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" aria-hidden strokeWidth={2.5} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Marka *">
          <input name="brand" required maxLength={40} className={input} placeholder="BMW" />
        </Field>
        <Field label="Model *">
          <input name="model" required maxLength={60} className={input} placeholder="3.20" />
        </Field>
        <Field label="Paket">
          <input name="variant" maxLength={100} className={input} placeholder="F30 Sport" />
        </Field>
        <Field label="Yıl *">
          <input name="year" required type="number" min={1970} max={new Date().getFullYear() + 1} className={input} placeholder="2019" />
        </Field>
        <Field label="Plaka">
          <input name="plate" maxLength={15} className={`${input} uppercase font-mono`} placeholder="34 ABC 123" />
        </Field>
        <Field label="Km">
          <input name="km" type="number" min={0} className={input} placeholder="85000" />
        </Field>
        <Field label="Renk">
          <input name="color" maxLength={30} className={input} placeholder="Beyaz" />
        </Field>
        <Field label="Yakıt">
          <select name="fuelType" className={input}>
            <option value="">—</option>
            <option>Benzin</option>
            <option>Dizel</option>
            <option>LPG</option>
            <option>Hibrit</option>
            <option>Elektrik</option>
          </select>
        </Field>
        <Field label="Kasa">
          <select name="bodyType" className={input}>
            <option value="">—</option>
            <option value="sedan">Sedan</option>
            <option value="hatchback">Hatchback</option>
            <option value="suv">SUV</option>
            <option value="station">Station</option>
            <option value="coupe">Coupe</option>
            <option value="cabrio">Cabrio</option>
            <option value="pickup">Pickup</option>
            <option value="minivan">Minivan</option>
          </select>
        </Field>
        <Field label="Alış fiyatı (TL)">
          <input name="purchasePrice" type="number" min={0} className={input} placeholder="750000" />
        </Field>
        <Field label="Alış tarihi">
          <input name="purchaseDate" type="date" className={input} />
        </Field>
        <Field label="Maliyet (TL)">
          <input name="expenseTotal" type="number" min={0} className={input} placeholder="25000" />
        </Field>
        <Field label="Satış hedefi (TL)">
          <input name="askingPrice" type="number" min={0} className={input} placeholder="820000" />
        </Field>
        <Field label="Vize (muayene) bitiş">
          <input name="inspectionDueDate" type="date" className={input} />
        </Field>
        <Field label="Sigorta bitiş">
          <input name="insurancePolicyEnd" type="date" className={input} />
        </Field>
        <Field label="Sigorta tipi">
          <select name="insuranceType" className={input}>
            <option value="">—</option>
            <option value="iki_aylik">2 aylık</option>
            <option value="bir_yillik">1 yıllık</option>
          </select>
        </Field>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost text-sm"
        >
          Vazgeç
        </button>
        <button type="submit" disabled={submitting} className="btn-primary text-sm inline-flex items-center gap-2">
          {submitting ? "Ekleniyor…" : (<><Check className="w-4 h-4" aria-hidden strokeWidth={2.5} /> Aracı kaydet</>)}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-semibold">{label}</div>
      {children}
    </label>
  );
}
