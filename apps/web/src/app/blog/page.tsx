import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "OtoSonar Blog — Araç Alım/Satım Rehberi",
  description:
    "İkinci el araç alımı, galerici rehberi, boya-değişen analizi, km kontrolü ve 2026 Türkiye otomobil pazarı için pratik yazılar. OtoSonar ekibinden.",
  keywords: [
    "ikinci el araç blog",
    "araç alım rehberi",
    "otosonar blog",
    "galerici rehberi",
    "ikinci el araba nasıl alınır",
  ],
  openGraph: {
    title: "OtoSonar Blog — Araç Alım/Satım Rehberi",
    description:
      "İkinci el araç alım sürecinin her adımı için pratik rehberler ve 2026 pazar analizleri.",
    locale: "tr_TR",
    type: "website",
  },
};

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <main className="min-h-screen bg-bg text-white">
      <section className="border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
            Blog
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Araç alım-satım <span className="gradient-text">rehberi</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
            İkinci el araç alırken doğru kararı vermeniz için hazırladığımız
            pratik yazılar. Pazarlık, evrak kontrolü, boya tespiti, yakıt tipi
            kararları ve 2026 Türkiye pazar analizleri.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/analiz" className="btn-primary">
              İlanımı ücretsiz analiz et
              <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            </Link>
            <Link href="/kayit" className="btn-ghost">
              Ücretsiz hesap aç
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="card card-interactive group flex flex-col"
            >
              <div className="text-3xl mb-4" aria-hidden>
                {p.coverEmoji ?? "📰"}
              </div>
              <h2 className="font-semibold text-lg tracking-tight mb-2 text-white group-hover:text-accent transition">
                {p.title}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed flex-1">
                {p.excerpt}
              </p>
              <div className="mt-5 flex items-center gap-4 text-[11px] text-slate-500 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" aria-hidden strokeWidth={2} />
                  {dateFormat.format(new Date(p.publishedAt))}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden strokeWidth={2} />
                  {p.readingMinutes} dk
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Yazıyı okudun, <span className="gradient-text">şimdi uygula</span>
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Bakmakta olduğun ilanı yapıştır, 8 saniyede emsal değer, boya ve km
            kontrol sonuçlarını gör.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/analiz" className="btn-primary">
              Analiz et
              <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            </Link>
            <Link href="/kayit" className="btn-ghost">
              Ücretsiz kayıt
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
