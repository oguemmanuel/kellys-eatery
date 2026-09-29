import "server-only";

// Simple fixed-window limiter kept in memory. Each server instance counts on
// its own, which is enough to stop a script hammering the order form.
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    if (hits.size > 5000) hits.clear();
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
