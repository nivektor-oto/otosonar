"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-900"
    >
      Çıkış yap
    </button>
  );
}
