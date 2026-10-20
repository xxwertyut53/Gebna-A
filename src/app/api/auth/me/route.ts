import bcrypt from "bcryptjs";
import { and, eq, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

function publicUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    offerNotifications: user.offerNotifications,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ user: user ? publicUser(user) : null });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as { name?: string; email?: string; phone?: string; password?: string; offerNotifications?: boolean } | null;
  if (body === null) return Response.json({ error: "Invalid payload." }, { status: 400 });

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return Response.json({ error: "Name cannot be empty." }, { status: 400 });
    updates.name = name;
  }

  if (body.email !== undefined) {
    const email = body.email.trim().toLowerCase();
    if (!email || !email.includes("@")) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    updates.email = email;
  }

  if (body.phone !== undefined) {
    const phone = normalizePhone(body.phone);
    if (!phone) return Response.json({ error: "Enter a valid phone number." }, { status: 400 });
    updates.phone = phone;
  }

  if (body.password !== undefined && body.password !== "") {
    if (body.password.length < 6) return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    updates.passwordHash = await bcrypt.hash(body.password, 12);
  }

  if (body.offerNotifications !== undefined) {
    if (typeof body.offerNotifications !== "boolean") return Response.json({ error: "Invalid payload." }, { status: 400 });
    updates.offerNotifications = body.offerNotifications;
  }

  if (!Object.keys(updates).length) return Response.json({ error: "Nothing to update." }, { status: 400 });

  const identityChecks = [
    updates.email ? eq(users.email, String(updates.email)) : undefined,
    updates.phone ? eq(users.phone, String(updates.phone)) : undefined,
  ].filter(Boolean);
  if (identityChecks.length) {
    const conflicts = await db
      .select({ id: users.id })
      .from(users)
      .where(and(ne(users.id, user.id), or(...identityChecks)))
      .limit(1);
    if (conflicts.length) return Response.json({ error: "An account with that email or phone already exists." }, { status: 409 });
  }

  updates.updatedAt = new Date();
  const [updated] = await db.update(users).set(updates).where(eq(users.id, user.id)).returning();

  return Response.json({ user: publicUser(updated) });
}
