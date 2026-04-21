import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { getStats } from "@/lib/referral";
import { CopyInviteLink } from "./copy";

export const dynamic = "force-dynamic";
export const metadata = { title: "Davet et, kazan — OtoSonar" };

export default async function ReferralPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const stats = await getStats(user.id);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://otosonar.com";
  const link = `${base}/kayit?ref=${stats.code}`;

  return (
    <main className="min-h-dvh bg-[#0a0a0f] px-4 py-16 text-neutral-100">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Davet et, kazan</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Her başarılı davet için 1 ay ücretsiz Plus + arkadaşına %20 indirim kuponu.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#12121a] p-6">
          <div className="text-xs text-neutral-500">Davet kodun</div>
          <div className="mt-1 font-mono text-3xl font-bold tracking-wider text-emerald-400">
            {stats.code}
          </div>
          <div className="mt-4 text-xs text-neutral-500">Davet linkin</div>
          <CopyInviteLink link={link} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Toplam kullanım" value={String(stats.uses)} />
          <Stat label="Ödül bekleyen" value={String(stats.pending)} />
        </div>

        <div className="rounded-xl border border-neutral-800 bg-[#12121a] p-4 text-xs text-neutral-400">
          <b className="text-neutral-300">Nasıl çalışır:</b> Arkadaşın linkinle kayıt olur, ilk ücretli
          aboneliğini aktive eder → sana bir ay Plus hediyesi düşer, ona %20 kupon.
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#12121a] p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
