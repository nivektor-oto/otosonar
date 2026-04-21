import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://otosonar.com";

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/analiz", priority: 0.95, changeFrequency: "weekly" },
  { path: "/bozdurma", priority: 0.9, changeFrequency: "weekly" },
  { path: "/hasar-tespit", priority: 0.85, changeFrequency: "weekly" },
  { path: "/plaka-oku", priority: 0.8, changeFrequency: "weekly" },
  { path: "/pazar-arastir", priority: 0.8, changeFrequency: "weekly" },
  { path: "/pazaryeri", priority: 0.75, changeFrequency: "daily" },
  { path: "/quiz", priority: 0.6, changeFrequency: "monthly" },
  { path: "/bekleme-listesi", priority: 0.7, changeFrequency: "weekly" },
  { path: "/davet", priority: 0.5, changeFrequency: "monthly" },
  { path: "/kayit", priority: 0.5, changeFrequency: "monthly" },
  { path: "/giris", priority: 0.4, changeFrequency: "monthly" },
  { path: "/kvkk", priority: 0.3, changeFrequency: "yearly" },
  { path: "/gizlilik", priority: 0.3, changeFrequency: "yearly" },
  { path: "/sozlesme", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cerez", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
