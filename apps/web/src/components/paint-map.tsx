"use client";

import { useState, useEffect } from "react";

export type PanelState = "ORIGINAL" | "PAINTED" | "CHANGED" | "UNKNOWN";
export type PaintMap = Record<string, PanelState>;

type BodyType = "sedan" | "hatchback" | "suv" | "station" | "coupe" | "cabrio" | "pickup" | "minivan" | "unknown";

interface Panel {
  id: string;
  label: string;
  col: number;
  row: number;
}

const COMMON_PANELS: Panel[] = [
  { id: "bonnet", label: "Ön kaput", col: 2, row: 0 },
  { id: "front_bumper", label: "Ön tampon", col: 2, row: -1 },
  { id: "roof", label: "Tavan", col: 2, row: 2 },

  { id: "front_left_fender", label: "Sol ön çamurluk", col: 1, row: 0 },
  { id: "front_right_fender", label: "Sağ ön çamurluk", col: 3, row: 0 },

  { id: "front_left_door", label: "Sol ön kapı", col: 1, row: 1 },
  { id: "front_right_door", label: "Sağ ön kapı", col: 3, row: 1 },

  { id: "rear_left_fender", label: "Sol arka çamurluk", col: 1, row: 3 },
  { id: "rear_right_fender", label: "Sağ arka çamurluk", col: 3, row: 3 },

  { id: "trunk", label: "Bagaj kapağı", col: 2, row: 4 },
  { id: "rear_bumper", label: "Arka tampon", col: 2, row: 5 },
];

const SEDAN_LIKE: Panel[] = [
  ...COMMON_PANELS,
  { id: "rear_left_door", label: "Sol arka kapı", col: 1, row: 2 },
  { id: "rear_right_door", label: "Sağ arka kapı", col: 3, row: 2 },
];

const COUPE_LIKE: Panel[] = COMMON_PANELS;

const PICKUP_LIKE: Panel[] = [
  ...COMMON_PANELS.filter((p) => p.id !== "trunk"),
  { id: "bed", label: "Kasa (yük)", col: 2, row: 4 },
];

function panelsFor(body: BodyType): Panel[] {
  switch (body) {
    case "sedan":
    case "station":
    case "suv":
    case "minivan":
      return SEDAN_LIKE;
    case "hatchback":
      return SEDAN_LIKE;
    case "coupe":
    case "cabrio":
      return COUPE_LIKE;
    case "pickup":
      return PICKUP_LIKE;
    default:
      return SEDAN_LIKE;
  }
}

const stateOrder: PanelState[] = ["ORIGINAL", "PAINTED", "CHANGED", "UNKNOWN"];
const stateMeta: Record<PanelState, { label: string; color: string; bg: string; text: string }> = {
  ORIGINAL: { label: "Orijinal", color: "border-emerald-500/40", bg: "bg-emerald-500/15", text: "text-emerald-300" },
  PAINTED: { label: "Boyalı", color: "border-amber-500/40", bg: "bg-amber-500/15", text: "text-amber-300" },
  CHANGED: { label: "Değişen", color: "border-red-500/40", bg: "bg-red-500/15", text: "text-red-300" },
  UNKNOWN: { label: "Bilinmiyor", color: "border-slate-600", bg: "bg-panel/60", text: "text-slate-400" },
};

export function PaintMapEditor({
  bodyType,
  initial,
  onChange,
}: {
  bodyType: BodyType;
  initial?: PaintMap;
  onChange?: (map: PaintMap) => void;
}) {
  const [map, setMap] = useState<PaintMap>(initial ?? {});
  const panels = panelsFor(bodyType);

  useEffect(() => {
    onChange?.(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  function cycle(id: string) {
    setMap((prev) => {
      const current = prev[id] ?? "UNKNOWN";
      const next = stateOrder[(stateOrder.indexOf(current) + 1) % stateOrder.length];
      return { ...prev, [id]: next };
    });
  }

  function setAll(state: PanelState) {
    const full: PaintMap = {};
    for (const p of panels) full[p.id] = state;
    setMap(full);
  }

  const totals = panels.reduce(
    (acc, p) => {
      const s = map[p.id] ?? "UNKNOWN";
      acc[s] += 1;
      return acc;
    },
    { ORIGINAL: 0, PAINTED: 0, CHANGED: 0, UNKNOWN: 0 } as Record<PanelState, number>,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-slate-400">
          Tıkla → durumu değişir · {panels.length} panel
        </div>
        <div className="flex gap-1.5 text-[10px]">
          <button type="button" onClick={() => setAll("ORIGINAL")} className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold hover:bg-emerald-500/20">
            Tümü orijinal
          </button>
          <button type="button" onClick={() => setAll("UNKNOWN")} className="px-2 py-1 rounded-full bg-slate-500/10 text-slate-300 font-semibold hover:bg-slate-500/20">
            Sıfırla
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 sm:gap-2 bg-panel/20 rounded-2xl p-3 sm:p-4 border border-border">
        {/* Layout rows: -1 (front bumper), 0 (hood), 1 (front doors), 2 (rear doors / roof center), 3 (rear fenders), 4 (trunk), 5 (rear bumper) */}
        {[-1, 0, 1, 2, 3, 4, 5].map((row) => (
          <RowPanels key={row} row={row} panels={panels} map={map} onCycle={cycle} />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 text-[11px]">
        {stateOrder.map((s) => (
          <div
            key={s}
            className={`rounded-lg border px-2 py-1.5 flex items-center justify-between ${stateMeta[s].color} ${stateMeta[s].bg}`}
          >
            <span className={`font-semibold ${stateMeta[s].text}`}>{stateMeta[s].label}</span>
            <span className={`tabular-nums ${stateMeta[s].text} font-bold`}>{totals[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RowPanels({
  row,
  panels,
  map,
  onCycle,
}: {
  row: number;
  panels: Panel[];
  map: PaintMap;
  onCycle: (id: string) => void;
}) {
  return (
    <>
      {[1, 2, 3].map((col) => {
        const panel = panels.find((p) => p.row === row && p.col === col);
        if (!panel) return <div key={`${row}-${col}`} />;
        const state = map[panel.id] ?? "UNKNOWN";
        const meta = stateMeta[state];
        return (
          <button
            key={panel.id}
            type="button"
            onClick={() => onCycle(panel.id)}
            className={`rounded-lg border p-2 text-[10px] sm:text-[11px] font-semibold text-center transition hover:brightness-125 ${meta.color} ${meta.bg} ${meta.text} min-h-[38px]`}
            title={`${panel.label}: ${meta.label} (tıkla → değiştir)`}
          >
            {panel.label}
          </button>
        );
      })}
    </>
  );
}

// Rapor okunurluğu için renkli grid görseli
export function PaintMapView({ bodyType, map }: { bodyType: BodyType; map: PaintMap }) {
  const panels = panelsFor(bodyType);
  return (
    <div className="grid grid-cols-3 gap-1 bg-panel/20 rounded-xl p-2 border border-border">
      {[-1, 0, 1, 2, 3, 4, 5].map((row) => (
        <RowPanels key={row} row={row} panels={panels} map={map} onCycle={() => undefined} />
      ))}
    </div>
  );
}
