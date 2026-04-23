"use client";

import { useState } from "react";
import { Download, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export function KvkkPanel({
  email,
  hasPassword,
}: {
  email: string;
  hasPassword: boolean;
}) {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export", { method: "GET" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(
          j?.error === "rate_limited"
            ? "Çok sık istediniz. Bir saat sonra tekrar deneyin."
            : "Dışa aktarma başarısız.",
        );
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] ??
        "otosonar-verilerim.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Verileriniz indirildi.");
    } catch {
      toast.error("Dışa aktarma başarısız.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (confirmPhrase.trim() !== "HESABIMI SİL") {
      toast.error('Onay metnini aynen "HESABIMI SİL" olarak yazmalısınız.');
      return;
    }
    if (!password) {
      toast.error("Şifrenizi girin.");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, confirmPhrase, reason: reason || undefined }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) {
        const map: Record<string, string> = {
          rate_limited: "Çok sık denediniz. Bir saat sonra tekrar deneyin.",
          password_invalid: "Şifre doğru değil.",
          confirm_phrase_mismatch: 'Onay metnini "HESABIMI SİL" olarak yazın.',
          no_password_on_account: "Bu hesap sosyal girişle açılmış; silme için destek gerekli.",
        };
        toast.error(map[j.error] ?? "Hesap silinemedi.");
        setDeleting(false);
        return;
      }
      toast.success("Hesabınız silindi. Sonsuza dek.");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch {
      toast.error("Hesap silinemedi.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Download className="h-5 w-5 text-emerald-400" />
              Verilerimi İndir
            </h2>
            <p className="text-sm text-neutral-400">
              Profil bilgilerin, analizler, ilanlar, mesajlar, abonelik geçmişi — hepsi tek JSON
              dosyasında. Saatte 3 kez isteyebilirsin.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="shrink-0 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {exporting ? "Hazırlanıyor…" : "İndir"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6">
        <div className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-red-300">
            <ShieldAlert className="h-5 w-5" />
            Hesabımı Kalıcı Olarak Sil
          </h2>
          <p className="text-sm text-neutral-400">
            Tüm verilerin (profil, analizler, ilanlar, mesajlar, abonelik) Neon veritabanından
            geri alınamaz şekilde silinir. Yalnızca KVKK kanıtı için e-posta ve kullanıcı ID'nin
            SHA-256 hash'i kalır — içerik kalmaz.
          </p>
          <p className="text-xs text-neutral-500">
            Giriş e-posta: <span className="font-mono text-neutral-300">{email}</span>
          </p>
        </div>

        {!confirmOpen ? (
          <button
            onClick={() => setConfirmOpen(true)}
            className="mt-4 rounded-2xl border border-red-900 bg-red-950/40 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-900/40"
          >
            Hesap silme akışını başlat
          </button>
        ) : (
          <div className="mt-4 space-y-3">
            {!hasPassword && (
              <div className="rounded-xl border border-amber-900 bg-amber-950/30 p-3 text-xs text-amber-200">
                Bu hesapta şifre kayıtlı değil (sosyal giriş). Silme için destek ile iletişime geç.
              </div>
            )}
            <label className="block space-y-1">
              <span className="text-sm text-neutral-300">
                Şifren <span className="text-red-400">*</span>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!hasPassword}
                autoComplete="current-password"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                placeholder="••••••••"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm text-neutral-300">
                Onay metni — aynen yaz:{" "}
                <span className="font-mono text-red-300">HESABIMI SİL</span>
              </span>
              <input
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:border-red-500 focus:outline-none"
                placeholder="HESABIMI SİL"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm text-neutral-300">
                Neden? <span className="text-neutral-500">(opsiyonel)</span>
              </span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                rows={2}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
                placeholder="İyileştirebilmemiz için kısaca nedenini yazabilirsin."
              />
            </label>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting || !hasPassword}
                className="flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Siliniyor…" : "Hesabı kalıcı olarak sil"}
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-2xl border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-900"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
