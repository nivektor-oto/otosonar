import { redirect } from "next/navigation";
import Link from "next/link";
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

        <Link
          href="/davet/sirala"
          className="block rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 to-accent2/5 p-4 hover:from-accent/20 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              🏆
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-sm">Davet sıralaması</div>
              <div className="text-xs text-slate-400 mt-0.5">En çok davet eden 20 kişi — sen de listeye girebilirsin</div>
            </div>
            <span className="text-accent text-sm font-bold">→</span>
          </div>
        </Link>
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
