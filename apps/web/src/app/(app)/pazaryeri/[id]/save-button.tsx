"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  listingId: string;
  initiallySaved: boolean;
  savedId?: string | null;
  compact?: boolean;
};

export function SaveListingButton({ listingId, initiallySaved, savedId: initialSavedId, compact }: Props) {
  const [saved, setSaved] = useState(initiallySaved);
  const [savedId, setSavedId] = useState<string | null>(initialSavedId ?? null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    startTransition(async () => {
      try {
        if (saved && savedId) {
          const res = await fetch(`/api/saved-listings/${savedId}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok || !data.success) {
            toast.error("Favorilerden çıkarılamadı");
            return;
          }
          setSaved(false);
          setSavedId(null);
          toast.success("Favorilerden çıkarıldı");
        } else {
          const res = await fetch("/api/saved-listings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listingId }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            if (data.error === "not_authenticated") {
              router.push(`/giris?next=/pazaryeri/${listingId}`);
              return;
            }
            if (data.error === "cannot_save_own") {
              toast.error("Kendi ilanını kaydedemezsin");
              return;
            }
            toast.error("Kaydedilemedi");
            return;
          }
          setSaved(true);
          setSavedId(data.saved?.id ?? null);
          toast.success("Favorilere eklendi — fiyat düştüğünde bildirim alacaksın");
        }
      } catch {
        toast.error("Ağ hatası");
      }
    });
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={saved ? "Favorilerden çıkar" : "Favorilere ekle"}
        className={`inline-flex items-center justify-center h-9 w-9 rounded-full border transition ${
          saved
            ? "bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30"
            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
        } disabled:opacity-50`}
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <BookmarkCheck className="w-4 h-4 fill-amber-400" strokeWidth={2.5} /> : <Bookmark className="w-4 h-4" strokeWidth={2.5} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
        saved
          ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
          : "bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-700"
      } disabled:opacity-50`}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <>
          <BookmarkCheck className="w-4 h-4 fill-amber-400" strokeWidth={2.5} />
          Favorilerde — fiyat düştüğünde haber gelir
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" strokeWidth={2.5} />
          Favorilere ekle
        </>
      )}
    </button>
  );
}
