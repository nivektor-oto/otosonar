"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

type InboxItem = {
  id: string;
  listing: {
    id: string;
    title: string;
    coverImage: string | null;
    askingPrice: number;
  };
  counterparty: { id: string; fullName: string };
  lastMessageAt: string;
  lastMessageBody: string | null;
  unread: number;
};

const TL = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const RTF = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.round((then - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return RTF.format(diffSec, "second");
  if (abs < 3600) return RTF.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return RTF.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return RTF.format(Math.round(diffSec / 86400), "day");
  if (abs < 86400 * 365) return RTF.format(Math.round(diffSec / (86400 * 30)), "month");
  return RTF.format(Math.round(diffSec / (86400 * 365)), "year");
}

export function InboxClient({ initial }: { initial: InboxItem[] }) {
  if (initial.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-10 text-center">
        <MessageSquare className="mx-auto h-10 w-10 text-neutral-600" />
        <p className="mt-4 text-sm text-neutral-400">
          Henüz mesajın yok. Pazaryerinde bir ilana bakıp satıcıyla iletişime geç.
        </p>
        <Link
          href="/pazaryeri"
          className="mt-4 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          Pazaryerine git
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-neutral-800 overflow-hidden rounded-2xl border border-neutral-800 bg-[#12121a]">
      {initial.map((row) => {
        const isUnread = row.unread > 0;
        return (
          <li key={row.id}>
            <Link
              href={`/hesap/mesajlar/${row.id}`}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-neutral-900"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                {row.listing.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.listing.coverImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-600">
                    foto yok
                  </div>
                )}
                {isUnread && (
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#12121a]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <div className={`truncate text-sm ${isUnread ? "font-bold text-neutral-100" : "font-medium text-neutral-300"}`}>
                    {row.counterparty.fullName}
                  </div>
                  <div className="shrink-0 text-[11px] text-neutral-500">{relTime(row.lastMessageAt)}</div>
                </div>
                <div className="truncate text-xs text-neutral-500">
                  {row.listing.title} · {TL.format(row.listing.askingPrice)}
                </div>
                <div className={`mt-0.5 truncate text-xs ${isUnread ? "text-neutral-200" : "text-neutral-500"}`}>
                  {row.lastMessageBody ?? "—"}
                </div>
              </div>

              {isUnread && (
                <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-black">
                  {row.unread}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
