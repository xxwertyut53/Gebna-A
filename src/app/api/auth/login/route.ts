import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; phone?: string; password?: string; remember?: boolean } | null;
  const email = body?.email?.trim().toLowerCase();
  const phone = normalizePhone(body?.phone || "");
  const password = body?.password;
  if (!email || !phone || !password) return Response.json({ error: "Email, phone number, and password are required." }, { status: 400 });
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const phoneMatches = user && normalizePhone(user.phone) === phone;
  if (!user?.passwordHash || !phoneMatches || !(await bcrypt.compare(password, user.passwordHash))) return Response.json({ error: "Email, phone number, or password is incorrect." }, { status: 401 });
  await createSession(user.id, body?.remember !== false);
  return Response.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
}
