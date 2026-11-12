import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { isValidEmail } from "@/lib/verification";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string; remember?: boolean } | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  if (!email || !password) return Response.json({ error: "Email and password are required." }, { status: 400 });
  if (!isValidEmail(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  // "Remember me" keeps the session cookie alive for 30 days; otherwise it ends when the browser closes.
  await createSession(user.id, body?.remember !== false);
  return Response.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
}
