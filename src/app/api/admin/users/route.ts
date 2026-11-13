import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bootstrapDb } from "@/db/bootstrap";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ROLES = ["customer", "admin", "owner"];

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  await bootstrapDb();
  const customerRows = await db.select().from(users).orderBy(desc(users.createdAt));
  const orderRows = await db.select({ userId: orders.userId }).from(orders).where(eq(orders.status, "pending"));
  return Response.json({ users: customerRows.map((user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, isSelf: user.id === admin.id, createdAt: user.createdAt, pendingOrders: orderRows.filter((order) => order.userId === user.id).length })) });
}

// Change a member's role (customer / admin / owner). Admins may not change their own role so
// they cannot accidentally lock themselves out of the dashboard.
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string; role?: string } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const role = typeof body?.role === "string" ? body.role : "";
  if (!id) return Response.json({ error: "A user id is required." }, { status: 400 });
  if (!ROLES.includes(role)) return Response.json({ error: "Invalid role." }, { status: 400 });
  if (id === admin.id) return Response.json({ error: "You cannot change your own role." }, { status: 400 });
  await bootstrapDb();
  const [updated] = await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id)).returning();
  if (!updated) return Response.json({ error: "User not found." }, { status: 404 });
  return Response.json({ user: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role } });
}
