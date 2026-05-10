import crypto from "crypto";

// Single source of truth for "who is this request?" — used by rate
// limiting and reaction dedupe. Never store the raw IP anywhere; always
// hash it with the per-deploy salt before using it as a key.

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

// Stable per-deploy hash. The salt prevents rainbow-table lookups against
// well-known IPs and lets us rotate keys by changing the env var. If the
// salt is missing in dev we fall back to a fixed dev salt — collisions
// across machines don't matter locally and we never want a "secret missing"
// error to break the form.
const DEV_FALLBACK_SALT = "bragme-dev-salt";

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || DEV_FALLBACK_SALT;
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function clientFingerprint(req: Request): string {
  return hashIp(getClientIp(req));
}
