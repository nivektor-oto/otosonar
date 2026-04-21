import crypto from "node:crypto";

/**
 * Raw key shape: `os_live_<24 url-safe base64 chars>`.
 * - Display prefix = first 8 chars of the raw key (e.g. "os_live_").
 *   The dashboard pairs this with the next few characters of the full key
 *   when the raw is still known (right after creation).
 * - Hash = SHA-256 hex of the raw key. Only the hash is persisted.
 */
const RAW_PREFIX = "os_live_";
const SECRET_BYTES = 18; // 18 raw bytes → 24 url-safe base64 chars (no padding)

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const secret = crypto.randomBytes(SECRET_BYTES).toString("base64url");
  const raw = `${RAW_PREFIX}${secret}`;
  const hash = hashApiKey(raw);
  const prefix = raw.slice(0, 8);
  return { raw, hash, prefix };
}

export function hashApiKey(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
