"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X, Check } from "lucide-react";

/**
 * Pazaryeri filter bar — Arabam / Sahibinden hibridi.
 *  - Masaüstü: sticky top bar (tek satır, chip + dropdown).
 *  - Mobil: "Filtrele" butonu, tam yükseklik bottom-sheet drawer açar.
 *  - Query string'e yazar, sayfa SSR olduğu için `form` submit ile reload.
 */
export function PazaryeriFilterBar({
  initial,
}: {
  initial: {
    q?: string;
    year?: string;
    priceRange?: string;
    kmRange?: string;
    fuel?: string;
    gear?: string;
    city?: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    q: initial.q ?? "",
    year: initial.year ?? "",
    priceRange: initial.priceRange ?? "",
    kmRange: initial.kmRange ?? "",
    fuel: initial.fuel ?? "",
    gear: initial.gear ?? "",
    city: initial.city ?? "",
  });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const activeCount = Object.values(form).filter((v) => v && v.length > 0).length;

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      {/* Masaüstü: tek satır inline filter bar. Mobilde gizli — bottom-sheet kullanılır. */}
      <div className="sticky top-14 z-20 hidden md:block bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <form action="/pazaryeri" method="get" className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-[220px] rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="w-4 h-4 text-slate-500" aria-hidden strokeWidth={2.25} />
              <input
                type="text"
                name="q"
                defaultValue={form.q}
                placeholder="Marka, model"
                className="flex-1 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <FilterSelect name="year" label="Yıl" defaultValue={form.year} options={yearOptions()} />
            <FilterSelect
              name="priceRange"
              label="Fiyat aralığı"
              defaultValue={form.priceRange}
              options={PRICE_RANGES}
            />
            <FilterSelect
              name="kmRange"
              label="KM aralığı"
              defaultValue={form.kmRange}
              options={KM_RANGES}
            />
            <FilterSelect name="fuel" label="Yakıt" defaultValue={form.fuel} options={FUEL_OPTIONS} />
            <FilterSelect
              name="gear"
              label="Şanzıman"
              defaultValue={form.gear}
              options={GEAR_OPTIONS}
            />
            <FilterSelect name="city" label="Şehir" defaultValue={form.city} options={CITY_OPTIONS} />
            <button type="submit" className="btn-primary text-sm">
              Ara
            </button>
          </form>
        </div>
      </div>

      {/* Mobil: tek "Filtrele" buton + arama. Bottom-sheet açar. */}
      <div className="sticky top-14 z-20 md:hidden bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-2">
          <form action="/pazaryeri" method="get" className="flex-1 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="w-4 h-4 text-slate-500" aria-hidden strokeWidth={2.25} />
              <input
                type="text"
                name="q"
                defaultValue={form.q}
                placeholder="Marka, model"
                className="flex-1 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </form>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="hit-target inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 active:bg-slate-50 relative"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden strokeWidth={2.25} />
            Filtrele
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 inline-flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white px-1.5">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobil bottom-sheet drawer */}
      {open && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filtreler"
        >
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl pb-safe animate-fade-up flex flex-col">
            {/* Grab handle */}
            <div className="flex flex-col items-center pt-2 pb-1 shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" aria-hidden />
            </div>
            <div className="flex items-center justify-between px-5 py-2 border-b border-slate-100 shrink-0">
              <div className="text-base font-black tracking-tight text-slate-900">
                Filtrele
              </div>
              <button
                type="button"
                aria-label="Kapat"
                onClick={() => setOpen(false)}
                className="hit-target -mr-2 inline-flex items-center justify-center rounded-lg text-slate-700 active:bg-slate-100"
              >
                <X className="h-6 w-6" strokeWidth={2.25} aria-hidden />
              </button>
            </div>

            <form
              action="/pazaryeri"
              method="get"
              className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
            >
              <input type="hidden" name="q" value={form.q} />

              <SheetSection label="Yıl">
                <select
                  name="year"
                  value={form.year}
                  onChange={(e) => set("year", e.target.value)}
                  className="input"
                  aria-label="Yıl"
                >
                  <option value="">Tümü</option>
                  {yearOptions().map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </SheetSection>

              <SheetSection label="Fiyat aralığı">
                <ChipGroup
                  name="priceRange"
                  value={form.priceRange}
                  onChange={(v) => set("priceRange", v)}
                  options={PRICE_RANGES}
                />
              </SheetSection>

              <SheetSection label="KM aralığı">
                <ChipGroup
                  name="kmRange"
                  value={form.kmRange}
                  onChange={(v) => set("kmRange", v)}
                  options={KM_RANGES}
                />
              </SheetSection>

              <SheetSection label="Yakıt tipi">
                <ChipGroup
                  name="fuel"
                  value={form.fuel}
                  onChange={(v) => set("fuel", v)}
                  options={FUEL_OPTIONS}
                />
              </SheetSection>

              <SheetSection label="Şanzıman">
                <ChipGroup
                  name="gear"
                  value={form.gear}
                  onChange={(v) => set("gear", v)}
                  options={GEAR_OPTIONS}
                />
              </SheetSection>

              <SheetSection label="Şehir">
                <select
                  name="city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="input"
                  aria-label="Şehir"
                >
                  <option value="">Tümü</option>
                  {CITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </SheetSection>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      q: "",
                      year: "",
                      priceRange: "",
                      kmRange: "",
                      fuel: "",
                      gear: "",
                      city: "",
                    })
                  }
                  className="flex-1 min-h-12 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 active:bg-slate-50"
                >
                  Temizle
                </button>
                <button type="submit" className="btn-accent-gradient flex-[2] min-h-12">
                  Sonuçları göster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SheetSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function ChipGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(active ? "" : o.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                active
                  ? "border-amber-400 bg-amber-50 text-amber-900"
                  : "border-slate-200 bg-white text-slate-700 active:bg-slate-50"
              }`}
            >
              {active && <Check className="w-3 h-3" aria-hidden strokeWidth={3} />}
              {o.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

function FilterSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      aria-label={label}
      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function yearOptions() {
  const now = 2026;
  const opts: Array<{ value: string; label: string }> = [];
  for (let y = now; y >= now - 20; y--) {
    opts.push({ value: String(y), label: String(y) });
  }
  return opts;
}

const PRICE_RANGES = [
  { value: "0-500000", label: "0 - 500.000 TL" },
  { value: "500000-1000000", label: "500.000 - 1.000.000 TL" },
  { value: "1000000-2000000", label: "1.000.000 - 2.000.000 TL" },
  { value: "2000000-", label: "2.000.000 TL +" },
];

const KM_RANGES = [
  { value: "0-30000", label: "0 - 30.000" },
  { value: "30000-75000", label: "30.000 - 75.000" },
  { value: "75000-150000", label: "75.000 - 150.000" },
  { value: "150000-250000", label: "150.000 - 250.000" },
  { value: "250000-", label: "250.000 +" },
];

const FUEL_OPTIONS = [
  { value: "benzin", label: "Benzin" },
  { value: "dizel", label: "Dizel" },
  { value: "lpg", label: "Benzin + LPG" },
  { value: "hibrit", label: "Hibrit" },
  { value: "elektrik", label: "Elektrik" },
];

const GEAR_OPTIONS = [
  { value: "otomatik", label: "Otomatik" },
  { value: "manuel", label: "Manuel" },
  { value: "yari-otomatik", label: "Yarı Otomatik" },
];

const CITY_OPTIONS = [
  { value: "istanbul", label: "İstanbul" },
  { value: "ankara", label: "Ankara" },
  { value: "izmir", label: "İzmir" },
  { value: "bursa", label: "Bursa" },
  { value: "antalya", label: "Antalya" },
  { value: "konya", label: "Konya" },
];
