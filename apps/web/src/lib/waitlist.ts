import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

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

export interface WaitlistRecord extends WaitlistInput {
  id: string;
  queueNumber: number;
  createdAt: string;
  ipHash?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "waitlist.jsonl");

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "", "utf8");
  }
}

async function readAll(): Promise<WaitlistRecord[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE, "utf8");
  if (!raw.trim()) return [];
  return raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as WaitlistRecord);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function genId(): string {
  return `wl_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export async function findByEmail(email: string): Promise<WaitlistRecord | null> {
  const records = await readAll();
  const normalized = normalizeEmail(email);
  return records.find((r) => normalizeEmail(r.email) === normalized) ?? null;
}

// In-process async mutex — serializes addEntry() calls so read-then-append
// cannot race. Paralel POST istekleri kuyruğa girer, queueNumber deterministic
// artar. MVP (file-based storage) için yeterli; Postgres geçişinde gerekmez.
let writeChain: Promise<unknown> = Promise.resolve();

export async function addEntry(
  input: WaitlistInput,
  ipHash?: string,
): Promise<{ created: boolean; record: WaitlistRecord }> {
  const task = async (): Promise<{ created: boolean; record: WaitlistRecord }> => {
    const records = await readAll();
    const normalized = normalizeEmail(input.email);
    const existing = records.find((r) => normalizeEmail(r.email) === normalized);
    if (existing) {
      return { created: false, record: existing };
    }
    const record: WaitlistRecord = {
      ...input,
      email: normalized,
      id: genId(),
      queueNumber: records.length + 1,
      createdAt: new Date().toISOString(),
      ipHash,
    };
    await fs.appendFile(FILE, JSON.stringify(record) + "\n", "utf8");
    return { created: true, record };
  };
  const next = writeChain.then(task, task);
  writeChain = next.catch(() => undefined);
  return next;
}

export async function getStats(): Promise<{ total: number; dealers: number; buyers: number }> {
  const records = await readAll();
  return {
    total: records.length,
    dealers: records.filter((r) => r.userType === "dealer").length,
    buyers: records.filter((r) => r.userType === "buyer").length,
  };
}
