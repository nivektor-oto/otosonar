"use client";

import { useState } from "react";
import { toast } from "sonner";

export function CopyInviteLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-1 flex gap-2">
      <input
        readOnly
        value={link}
        className="flex-1 rounded-lg border border-neutral-800 bg-[#0a0a0f] px-3 py-2 text-xs text-neutral-300"
      />
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success("Kopyalandı");
            setTimeout(() => setCopied(false), 2000);
          } catch {
            toast.error("Kopyalanamadı");
          }
        }}
        className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-black hover:bg-emerald-400"
      >
        {copied ? "✓" : "Kopyala"}
      </button>
    </div>
  );
}
