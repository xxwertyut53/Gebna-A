import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { name?: string; email?: string; phone?: string; password?: string } | null;
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const phone = normalizePhone(body?.phone || "");
  const password = body?.password;
  if (!name || !email || !phone || !password || password.length < 6) return Response.json({ error: "Name, email, phone, and a 6+ character password are required." }, { status: 400 });
  const existing = await db.select({ id: users.id }).from(users).where(or(eq(users.email, email), eq(users.phone, phone))).limit(1);
  if (existing.length) return Response.json({ error: "An account with that email or phone already exists." }, { status: 409 });
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(users).values({ name, email, phone, passwordHash, role: "customer" }).returning({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role });
  await createSession(user.id);
  return Response.json({ user });
}
