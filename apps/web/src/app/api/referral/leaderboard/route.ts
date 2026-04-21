import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const codes = await prisma.referralCode.findMany({
    where: { usesCount: { gt: 0 } },
    orderBy: { usesCount: "desc" },
    take: 20,
  });
  if (codes.length === 0) return NextResponse.json({ success: true, leaderboard: [] });

  const owners = await prisma.user.findMany({
    where: { id: { in: codes.map((c) => c.ownerId) } },
    select: { id: true, fullName: true, customerNumber: true },
  });
  const byId = new Map(owners.map((o) => [o.id, o]));

  const rows = codes.map((c, i) => {
    const owner = byId.get(c.ownerId);
    return {
      rank: i + 1,
      initials: owner ? maskName(owner.fullName) : "—",
      customerNumber: owner ? `OS-${String(owner.customerNumber).padStart(6, "0")}` : "",
      uses: c.usesCount,
    };
  });

  return NextResponse.json({ success: true, leaderboard: rows });
}

function maskName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.map((p, i) => {
    const head = p.charAt(0).toUpperCase();
    if (i === 0) return `${head}${p.length > 1 ? p.charAt(1).toLowerCase() : ""}.`;
    return `${head}.`;
  }).join(" ");
}
