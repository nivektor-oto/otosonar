/**
 * Best-effort parser for sahibinden.com and arabam.com listing URLs.
 * No remote fetching — only reads the URL slug (no scraping, no legal risk).
 * Returns whichever fields we can confidently infer from the URL itself.
 */

export type ParsedListing = {
  source: "sahibinden" | "arabam" | null;
  listingUrl: string;
  listingId: string | null;
  brand?: string;
  model?: string;
  year?: number;
  km?: number;
  askingPrice?: number;
};

const BRAND_ALIASES: Record<string, string> = {
  bmw: "BMW",
  "mercedes-benz": "Mercedes-Benz",
  mercedes: "Mercedes-Benz",
  audi: "Audi",
  volkswagen: "Volkswagen",
  vw: "Volkswagen",
  toyota: "Toyota",
  honda: "Honda",
  ford: "Ford",
  opel: "Opel",
  renault: "Renault",
  peugeot: "Peugeot",
  citroen: "Citroen",
  fiat: "Fiat",
  hyundai: "Hyundai",
  kia: "Kia",
  nissan: "Nissan",
  mazda: "Mazda",
  seat: "Seat",
  skoda: "Skoda",
  volvo: "Volvo",
  dacia: "Dacia",
  suzuki: "Suzuki",
  chevrolet: "Chevrolet",
  mitsubishi: "Mitsubishi",
  tofas: "Tofaş",
  togg: "TOGG",
};

function pretty(brandKey: string): string {
  return BRAND_ALIASES[brandKey.toLowerCase()] ?? brandKey.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseListingUrl(raw: string): ParsedListing | null {
  const url = raw.trim();
  if (!url) return null;

  let u: URL;
  try {
    u = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const path = u.pathname.toLowerCase();

  if (host.endsWith("sahibinden.com")) {
    return parseSahibinden(u, path);
  }
  if (host.endsWith("arabam.com")) {
    return parseArabam(u, path);
  }
  return {
    source: null,
    listingUrl: u.toString(),
    listingId: null,
  };
}

function parseSahibinden(u: URL, path: string): ParsedListing {
  // e.g. /ilan/vasita-otomobil-bmw-5-serisi-5-20-executive-temiz-bakimli-1216587642/detay
  const idMatch = path.match(/-(\d{7,12})(?:\/detay)?/);
  const listingId = idMatch ? idMatch[1] : null;

  const slug = path
    .replace(/^\/ilan\//, "")
    .replace(/\/detay$/, "")
    .replace(/-\d{7,12}$/, "");

  const parts = slug.split("-").filter(Boolean);
  // Typical: vasita-otomobil-BRAND-MODEL-... — strip leading category markers
  const idx = parts.findIndex((p) => p in BRAND_ALIASES);
  let brand: string | undefined;
  let model: string | undefined;
  if (idx >= 0) {
    brand = pretty(parts[idx]);
    model = parts[idx + 1] ? parts[idx + 1].toUpperCase() : undefined;
  }

  return {
    source: "sahibinden",
    listingUrl: u.toString(),
    listingId,
    brand,
    model,
  };
}

function parseArabam(u: URL, path: string): ParsedListing {
  // e.g. /ilan/sahibinden-satilik-2012-bmw-5-20i-executive-160000-km-820000-tl/2612345
  const idMatch = path.match(/\/(\d{6,10})(?:\/?)$/);
  const listingId = idMatch ? idMatch[1] : null;

  const slug = path.replace(/^\/ilan\//, "").replace(/\/\d+\/?$/, "");
  const parts = slug.split("-").filter(Boolean);

  const yearMatch = parts.find((p) => /^(19|20)\d{2}$/.test(p));
  const year = yearMatch ? parseInt(yearMatch, 10) : undefined;

  const kmIdx = parts.findIndex((p) => p === "km");
  let km: number | undefined;
  if (kmIdx > 0 && /^\d+$/.test(parts[kmIdx - 1])) {
    km = parseInt(parts[kmIdx - 1], 10);
  }

  const tlIdx = parts.findIndex((p) => p === "tl");
  let askingPrice: number | undefined;
  if (tlIdx > 0 && /^\d+$/.test(parts[tlIdx - 1])) {
    askingPrice = parseInt(parts[tlIdx - 1], 10);
  }

  const brandIdx = parts.findIndex((p) => p in BRAND_ALIASES);
  let brand: string | undefined;
  let model: string | undefined;
  if (brandIdx >= 0) {
    brand = pretty(parts[brandIdx]);
    model = parts[brandIdx + 1] ? parts[brandIdx + 1].toUpperCase() : undefined;
  }

  return {
    source: "arabam",
    listingUrl: u.toString(),
    listingId,
    brand,
    model,
    year,
    km,
    askingPrice,
  };
}
