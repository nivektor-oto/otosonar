import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NiVector Ekosistemi — OtoSonar",
  description:
    "OtoSonar'ı yapan ekibin tüm projeleri tek sayfada. 8 ürün, 75 mikroservis, 12 Mayıs 2026 lansman. Yatırımcı ve sponsorlara açık demo bağlantıları.",
};

type StatusKind = "production" | "beta" | "mvp" | "sandbox" | "paper";

type Project = {
  name: string;
  tagline: string;
  description: string;
  href: string;
  status: { kind: StatusKind; label: string };
};

const PROJECTS: Project[] = [
  {
    name: "OtoSonar",
    tagline: "AI destekli 2.el oto pazaryeri (ana ürün)",
    description:
      "Sahibinden + Arabam.com ilan akışını çekiyor, çift-model AI doğrulamasıyla 'fırsat araç' / 'şişirilmiş fiyat' tespiti yapıyor. Galericilere CRM, alıcılara DealAlert. Lansman 12 Mayıs 2026.",
    href: "https://otosonar.com",
    status: { kind: "production", label: "PRODUCTION 200" },
  },
  {
    name: "NiVector Atölye",
    tagline: "Proje pazaryeri",
    description:
      "İnsanların fikirlerini küçük paralarla projeye dönüştürdüğü pazaryeri. Kategori, brief formu, dosya upload (SHA-256 hash + NDA telif koruması), galeri+rating sistemi, calendar+ICS export.",
    href: "https://roughly-mall-multimedia-chef.trycloudflare.com",
    status: { kind: "beta", label: "BETA — DEMO" },
  },
  {
    name: "NiVector Mira",
    tagline: "Astroloji + içerik",
    description:
      "AI destekli kişisel burç + içerik fabrikası. Günlük yorumlar, görsel kart üretimi, mobil responsive.",
    href: "https://announcement-class-patients-realm.trycloudflare.com",
    status: { kind: "beta", label: "BETA — DEMO" },
  },
  {
    name: "NiVector Launchpad",
    tagline: "Multi-chain ön-satış (sandbox)",
    description:
      "Pinksale-tipi multi-chain pre-sale platformu. 6 zincir RPC fallback, Solidity codegen, sandbox modu.",
    href: "https://sandra-reverse-martial-fraction.trycloudflare.com",
    status: { kind: "sandbox", label: "SANDBOX" },
  },
  {
    name: "FanMerch TR",
    tagline: "Fan grupları için baskılı ürün marketplace",
    description:
      "Fan grupları/influencer'lar için baskılı tişört, kupa, çıkartma SaaS-marketplace. AI tasarım önerileri, kapasiteli stok yönetimi, OtoSonar AI ile entegre.",
    href: "https://framing-creature-typing-paint.trycloudflare.com",
    status: { kind: "mvp", label: "MVP" },
  },
  {
    name: "Trader Dashboard",
    tagline: "Algoritmik ticaret paneli (paper-mode)",
    description:
      "60+ Python modül, paper-mode 9/10 test başarısı. Diversifikasyon aracı, lokal-only, kapalı.",
    href: "https://acts-fleet-crossword-physical.trycloudflare.com",
    status: { kind: "paper", label: "PAPER MODE" },
  },
];

const STATUS_STYLE: Record<StatusKind, string> = {
  production: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  beta: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
  mvp: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  sandbox: "bg-purple-100 text-purple-800 ring-1 ring-purple-200",
  paper: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

export default function ProjelerPage() {
  return (
    <main className="min-h-dvh bg-bg">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rose-800">
              Yatırımcı & Sponsor Sayfası
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              <span className="text-rose-800">NiVector</span> Ekosistemi
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              24 yaşında bir kurucudan, Konya'dan, sıfır sermaye —{" "}
              <b className="text-slate-800">8 ürün</b>,{" "}
              <b className="text-slate-800">75 mikroservis</b>,{" "}
              <b className="text-slate-800">12 Mayıs 2026 lansman</b>.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                75 mikroservis
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                8 entegrasyon
              </span>
              <span className="rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-800">
                12 Mayıs lansman
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Project grid */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      </section>

      {/* Footer-CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-slate-600">
          <h2 className="text-lg font-semibold text-slate-900">
            Yatırımcı / sponsor iletişimi
          </h2>
          <p className="mt-3">
            Yatırım, sponsorluk veya ortak çalışma için doğrudan ulaşın.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
            <a
              href="mailto:nivektorna@gmail.com"
              className="inline-flex items-center gap-2 rounded-full bg-rose-800 px-5 py-2 font-semibold text-white shadow-sm hover:bg-rose-700"
            >
              nivektorna@gmail.com
            </a>
            <a
              href="tel:+905327433827"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-800 hover:bg-slate-50"
            >
              +90 532 743 38 27
            </a>
            <a
              href="https://wa.me/905327433827"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-2 font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              WhatsApp
            </a>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Tüm linkler kalıcıdır. Bağlantı değişirse bu sayfa otomatik güncellenir.
          </p>
        </div>
      </section>
    </main>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { name, tagline, description, href, status } = project;
  const statusClass = STATUS_STYLE[status.kind];
  const isExternal = !href.startsWith("https://otosonar.com");

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-rose-200">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}
        >
          {status.label}
        </span>
      </div>
      <h2 className="text-xl font-bold text-slate-900">{name}</h2>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-rose-800">
        {tagline}
      </p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
      <a
        href={href}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="mt-5 inline-flex items-center justify-center gap-2 self-start rounded-full bg-rose-800 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
      >
        {href === "https://otosonar.com" ? "Ana sayfaya git" : "Demo'ya git"} →
      </a>
    </article>
  );
}
