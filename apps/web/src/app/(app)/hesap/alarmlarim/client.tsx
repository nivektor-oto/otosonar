"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, Plus, Trash2, Check } from "lucide-react";

interface Alert {
  id: string;
  label: string | null;
  brand: string;
  model: string | null;
  yearMin: number | null;
  yearMax: number | null;
  priceMax: number | null;
  cityFilter: string | null;
  active: boolean;
  lastTriggeredAt: string | null;
}

export function AlertsClient({ initial }: { initial: Alert[] }) {
  const [alerts, setAlerts] = useState(initial);
  const [adding, setAdding] = useState(false);

  async function onCreate(form: Record<string, unknown>) {
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.error === "limit_reached" ? "10 alarm limitine ulaştın" : "Eklenemedi");
      return;
    }
    setAlerts((prev) => [data.alert, ...prev]);
    setAdding(false);
    toast.success("Alarm eklendi. Eşleşen ilanlarda push gelecek.");
  }

  async function onDelete(id: string) {
    if (!confirm("Alarmı sil?")) return;
    const res = await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error("Silinemedi");
      return;
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Silindi");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">
          Aktif alarmlarım ({alerts.filter((a) => a.active).length})
        </h2>
        <button
          onClick={() => setAdding(true)}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          Yeni alarm
        </button>
      </div>

      {adding && <NewAlertForm onSubmit={onCreate} onCancel={() => setAdding(false)} />}

      {alerts.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-border bg-panel/20 p-10 text-center">
          <Bell className="w-10 h-10 text-accent mx-auto mb-3" aria-hidden strokeWidth={1.5} />
          <p className="text-sm text-slate-400">
            Henüz alarmın yok. Yukarıdan "Yeni alarm" ile başla.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-border bg-panel/40 p-4 flex items-start gap-3"
            >
              <Bell className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">
                  {a.label ?? `${a.brand} ${a.model ?? ""}`.trim()}
                </div>
                <div className="mt-1 text-xs text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                  <span>
                    <strong className="text-slate-200">{a.brand}</strong>
                    {a.model ? ` · ${a.model}` : ""}
                  </span>
                  {(a.yearMin || a.yearMax) && (
                    <span>
                      {a.yearMin ?? "—"} — {a.yearMax ?? "—"}
                    </span>
                  )}
                  {a.priceMax && (
                    <span>max {a.priceMax.toLocaleString("tr-TR")} ₺</span>
                  )}
                  {a.cityFilter && <span>{a.cityFilter}</span>}
                </div>
                {a.lastTriggeredAt && (
                  <div className="mt-1 text-[10px] text-accent">
                    <Check className="w-3 h-3 inline mr-0.5" aria-hidden strokeWidth={3} />
                    Son tetiklenme: {new Date(a.lastTriggeredAt).toLocaleString("tr-TR")}
                  </div>
                )}
              </div>
              <button
                onClick={() => onDelete(a.id)}
                className="text-red-400 hover:text-red-300"
                aria-label="Sil"
              >
                <Trash2 className="w-4 h-4" aria-hidden strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NewAlertForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (v: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
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
    await onSubmit({
      label: str("label"),
      brand: str("brand") ?? "",
      model: str("model"),
      yearMin: num("yearMin"),
      yearMax: num("yearMax"),
      priceMax: num("priceMax"),
      cityFilter: str("cityFilter"),
    });
    setSubmitting(false);
  }

  const input = "w-full rounded-lg border border-border bg-panel/60 px-3 py-2 text-sm";

  return (
    <form
      onSubmit={handle}
      className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-5 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="block col-span-2">
          <span className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold tracking-wider">
            Etiket (isteğe bağlı)
          </span>
          <input name="label" maxLength={80} className={input} placeholder="Konya&apos;da BMW 3.20" />
        </label>
        <label className="block">
          <span className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold tracking-wider">
            Marka *
          </span>
          <input name="brand" required maxLength={40} className={input} placeholder="BMW" />
        </label>
        <label className="block">
          <span className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold tracking-wider">
            Model
          </span>
          <input name="model" maxLength={60} className={input} placeholder="3.20" />
        </label>
        <label className="block">
          <span className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold tracking-wider">
            Yıl min
          </span>
          <input name="yearMin" type="number" min={1970} max={2030} className={input} placeholder="2015" />
        </label>
        <label className="block">
          <span className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold tracking-wider">
            Yıl max
          </span>
          <input name="yearMax" type="number" min={1970} max={2030} className={input} placeholder="2022" />
        </label>
        <label className="block">
          <span className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold tracking-wider">
            Max fiyat (TL)
          </span>
          <input name="priceMax" type="number" min={10000} className={input} placeholder="1200000" />
        </label>
        <label className="block">
          <span className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold tracking-wider">
            Şehir
          </span>
          <input name="cityFilter" maxLength={40} className={input} placeholder="Konya" />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost text-sm">
          Vazgeç
        </button>
        <button type="submit" disabled={submitting} className="btn-primary text-sm">
          {submitting ? "Ekleniyor…" : "Alarmı oluştur"}
        </button>
      </div>
    </form>
  );
}
