"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const b64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function PushToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);

    fetch("/api/push/subscribe")
      .then((r) => r.json())
      .then((d) => {
        if (d.enabled && d.publicKey) setPublicKey(d.publicKey);
      })
      .catch(() => undefined);

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => undefined);
  }, []);

  async function enable() {
    if (!publicKey) {
      toast.error("Push servisi bağlanmadı.");
      return;
    }
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("İzin verilmedi.");
        return;
      }
      const keyArray = urlBase64ToUint8Array(publicKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyArray.buffer.slice(
          keyArray.byteOffset,
          keyArray.byteOffset + keyArray.byteLength,
        ) as ArrayBuffer,
      });
      const raw = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      });
      setSubscribed(true);
      toast.success("Bildirimler açıldı.");
    } catch (e) {
      console.error(e);
      toast.error("Açılamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
      setSubscribed(false);
      toast.success("Bildirimler kapatıldı.");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Push bildirimleri</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Yeni fırsat araçları, teklif güncellemeleri ve pazar uyarılarını anlık al.
          </p>
        </div>
        {subscribed ? (
          <button
            disabled={loading}
            onClick={disable}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-xs hover:bg-neutral-900 disabled:opacity-50"
          >
            {loading ? "…" : "Kapat"}
          </button>
        ) : (
          <button
            disabled={loading || !publicKey}
            onClick={enable}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "…" : "Bildirimleri aç"}
          </button>
        )}
      </div>
    </section>
  );
}
