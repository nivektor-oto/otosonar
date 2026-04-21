import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFounderSession } from "@/lib/founder-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csv(v: unknown): string {
  const s = v === undefined || v === null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const session = await getFounderSession();
  if (!session) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { customerNumber: "asc" },
    include: {
      dealer: { select: { companyName: true, cityId: true, taxNo: true, verificationStatus: true } },
      subscriptions: {
        where: { status: { in: ["ACTIVE", "TRIAL"] } },
        select: { tier: true, status: true },
        take: 1,
      },
    },
    take: 10000,
  });

  const headers = [
    "customerNumber",
    "id",
    "email",
    "fullName",
    "phone",
    "userType",
    "emailVerified",
    "createdAt",
    "lastLoginAt",
    "marketingOptIn",
    "subscription",
    "companyName",
    "cityId",
    "taxNo",
    "dealerVerification",
  ];
  const lines = [headers.join(",")];
  for (const u of users) {
    const sub = u.subscriptions[0];
    lines.push(
      [
        csv(`OS-${String(u.customerNumber).padStart(6, "0")}`),
        csv(u.id),
        csv(u.email),
        csv(u.fullName),
        csv(u.phone),
        csv(u.userType),
        csv(u.emailVerified?.toISOString() ?? ""),
        csv(u.createdAt.toISOString()),
        csv(u.lastLoginAt?.toISOString() ?? ""),
        csv(u.marketingOptIn),
        csv(sub ? `${sub.tier}/${sub.status}` : ""),
        csv(u.dealer?.companyName ?? ""),
        csv(u.dealer?.cityId ?? ""),
        csv(u.dealer?.taxNo ?? ""),
        csv(u.dealer?.verificationStatus ?? ""),
      ].join(","),
    );
  }
  const body = lines.join("\n") + "\n";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="otosonar-musteriler-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
