#!/usr/bin/env node
/**
 * AI Consistency Test — aynı araç 3 kere analize gönderilince
 * fiyat tahmini %10'dan fazla sapmamalı.
 *
 * Çalıştırma:
 *   cd apps/web && node scripts/test-ai-consistency.mjs
 *
 * NOT: Bu script doğrudan lib/ai.ts'i çağırmak yerine HTTP endpoint'ini
 * hit eder. Dev server 3000'de çalışıyor olmalı (pnpm dev).
 *
 * Cache disable:
 *   TEST_BYPASS_CACHE=1 node scripts/test-ai-consistency.mjs  (AI'ya her çağrıda gitsin)
 * Default:
 *   Cache aktif — 2. ve 3. çağrı AnalysisCache'ten gelmeli (bit-identical).
 */

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const BYPASS = process.env.TEST_BYPASS_CACHE === "1";
const N_REPEATS = Number(process.env.N_REPEATS || 3);

const VEHICLES = [
  {
    label: "Renault Clio 2019",
    payload: {
      brand: "Renault",
      model: "Clio",
      year: 2019,
      km: 95000,
      fuelType: "Benzin",
      transmission: "Manuel",
      city: "Istanbul",
      askingPrice: 520000,
    },
  },
  {
    label: "BMW 3.20i 2020",
    payload: {
      brand: "BMW",
      model: "3.20i",
      year: 2020,
      km: 72000,
      fuelType: "Benzin",
      transmission: "Otomatik",
      city: "Ankara",
      askingPrice: 1250000,
    },
  },
  {
    label: "Fiat Egea 2022",
    payload: {
      brand: "Fiat",
      model: "Egea",
      year: 2022,
      km: 35000,
      fuelType: "Dizel",
      transmission: "Manuel",
      city: "Izmir",
      askingPrice: 680000,
    },
  },
  {
    label: "Volkswagen Polo 2018",
    payload: {
      brand: "Volkswagen",
      model: "Polo",
      year: 2018,
      km: 120000,
      fuelType: "Benzin",
      transmission: "Otomatik",
      city: "Bursa",
      askingPrice: 485000,
    },
  },
  {
    label: "Toyota Corolla 2021",
    payload: {
      brand: "Toyota",
      model: "Corolla",
      year: 2021,
      km: 58000,
      fuelType: "Hibrit",
      transmission: "Otomatik",
      city: "Istanbul",
      askingPrice: 1050000,
    },
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function mean(a) {
  return a.reduce((s, v) => s + v, 0) / a.length;
}
function median(a) {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
function stdev(a) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(mean(a.map((v) => (v - m) ** 2)));
}

async function hit(payload) {
  const t0 = Date.now();
  const r = await fetch(`${BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const dt = Date.now() - t0;
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${r.status} non-JSON: ${text.slice(0, 300)}`);
  }
  if (!r.ok || !json.success) {
    throw new Error(`HTTP ${r.status} ${JSON.stringify(json).slice(0, 300)}`);
  }
  return {
    emsalValue: json.result.emsalValue,
    repairMin: json.result.repairEstimateMin,
    repairMax: json.result.repairEstimateMax,
    negotiationScore: json.result.negotiationScore,
    confidence: json.result.emsalConfidence,
    cached: !!json.meta?.cached,
    consistencyBucket: json.meta?.consistencyBucket ?? null,
    ms: dt,
    flagCount: Array.isArray(json.result.redFlags) ? json.result.redFlags.length : 0,
    resultJsonStr: JSON.stringify(json.result),
  };
}

async function main() {
  console.log(`━━━ AI Consistency Test ━━━`);
  console.log(`Base URL: ${BASE}`);
  console.log(`Repeats per vehicle: ${N_REPEATS}`);
  console.log(`Bypass cache: ${BYPASS ? "YES (expect higher drift)" : "NO (expect bit-identical on hits 2+)"}`);
  console.log(`Vehicles: ${VEHICLES.length}`);
  console.log("");

  const results = [];
  let overallPass = true;

  for (const v of VEHICLES) {
    console.log(`━━ ${v.label} ━━`);
    const runs = [];
    for (let i = 0; i < N_REPEATS; i++) {
      try {
        // BYPASS mode: payload'a küçük bir jitter ekleme (cache bust)
        const payload = BYPASS
          ? { ...v.payload, description: `run-${i}-${Date.now()}` }
          : v.payload;
        const res = await hit(payload);
        runs.push(res);
        console.log(
          `  run #${i + 1}: emsal=${res.emsalValue.toLocaleString("tr-TR")} TL  conf=${res.confidence}  score=${res.negotiationScore}  flags=${res.flagCount}  cached=${res.cached}  ${res.ms}ms`
        );
        await sleep(250); // rate limit'e dokunma
      } catch (e) {
        console.log(`  run #${i + 1}: FAIL — ${e.message}`);
        runs.push(null);
      }
    }

    const prices = runs.filter(Boolean).map((r) => r.emsalValue);
    if (prices.length < 2) {
      console.log(`  VERDICT: SKIP (not enough successful runs)`);
      results.push({ label: v.label, status: "SKIP", runs });
      continue;
    }

    const mn = Math.min(...prices);
    const mx = Math.max(...prices);
    const med = median(prices);
    const sd = stdev(prices);
    const pct = med > 0 ? (sd / med) * 100 : 0;
    const spread = med > 0 ? ((mx - mn) / med) * 100 : 0;

    // Cache on modda tüm başarılı runlar bit-identical olmalı
    const allIdentical =
      !BYPASS &&
      runs.filter(Boolean).every((r) => r.resultJsonStr === runs.find(Boolean).resultJsonStr);

    const pass = BYPASS ? pct <= 10 : allIdentical && pct <= 10;
    if (!pass) overallPass = false;

    console.log(
      `  STATS: min=${mn.toLocaleString("tr-TR")}  max=${mx.toLocaleString("tr-TR")}  median=${med.toLocaleString("tr-TR")}  stdev=${sd.toFixed(0)}  pct=${pct.toFixed(2)}%  spread=${spread.toFixed(2)}%`
    );
    if (!BYPASS) {
      console.log(`  IDENTICAL (bit-for-bit across runs): ${allIdentical ? "YES" : "NO"}`);
    }
    console.log(`  VERDICT: ${pass ? "PASS" : "FAIL"} (threshold: pct ≤ 10%)`);
    console.log("");

    results.push({
      label: v.label,
      status: pass ? "PASS" : "FAIL",
      min: mn,
      max: mx,
      median: med,
      stdev: sd,
      pct,
      spread,
      allIdentical,
      runs: runs.map((r) => (r ? { price: r.emsalValue, cached: r.cached, ms: r.ms } : null)),
    });
  }

  console.log("━━━ SUMMARY ━━━");
  for (const r of results) {
    const tag =
      r.status === "PASS" ? "PASS " : r.status === "FAIL" ? "FAIL " : "SKIP ";
    if (r.status === "SKIP") {
      console.log(`  ${tag} ${r.label}`);
    } else {
      console.log(
        `  ${tag} ${r.label.padEnd(28)} pct=${r.pct.toFixed(2).padStart(5)}%  ident=${r.allIdentical ? "Y" : "N"}`
      );
    }
  }
  console.log("");
  console.log(`Overall: ${overallPass ? "PASS" : "FAIL"}`);
  process.exit(overallPass ? 0 : 1);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(2);
});
