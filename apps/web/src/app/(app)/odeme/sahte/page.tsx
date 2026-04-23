import Link from "next/link";
import { redirect } from "next/navigation";
import { isReady } from "@/lib/iyzico";

export const metadata = { title: "Ödeme — Stub mod" };
export const dynamic = "force-dynamic";

export default async function FakeCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  // İyzico aktifse bu sayfa görünmesin; kullanıcıyı hesap sayfasına gönder.
  if (isReady()) {
    redirect("/hesap/abonelik");
  }

  const { intent } = await searchParams;
  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-20 text-neutral-100">
      <div className="mx-auto max-w-md rounded-2xl border border-amber-700/40 bg-amber-900/10 p-6 text-center">
        <h1 className="mb-2 text-xl font-bold text-amber-300">Ödeme sağlayıcısı aktif değil</h1>
        <p className="text-sm text-amber-200/80">
          İyzico merchant hesabı ayarlanana kadar ödeme alınmıyor. Dev modu.
        </p>
        {intent && (
          <p className="mt-4 break-all text-xs text-neutral-400">
            Intent ID: <code className="rounded bg-black/30 px-1">{intent}</code>
          </p>
        )}
        <Link
          href="/hesap"
          className="mt-6 inline-block rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
        >
          Hesabıma dön
        </Link>
      </div>
    </main>
  );
}
