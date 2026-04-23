"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, UserCheck, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import {
  disableUserAction,
  enableUserAction,
  promoteUserAction,
  demoteUserAction,
  softDeleteUserAction,
} from "./actions";

interface Props {
  userId: string;
  disabled: boolean;
  role: string;
  viewerIsFullAdmin: boolean;
  isSelf: boolean;
}

export function UserActionButtons({
  userId,
  disabled,
  role,
  viewerIsFullAdmin,
  isSelf,
}: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handle(
    fn: (id: string) => Promise<{ ok: boolean; error?: string }>,
    successMsg: string,
    confirmMsg?: string,
  ) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    startTransition(async () => {
      const res = await fn(userId);
      if (res.ok) {
        toast.success(successMsg);
        router.refresh();
      } else {
        toast.error(res.error ?? "Hata oluştu");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {disabled ? (
        <button
          type="button"
          disabled={pending || isSelf}
          onClick={() => handle(enableUserAction, "Hesap yeniden aktif")}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm"
        >
          <UserCheck className="h-4 w-4" /> Aktif et
        </button>
      ) : (
        <button
          type="button"
          disabled={pending || isSelf}
          onClick={() =>
            handle(
              disableUserAction,
              "Hesap askıya alındı",
              "Bu hesabı askıya almak istediğinden emin misin?",
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm"
        >
          <Ban className="h-4 w-4" /> Askıya al
        </button>
      )}

      {viewerIsFullAdmin && role !== "ADMIN" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            handle(
              promoteUserAction,
              role === "MODERATOR" ? "ADMIN'e terfi etti" : "MODERATOR yapıldı",
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold disabled:opacity-50"
        >
          <ArrowUp className="h-4 w-4" />
          {role === "MODERATOR" ? "ADMIN'e terfi" : "MODERATOR yap"}
        </button>
      ) : null}

      {viewerIsFullAdmin && role !== "USER" && !isSelf ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            handle(
              demoteUserAction,
              "Rol düşürüldü",
              "Bu kullanıcının rolünü düşürmek istediğinden emin misin?",
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold disabled:opacity-50"
        >
          <ArrowDown className="h-4 w-4" />
          Rol düşür
        </button>
      ) : null}

      {viewerIsFullAdmin && !isSelf && role !== "ADMIN" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            handle(
              softDeleteUserAction,
              "Hesap silindi (soft)",
              "Bu hesabı SOFT DELETE yapmak istediğinden emin misin? Geri alınabilir ama listelerden kaybolur.",
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 text-sm font-semibold disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" /> Sil
        </button>
      ) : null}
    </div>
  );
}
