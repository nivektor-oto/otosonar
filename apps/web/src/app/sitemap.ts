import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { BRANDS, MODELS } from "@/lib/brand-seo";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://otosonar.com";

const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/analiz", priority: 0.95, changeFrequency: "weekly" },
  { path: "/bozdurma", priority: 0.9, changeFrequency: "weekly" },
  { path: "/hasar-tespit", priority: 0.85, changeFrequency: "weekly" },
  { path: "/plaka-oku", priority: 0.8, changeFrequency: "weekly" },
  { path: "/pazar-arastir", priority: 0.8, changeFrequency: "weekly" },
  { path: "/pazaryeri", priority: 0.75, changeFrequency: "daily" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/quiz", priority: 0.6, changeFrequency: "monthly" },
  { path: "/bekleme-listesi", priority: 0.7, changeFrequency: "weekly" },
  { path: "/davet", priority: 0.5, changeFrequency: "monthly" },
  { path: "/kayit", priority: 0.5, changeFrequency: "monthly" },
  { path: "/giris", priority: 0.4, changeFrequency: "monthly" },
  { path: "/kvkk", priority: 0.3, changeFrequency: "yearly" },
  { path: "/gizlilik", priority: 0.3, changeFrequency: "yearly" },
  { path: "/sozlesme", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cerezler", priority: 0.3, changeFrequency: "yearly" },
  { path: "/mesafeli-satis", priority: 0.3, changeFrequency: "yearly" },
  { path: "/iade-iptal", priority: 0.3, changeFrequency: "yearly" },
  { path: "/iletisim", priority: 0.4, changeFrequency: "yearly" },
  { path: "/fiyatlar", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${SITE}${path}`,
      lastModified,
      changeFrequency,
      priority,
    }),
  );

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const brandEntries: MetadataRoute.Sitemap = BRANDS.map((b) => ({
    url: `${SITE}/marka/${b.slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const modelEntries: MetadataRoute.Sitemap = MODELS.map((m) => ({
    url: `${SITE}/marka/${m.brandSlug}/${m.modelSlug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...blogEntries, ...brandEntries, ...modelEntries];
}
