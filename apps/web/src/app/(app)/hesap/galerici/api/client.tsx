"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Copy, X, KeyRound, AlertTriangle } from "lucide-react";

interface ApiKey {
  id: string;
  label: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  requestsCount: number;
}

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKey[] }) {
  const router = useRouter();
  const [keys, setKeys] = useState(initialKeys);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [freshKey, setFreshKey] = useState<{ raw: string; label: string } | null>(null);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      toast.error("Etiket gerekli.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/dealer/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error === "rate_limited" ? "Çok hızlı — biraz bekle." : "Anahtar üretilemedi.");
        return;
      }
      setFreshKey({ raw: data.raw as string, label: trimmed });
      setLabel("");
      router.refresh();
      // Refresh in-memory list via a GET
      const listRes = await fetch("/api/dealer/api-keys");
      const listData = await listRes.json();
      if (listData?.success) setKeys(listData.keys as ApiKey[]);
    } finally {
      setCreating(false);
    }
  }

  async function onRevoke(id: string) {
    if (!confirm("Bu anahtarı iptal etmek istediğine emin misin? Kullanan sistemler 401 alacak.")) return;
    const res = await fetch(`/api/dealer/api-keys/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      toast.error("İptal edilemedi.");
      return;
    }
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k)),
    );
    toast.success("Anahtar iptal edildi.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-panel/40 p-5">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          Yeni anahtar
        </h2>
        <form onSubmit={onCreate} className="flex flex-col sm:flex-row gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={80}
            placeholder="Örn: Galeri CRM, Excel Makro"
            className="flex-1 rounded-lg border border-border bg-panel/60 px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <KeyRound className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            {creating ? "Oluşturuluyor…" : "Oluştur"}
          </button>
        </form>
        <p className="text-[11px] text-slate-500 mt-2">
          Anahtar yalnızca üretildiği an bir kere gösterilir. Kopyala ve güvenli yerde sakla.
        </p>
      </section>

      {freshKey && <FreshKeyModal raw={freshKey.raw} label={freshKey.label} onClose={() => setFreshKey(null)} />}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Mevcut anahtarlar ({keys.length})</h2>
        {keys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-panel/20 p-10 text-center text-sm text-slate-400">
            Henüz anahtar yok. Yukarıdan ilk anahtarını üret.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-panel/60 text-left text-[10px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Etiket</th>
                  <th className="px-3 py-3 font-semibold">Önek</th>
                  <th className="px-3 py-3 font-semibold">Oluşturuldu</th>
                  <th className="px-3 py-3 font-semibold">Son kullanım</th>
                  <th className="px-3 py-3 font-semibold">Kullanım</th>
                  <th className="px-3 py-3 font-semibold">Durum</th>
                  <th className="px-3 py-3 font-semibold text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-t border-border hover:bg-panel/30">
                    <td className="px-4 py-3 font-semibold">{k.label}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-300">{k.prefix}…</td>
                    <td className="px-3 py-3 text-xs text-slate-400">
                      {new Date(k.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">
                      {k.lastUsedAt
                        ? new Date(k.lastUsedAt).toLocaleString("tr-TR")
                        : "—"}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-slate-300">{k.requestsCount}</td>
                    <td className="px-3 py-3">
                      {k.revokedAt ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300">
                          İptal edildi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {!k.revokedAt && (
                        <button
                          onClick={() => onRevoke(k.id)}
                          className="text-red-400 hover:text-red-300 inline-flex items-center gap-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden strokeWidth={2.5} />
                          İptal et
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <DocsBlock />
    </div>
  );
}

function FreshKeyModal({
  raw,
  label,
  onClose,
}: {
  raw: string;
  label: string;
  onClose: () => void;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(raw);
      toast.success("Anahtar kopyalandı.");
    } catch {
      toast.error("Kopyalanamadı — elle seç.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-accent/30 bg-[#12121a] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold inline-flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-accent" aria-hidden strokeWidth={2.5} />
            Yeni anahtar: {label}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" aria-hidden strokeWidth={2.5} />
          </button>
        </div>

        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200 mb-3 inline-flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden strokeWidth={2.5} />
          <span>
            Bu anahtarı şimdi kopyala, bir daha gösterilmeyecek. Kaybedersen yeni bir tane üretmen gerekir.
          </span>
        </div>

        <div className="rounded-lg border border-border bg-black/40 p-3 font-mono text-xs break-all mb-3">
          {raw}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={copy} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Copy className="w-4 h-4" aria-hidden strokeWidth={2.5} />
            Kopyala
          </button>
          <button onClick={onClose} className="btn-ghost text-sm">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

function DocsBlock() {
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://otosonar.com";
  const endpoint = `${siteUrl}/api/external/stock`;
  const curl = `curl -X POST ${endpoint} \\
  -H "X-API-Key: os_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "vehicles": [
      {
        "plate": "34 ABC 123",
        "brand": "BMW",
        "model": "3.20",
        "year": 2019,
        "km": 85000,
        "purchasePrice": 750000,
        "askingPrice": 820000,
        "bodyType": "sedan"
      }
    ]
  }'`;

  return (
    <section className="rounded-2xl border border-border bg-panel/30 p-5 text-sm">
      <h2 className="font-semibold mb-2">Nasıl kullanılır?</h2>
      <ul className="text-xs text-slate-400 space-y-1 mb-3 list-disc pl-5">
        <li>Anahtarı üret ve kendi CRM/Excel sisteminin ayarlarına ekle.</li>
        <li>
          <code className="text-accent">POST {endpoint}</code> üzerine JSON gönder.
        </li>
        <li>Mevcut plaka → güncelleme, yeni plaka → kayıt. Tek istekte max 50 araç.</li>
        <li>Dakikada 60 istek sınırı var. Fazlası 429 döner.</li>
        <li>Bağlantıyı test için <code className="text-accent">GET {endpoint}</code> kullanabilirsin.</li>
      </ul>
      <pre className="rounded-lg border border-border bg-black/40 p-3 text-[11px] font-mono overflow-x-auto whitespace-pre">
{curl}
      </pre>
    </section>
  );
}
