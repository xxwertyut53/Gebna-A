import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { consumeCode, isValidEmail } from "@/lib/verification";

export const dynamic = "force-dynamic";

// Verifies the emailed one-time code and replaces the account password.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; code?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  const code = body?.code?.trim();
  const password = body?.password;
  if (!email || !isValidEmail(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!code || !/^\d{6}$/.test(code)) return Response.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  if (!password || password.length < 6) return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!user) return Response.json({ error: "Invalid or expired code. Request a new one." }, { status: 400 });

  const result = await consumeCode(email, code, "password_reset");
  if (!result.ok) return Response.json({ error: "Invalid or expired code. Request a new one." }, { status: 400 });

  await db.update(users).set({ passwordHash: await bcrypt.hash(password, 12), updatedAt: new Date() }).where(eq(users.id, user.id));
  // Drop every existing session so the old sessions can't be reused.
  await db.delete(sessions).where(eq(sessions.userId, user.id));
  return Response.json({ ok: true });
}
