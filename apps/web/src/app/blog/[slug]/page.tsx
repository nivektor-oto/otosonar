import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, Clock, Calendar, User } from "lucide-react";
import { BLOG_POSTS, getPost } from "@/lib/blog-posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Yazı bulunamadı — OtoSonar Blog" };
  return {
    title: `${post.title} — OtoSonar Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      locale: "tr_TR",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts: ReactNode[] = [];
  const remaining = text;
  let idx = 0;

  const linkSplit: ReactNode[] = [];
  let lastLinkIdx = 0;
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = linkRegex.exec(remaining)) !== null) {
    if (linkMatch.index > lastLinkIdx) {
      linkSplit.push(remaining.slice(lastLinkIdx, linkMatch.index));
    }
    linkSplit.push(
      <Link
        key={`${keyPrefix}-lnk-${idx++}`}
        href={linkMatch[2]}
        className="text-accent hover:underline"
      >
        {linkMatch[1]}
      </Link>,
    );
    lastLinkIdx = linkMatch.index + linkMatch[0].length;
  }
  if (lastLinkIdx < remaining.length) {
    linkSplit.push(remaining.slice(lastLinkIdx));
  }

  for (const chunk of linkSplit) {
    if (typeof chunk !== "string") {
      parts.push(chunk);
      continue;
    }
    let lastBoldIdx = 0;
    let boldMatch: RegExpExecArray | null;
    const boldRe = new RegExp(boldRegex.source, "g");
    while ((boldMatch = boldRe.exec(chunk)) !== null) {
      if (boldMatch.index > lastBoldIdx) {
        parts.push(chunk.slice(lastBoldIdx, boldMatch.index));
      }
      parts.push(
        <strong key={`${keyPrefix}-b-${idx++}`} className="text-white font-semibold">
          {boldMatch[1]}
        </strong>,
      );
      lastBoldIdx = boldMatch.index + boldMatch[0].length;
    }
    if (lastBoldIdx < chunk.length) {
      parts.push(chunk.slice(lastBoldIdx));
    }
  }

  return parts;
}

function renderMarkdown(md: string): ReactNode[] {
  const blocks = md.split(/\n\n+/);
  const out: ReactNode[] = [];

  blocks.forEach((rawBlock, bIdx) => {
    const block = rawBlock.trim();
    if (!block) return;

    if (block.startsWith("## ")) {
      out.push(
        <h2
          key={`h2-${bIdx}`}
          className="text-2xl md:text-3xl font-bold tracking-tight mt-10 mb-4 text-white"
        >
          {renderInline(block.slice(3).trim(), `h2-${bIdx}`)}
        </h2>,
      );
      return;
    }

    if (block.startsWith("### ")) {
      out.push(
        <h3
          key={`h3-${bIdx}`}
          className="text-xl md:text-2xl font-semibold tracking-tight mt-8 mb-3 text-white"
        >
          {renderInline(block.slice(4).trim(), `h3-${bIdx}`)}
        </h3>,
      );
      return;
    }

    const lines = block.split("\n");
    const isList = lines.every((l) => l.trim().startsWith("- "));
    if (isList) {
      out.push(
        <ul
          key={`ul-${bIdx}`}
          className="my-4 space-y-2 text-slate-300 list-disc list-outside pl-5"
        >
          {lines.map((l, lIdx) => (
            <li key={`li-${bIdx}-${lIdx}`} className="leading-relaxed">
              {renderInline(l.trim().slice(2), `li-${bIdx}-${lIdx}`)}
            </li>
          ))}
        </ul>,
      );
      return;
    }

    const isTable =
      lines.length >= 2 &&
      lines[0].trim().startsWith("|") &&
      /^\s*\|[\s-:|]+\|\s*$/.test(lines[1]);
    if (isTable) {
      const headers = lines[0]
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      const rows = lines.slice(2).map((r) =>
        r
          .trim()
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim()),
      );
      out.push(
        <div key={`tbl-${bIdx}`} className="my-6 overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-panel/60 text-white">
              <tr>
                {headers.map((h, hi) => (
                  <th
                    key={`th-${bIdx}-${hi}`}
                    className="text-left px-3 py-2 font-semibold border-b border-border"
                  >
                    {renderInline(h, `th-${bIdx}-${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={`tr-${bIdx}-${ri}`} className="border-b border-border/60 last:border-0">
                  {row.map((cell, ci) => (
                    <td
                      key={`td-${bIdx}-${ri}-${ci}`}
                      className="px-3 py-2 text-slate-300"
                    >
                      {renderInline(cell, `td-${bIdx}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      return;
    }

    if (block.startsWith("> ")) {
      out.push(
        <blockquote
          key={`bq-${bIdx}`}
          className="my-5 border-l-2 border-accent pl-4 italic text-slate-300"
        >
          {renderInline(block.slice(2), `bq-${bIdx}`)}
        </blockquote>,
      );
      return;
    }

    out.push(
      <p
        key={`p-${bIdx}`}
        className="my-4 text-slate-300 leading-relaxed"
      >
        {renderInline(block, `p-${bIdx}`)}
      </p>,
    );
  });

  return out;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-bg text-white">
      <article className="max-w-3xl mx-auto px-6 py-14 md:py-20">
        <div className="mb-6">
          <Link
            href="/blog"
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1"
          >
            ← Blog'a dön
          </Link>
        </div>

        <div className="text-4xl mb-4" aria-hidden>
          {post.coverEmoji ?? "📰"}
        </div>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-400 uppercase tracking-wider">
          <span className="inline-flex items-center gap-1">
            <User className="w-3 h-3" aria-hidden strokeWidth={2} />
            {post.author}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" aria-hidden strokeWidth={2} />
            {dateFormat.format(new Date(post.publishedAt))}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden strokeWidth={2} />
            {post.readingMinutes} dk okuma
          </span>
        </div>

        <p className="mt-6 text-base md:text-lg text-slate-300 leading-relaxed border-l-2 border-accent/60 pl-4">
          {post.excerpt}
        </p>

        <div className="mt-8">{renderMarkdown(post.bodyMarkdown)}</div>

        <div className="mt-14 card">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 border border-accent/20 text-accent mb-4 uppercase tracking-wider">
            Sıradaki adım
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-3">
            Bakmakta olduğun ilanı <span className="gradient-text">analiz et</span>
          </h3>
          <p className="text-slate-300 mb-5 leading-relaxed">
            8 saniyede gerçek pazar değeri, km sinyali, boya-hasar kontrolü ve
            pazarlık skoru. İlk 3 analiz ücretsiz.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/analiz" className="btn-primary">
              İlanımı analiz et
              <ArrowRight className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            </Link>
            <Link href="/kayit" className="btn-ghost">
              Ücretsiz kayıt
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-5">
              Benzer yazılar
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="card card-interactive group"
                >
                  <div className="text-2xl mb-3" aria-hidden>
                    {r.coverEmoji ?? "📰"}
                  </div>
                  <h4 className="font-semibold text-base tracking-tight text-white group-hover:text-accent transition mb-2">
                    {r.title}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {r.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
