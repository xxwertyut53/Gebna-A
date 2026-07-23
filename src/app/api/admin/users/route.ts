import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bootstrapDb } from "@/db/bootstrap";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  await bootstrapDb();
  const customerRows = await db.select().from(users).orderBy(desc(users.createdAt));
  const orderRows = await db.select({ userId: orders.userId }).from(orders).where(eq(orders.status, "pending"));
  return Response.json({ users: customerRows.map((user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt, pendingOrders: orderRows.filter((order) => order.userId === user.id).length })) });
}
