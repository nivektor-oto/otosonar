"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function FavoritesActions({ savedId }: { savedId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function remove() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/saved-listings/${savedId}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error("Çıkarılamadı");
          return;
        }
        toast.success("Favorilerden çıkarıldı");
        router.refresh();
      } catch {
        toast.error("Ağ hatası");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      className="text-xs text-neutral-500 hover:text-red-400 inline-flex items-center gap-1 disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" strokeWidth={2.5} />}
      Çıkar
    </button>
  );
}
