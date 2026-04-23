#!/usr/bin/env node
/**
 * Cache-only test — AI sağlayıcısına bağımsız.
 *
 * AnalysisCache tablosuna önceden bir entry yazar, sonra /api/analyze'ı
 * aynı araç parametreleriyle 3 kez çağırır. Tüm cevaplar bit-identical
 * olmalı (cache'ten gelecekler).
 *
 * Gemini/Anthropic credit'lerinin durumu önemli değil — cache devreye girer.
 */
import { PrismaClient } from "../../../packages/db/node_modules/@prisma/client/index.js";
import { createHash } from "node:crypto";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const DATABASE_URL = process.env.DATABASE_URL;

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

const vehicles = [
  { brand: "Renault", model: "Clio", year: 2019, km: 95000, city: "Istanbul", fuelType: "Benzin", transmission: "Manuel" },
  { brand: "BMW", model: "3.20i", year: 2020, km: 72000, city: "Ankara", fuelType: "Benzin", transmission: "Otomatik" },
  { brand: "Fiat", model: "Egea", year: 2022, km: 35000, city: "Izmir", fuelType: "Dizel", transmission: "Manuel" },
  { brand: "Volkswagen", model: "Polo", year: 2018, km: 120000, city: "Bursa", fuelType: "Benzin", transmission: "Otomatik" },
  { brand: "Toyota", model: "Corolla", year: 2021, km: 58000, city: "Istanbul", fuelType: "Hibrit", transmission: "Otomatik" },
];

function computeHash(v) {
  const kmBucket = Math.round(v.km / 5000) * 5000;
  const parts = [
    v.brand.trim().toLowerCase(),
    v.model.trim().toLowerCase(),
    v.year,
    kmBucket,
    v.city.trim().toLowerCase(),
    (v.fuelType || "").trim().toLowerCase(),
    (v.transmission || "").trim().toLowerCase(),
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

function fakeResultForVehicle(v) {
  // Deterministic mock result (hash'e bağlı)
  const seed = parseInt(computeHash(v).slice(0, 8), 16);
  const emsal = 500_000 + (seed % 500_000);
  return {
    emsalValue: emsal,
    emsalConfidence: 0.7,
    negotiationScore: 45,
    redFlags: [
      {
        type: "YIPRANMA",
        severity: "DUSUK",
        detail: `Test: ${v.brand} ${v.model} km normal.`,
        repairEstimateTL: 0,
      },
    ],
    repairEstimateMin: 0,
    repairEstimateMax: 0,
    summary: `${v.brand} ${v.model} ${v.year} — test verisi.`,
    negotiationAdvice: `${Math.floor(emsal * 0.95).toLocaleString("tr-TR")} TL civarında teklif et.`,
  };
}

function fakeMeta() {
  return {
    provider: "gemini",
    model: "gemini-2.5-flash",
    durationMs: 1234,
    retried: 0,
    emsalCount: 12,
  };
}

async function hit(v) {
  const t0 = Date.now();
  const r = await fetch(`${BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...v, askingPrice: 500000 }),
  });
  const dt = Date.now() - t0;
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(`HTTP ${r.status} non-JSON: ${text.slice(0, 200)}`); }
  if (!r.ok || !json.success) throw new Error(`HTTP ${r.status} ${JSON.stringify(json).slice(0, 200)}`);
  return {
    emsal: json.result.emsalValue,
    cached: !!json.meta?.cached,
    consistencyBucket: json.meta?.consistencyBucket?.slice(0, 12) ?? null,
    resultStr: JSON.stringify(json.result),
    ms: dt,
  };
}

async function main() {
  console.log("━━━ Cache-Only Consistency Test ━━━");
  console.log(`Base: ${BASE}`);
  console.log("");

  let allPass = true;

  for (const v of vehicles) {
    const hash = computeHash(v);
    const label = `${v.brand} ${v.model} ${v.year}`;

    // Pre-seed cache
    const preSeedResult = fakeResultForVehicle(v);
    const preSeedMeta = fakeMeta();
    await prisma.analysisCache.upsert({
      where: { inputHash: hash },
      create: {
        inputHash: hash,
        resultJson: preSeedResult,
        metaJson: preSeedMeta,
      },
      update: {
        resultJson: preSeedResult,
        metaJson: preSeedMeta,
        invalidated: false,
        hits: 0,
        createdAt: new Date(),
        lastHitAt: new Date(),
      },
    });

    console.log(`━━ ${label} (hash=${hash.slice(0, 12)}) ━━`);
    const runs = [];
    for (let i = 0; i < 3; i++) {
      try {
        const r = await hit(v);
        runs.push(r);
        console.log(`  run #${i + 1}: emsal=${r.emsal.toLocaleString("tr-TR")} cached=${r.cached} bucket=${r.consistencyBucket} ${r.ms}ms`);
      } catch (e) {
        console.log(`  run #${i + 1}: FAIL — ${e.message}`);
        runs.push(null);
      }
      await new Promise(r => setTimeout(r, 200));
    }

    const ok = runs.filter(Boolean);
    if (ok.length < 3) {
      console.log(`  VERDICT: FAIL (not 3 successful runs)`);
      allPass = false;
      continue;
    }

    const allIdentical = ok.every(r => r.resultStr === ok[0].resultStr);
    const allCached = ok.every(r => r.cached);
    const prices = ok.map(r => r.emsal);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const median = [...prices].sort((a,b)=>a-b)[1];
    const stdev = prices.length >= 2 ? Math.sqrt(prices.map(p => (p - prices.reduce((s,v)=>s+v,0)/prices.length)**2).reduce((s,v)=>s+v,0)/prices.length) : 0;
    const pct = median > 0 ? (stdev / median) * 100 : 0;

    console.log(`  min=${min.toLocaleString("tr-TR")}  max=${max.toLocaleString("tr-TR")}  median=${median.toLocaleString("tr-TR")}  stdev=${stdev.toFixed(0)}  pct=${pct.toFixed(3)}%`);
    console.log(`  identical=${allIdentical ? "YES" : "NO"}  allCached=${allCached ? "YES" : "NO"}`);
    const pass = allIdentical && allCached && pct < 10;
    console.log(`  VERDICT: ${pass ? "PASS" : "FAIL"}`);
    if (!pass) allPass = false;
    console.log("");
  }

  console.log(`━━━ Overall: ${allPass ? "PASS" : "FAIL"} ━━━`);
  await prisma.$disconnect();
  process.exit(allPass ? 0 : 1);
}

main().catch(async (e) => { console.error("Fatal:", e); await prisma.$disconnect(); process.exit(2); });
