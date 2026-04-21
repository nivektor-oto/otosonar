"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, LogOut } from "lucide-react";
import { toast } from "sonner";

export function FounderLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/founder/logout", { method: "POST" });
      router.push("/yonetici/giris");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-panel/60 hover:bg-panel text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
    >
      <LogOut className="w-3.5 h-3.5" aria-hidden strokeWidth={2} />
      Çıkış
    </button>
  );
}

export function ExportCsvButton() {
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const res = await fetch("/api/founder/waitlist-csv");
      if (!res.ok) {
        toast.error("CSV indirme başarısız");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `otosonar-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV indirildi");
    } catch {
      toast.error("İndirme hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-panel/60 hover:bg-panel hover:border-accent/40 text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50"
    >
      <Download className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
      {loading ? "İndiriliyor…" : "CSV indir"}
    </button>
  );
}
