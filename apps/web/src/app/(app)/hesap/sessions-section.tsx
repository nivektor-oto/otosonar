"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Session {
  id: string;
  userAgent: string | null;
  lastSeenAt: string;
  createdAt: string;
}

function short(ua: string | null): string {
  if (!ua) return "Bilinmeyen cihaz";
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/android/i.test(ua)) return "Android";
  if (/windows/i.test(ua)) return "Windows";
  if (/mac/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return ua.slice(0, 40);
}

export function SessionsSection({ sessions }: { sessions: Session[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function revoke(id: string) {
    setLoadingId(id);
    const r = await fetch(`/api/auth/sessions/${id}`, { method: "DELETE" });
    setLoadingId(null);
    if (r.ok) {
      toast.success("Oturum sonlandırıldı.");
      router.refresh();
    } else {
      toast.error("İşlem başarısız.");
    }
  }

  async function revokeAllOthers() {
    if (!confirm("Diğer tüm cihazlardaki oturumlar kapatılsın mı?")) return;
    const r = await fetch("/api/auth/sessions/revoke-others", { method: "POST" });
    if (r.ok) {
      toast.success("Diğer oturumlar kapatıldı.");
      router.refresh();
    } else {
      toast.error("İşlem başarısız.");
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Aktif oturumlar ({sessions.length})</h2>
        {sessions.length > 1 && (
          <button
            onClick={revokeAllOthers}
            className="rounded-lg border border-red-700/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/20"
          >
            Diğerlerini kapat
          </button>
        )}
      </div>
      {sessions.length === 0 ? (
        <p className="text-xs text-neutral-500">Aktif oturum yok.</p>
      ) : (
        <ul className="divide-y divide-neutral-800 text-sm">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{short(s.userAgent)}</div>
                <div className="text-xs text-neutral-500">
                  Son aktif: {new Date(s.lastSeenAt).toLocaleString("tr-TR")}
                </div>
              </div>
              <button
                disabled={loadingId === s.id}
                onClick={() => revoke(s.id)}
                className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs hover:border-red-500 hover:bg-red-900/20 disabled:opacity-50"
              >
                {loadingId === s.id ? "…" : "Çıkış"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
