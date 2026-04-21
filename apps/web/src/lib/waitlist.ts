import { z } from "zod";
import { PrismaClient, WaitlistUserType } from "@prisma/client";

export const waitlistEntrySchema = z
  .object({
    email: z.string().email().max(200),
    fullName: z.string().min(2).max(80).optional(),
    userType: z.enum(["buyer", "dealer", "broker"]),
    city: z.string().max(40).optional(),
    referralSource: z.string().max(60).optional(),
    kvkkConsent: z.literal(true),
  })
  .strict();

export type WaitlistInput = z.infer<typeof waitlistEntrySchema>;

export interface WaitlistRecord {
  id: string;
  email: string;
  fullName: string | null;
  userType: "buyer" | "dealer" | "broker";
  city: string | null;
  referralSource: string | null;
  queueNumber: number;
  createdAt: Date;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findByEmail(email: string): Promise<WaitlistRecord | null> {
  const rec = await prisma.waitlistEntry.findUnique({
    where: { email: normalizeEmail(email) },
  });
  return rec as WaitlistRecord | null;
}

export async function addEntry(
  input: WaitlistInput,
  ipHash?: string,
): Promise<{ created: boolean; record: WaitlistRecord }> {
  const normalized = normalizeEmail(input.email);
  try {
    const rec = await prisma.waitlistEntry.create({
      data: {
        email: normalized,
        fullName: input.fullName ?? null,
        userType: input.userType as WaitlistUserType,
        city: input.city ?? null,
        referralSource: input.referralSource ?? null,
        ipHash: ipHash ?? null,
      },
    });
    return { created: true, record: rec as WaitlistRecord };
  } catch (err: unknown) {
    // Unique email violation → duplicate; return existing record
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      const existing = await prisma.waitlistEntry.findUnique({
        where: { email: normalized },
      });
      if (existing) {
        return { created: false, record: existing as WaitlistRecord };
      }
    }
    throw err;
  }
}

export async function getStats(): Promise<{
  total: number;
  dealers: number;
  buyers: number;
}> {
  const [total, dealers, buyers] = await Promise.all([
    prisma.waitlistEntry.count(),
    prisma.waitlistEntry.count({ where: { userType: "dealer" } }),
    prisma.waitlistEntry.count({ where: { userType: "buyer" } }),
  ]);
  return { total, dealers, buyers };
}

export async function listAll(limit = 500): Promise<WaitlistRecord[]> {
  const recs = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return recs as WaitlistRecord[];
}
