import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sendVerificationCode } from "@/lib/email";
import { isValidEmail, issueCode } from "@/lib/verification";

export const dynamic = "force-dynamic";

// Emails a single-use 6-digit code the customer can use to set a new password.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email || !isValidEmail(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  // Always answer the same way so nobody can probe which emails have accounts.
  if (!user) return Response.json({ ok: true, emailed: true });

  const issued = await issueCode(email, "password_reset");
  if (!issued.ok) return Response.json({ error: "Too many requests. Please wait a few minutes and try again." }, { status: 429 });

  try {
    const result = await sendVerificationCode(email, issued.code, "password_reset");
    return Response.json({ ok: true, emailed: result.sent });
  } catch (error) {
    console.error("[Gebna-A] Failed to send password reset code", error);
    return Response.json({ error: "We couldn't send the email right now. Please try again shortly." }, { status: 502 });
  }
}
