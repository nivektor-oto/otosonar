import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/dealer-api-key";
import { checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLATE_RE = /^[0-9]{2}\s?[A-Z]{1,3}\s?[0-9]{2,4}$/i;

function normalizePlate(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

const vehicleSchema = z.object({
  plate: z.string().min(4).max(15),
  brand: z.string().min(1).max(40),
  model: z.string().min(1).max(60),
  year: z.number().int().min(1970).max(new Date().getFullYear() + 1),
  km: z.number().int().min(0).max(2_000_000).optional(),
  purchasePrice: z.number().int().min(0).max(50_000_000).optional(),
  askingPrice: z.number().int().min(0).max(50_000_000).optional(),
  bodyType: z.string().max(30).optional(),
  vin: z.string().max(20).optional(),
  fuelType: z.string().max(30).optional(),
  transmission: z.string().max(30).optional(),
  photos: z.array(z.string().url()).max(20).optional(),
}).strict();

const bodySchema = z.object({
  vehicles: z.array(vehicleSchema).min(1).max(50),
}).strict();

interface KeyRow {
  id: string;
  dealerId: string;
  revokedAt: Date | null;
}

async function authenticate(req: Request): Promise<
  | { ok: true; key: KeyRow }
  | { ok: false; status: number; error: string }
> {
  const header = req.headers.get("x-api-key");
  if (!header) return { ok: false, status: 401, error: "missing_api_key" };
  const hash = hashApiKey(header);
  const key = await prisma.dealerApiKey.findUnique({
    where: { keyHash: hash },
    select: { id: true, dealerId: true, revokedAt: true },
  });
  if (!key) return { ok: false, status: 401, error: "invalid_api_key" };
  if (key.revokedAt) return { ok: false, status: 401, error: "key_revoked" };
  return { ok: true, key };
}

export async function GET(req: Request) {
  const auth = await authenticate(req);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const rl = await checkRateLimit(`external.stock:${auth.key.id}`, 60, 60);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  // Touch last-used metadata. Fire-and-forget style to keep the response fast.
  prisma.dealerApiKey
    .update({
      where: { id: auth.key.id },
      data: { lastUsedAt: new Date(), requestsCount: { increment: 1 } },
    })
    .catch(() => undefined);

  const dealer = await prisma.dealer.findUnique({
    where: { id: auth.key.dealerId },
    select: { companyName: true, _count: { select: { vehicles: true } } },
  });
  if (!dealer) {
    return NextResponse.json({ success: false, error: "dealer_not_found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    dealer: {
      companyName: dealer.companyName,
      stockCount: dealer._count.vehicles,
    },
  });
}

export async function POST(req: Request) {
  const auth = await authenticate(req);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const rl = await checkRateLimit(`external.stock:${auth.key.id}`, 60, 60);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  prisma.dealerApiKey
    .update({
      where: { id: auth.key.id },
      data: { lastUsedAt: new Date(), requestsCount: { increment: 1 } },
    })
    .catch(() => undefined);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const errors: Array<{ plate: string; reason: string }> = [];
  let created = 0;
  let updated = 0;

  for (const v of parsed.data.vehicles) {
    if (!PLATE_RE.test(v.plate)) {
      errors.push({ plate: v.plate, reason: "invalid_plate_format" });
      continue;
    }
    const plate = normalizePlate(v.plate);

    try {
      const existing = await prisma.vehicle.findUnique({
        where: { plate },
        select: { id: true, dealerId: true },
      });

      if (existing && existing.dealerId !== auth.key.dealerId) {
        errors.push({ plate, reason: "plate_owned_by_another_dealer" });
        continue;
      }

      const photosJson = v.photos && v.photos.length ? (v.photos as unknown) : null;
      const common = {
        brand: v.brand,
        model: v.model,
        year: v.year,
        km: v.km ?? null,
        purchasePrice: v.purchasePrice ?? null,
        askingPrice: v.askingPrice ?? null,
        bodyType: v.bodyType ?? null,
        vin: v.vin ? v.vin.toUpperCase() : null,
        fuelType: v.fuelType ?? null,
        transmission: v.transmission ?? null,
        photosJson: photosJson as never,
      };

      if (existing) {
        await prisma.vehicle.update({ where: { plate }, data: common });
        updated += 1;
      } else {
        await prisma.vehicle.create({
          data: {
            dealerId: auth.key.dealerId,
            plate,
            ...common,
          },
        });
        created += 1;
      }
    } catch (err) {
      await logError(err, {
        path: "/api/external/stock",
        metadata: { keyId: auth.key.id, plate: v.plate },
      });
      errors.push({ plate: v.plate, reason: "server_error" });
    }
  }

  return NextResponse.json({ success: true, created, updated, errors });
}
