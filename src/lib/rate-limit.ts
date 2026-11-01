import "server-only";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/crypto";

/**
 * Fixed-window rate limit stored in Postgres (works across Vercel function
 * instances, no extra service). Returns false once `limit` attempts have been
 * made for `key` in the current window of `windowSeconds`.
 */
export async function consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const hashed = hashToken(`rate:${key}`);
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${hashed}, 1, NOW() + make_interval(secs => ${windowSeconds}))
    ON CONFLICT ("key") DO UPDATE SET
      "count"   = CASE WHEN "RateLimit"."resetAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < NOW()
                       THEN NOW() + make_interval(secs => ${windowSeconds})
                       ELSE "RateLimit"."resetAt" END
    RETURNING "count"`;

  // Occasional cleanup of expired windows.
  if (Math.random() < 0.02) {
    await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 24 * 3600 * 1000) } } });
  }

  return (rows[0]?.count ?? 1) <= limit;
}

/** Client IP as seen by Vercel's edge (x-real-ip / first x-forwarded-for hop). */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export class RateLimitError extends Error {
  constructor() {
    super("Trop de tentatives. Réessayez dans quelques minutes.");
    this.name = "RateLimitError";
  }
}

/** Sign-up of new families is closed unless REGISTRATION_OPEN=true (the other parent joins by invitation). */
export function registrationOpen(): boolean {
  return process.env.REGISTRATION_OPEN === "true";
}
