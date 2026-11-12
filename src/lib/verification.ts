import bcrypt from "bcryptjs";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { verificationCodes } from "@/db/schema";

export const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const MAX_REQUESTS_PER_WINDOW = 5;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Creates a fresh one-time code for the email, invalidating any previous unused
// ones. Throttled so a single email cannot be spammed with codes.
export async function issueCode(email: string, purpose = "password_reset") {
  const windowStart = new Date(Date.now() - CODE_TTL_MINUTES * 60 * 1000);
  const [recent] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(verificationCodes)
    .where(and(eq(verificationCodes.email, email), eq(verificationCodes.purpose, purpose), gt(verificationCodes.createdAt, windowStart)));
  if ((recent?.count ?? 0) >= MAX_REQUESTS_PER_WINDOW) return { ok: false as const, reason: "too_many_requests" as const };

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  await db
    .update(verificationCodes)
    .set({ consumedAt: new Date() })
    .where(and(eq(verificationCodes.email, email), eq(verificationCodes.purpose, purpose), isNull(verificationCodes.consumedAt)));
  await db.insert(verificationCodes).values({
    email,
    codeHash,
    purpose,
    expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
  });
  return { ok: true as const, code };
}

// Verifies a code and marks it used. Wrong guesses are counted and the code is
// burned after too many failed attempts.
export async function consumeCode(email: string, code: string, purpose = "password_reset") {
  const [record] = await db
    .select()
    .from(verificationCodes)
    .where(and(eq(verificationCodes.email, email), eq(verificationCodes.purpose, purpose), isNull(verificationCodes.consumedAt), gt(verificationCodes.expiresAt, new Date())))
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1);
  if (!record) return { ok: false as const, reason: "invalid" as const };
  if (record.attempts >= MAX_ATTEMPTS) {
    await db.update(verificationCodes).set({ consumedAt: new Date() }).where(eq(verificationCodes.id, record.id));
    return { ok: false as const, reason: "invalid" as const };
  }
  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    await db.update(verificationCodes).set({ attempts: record.attempts + 1 }).where(eq(verificationCodes.id, record.id));
    return { ok: false as const, reason: "invalid" as const };
  }
  await db.update(verificationCodes).set({ consumedAt: new Date() }).where(eq(verificationCodes.id, record.id));
  return { ok: true as const };
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}
