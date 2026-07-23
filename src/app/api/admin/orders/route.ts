import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { bootstrapDb } from "@/db/bootstrap";
import { orderItems, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  await bootstrapDb();
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const items = rows.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((row) => row.id))) : [];
  const totalRevenue = rows.filter((row) => row.status !== "cancelled").reduce((sum, row) => sum + Number(row.total), 0);
  return Response.json({ metrics: { totalOrders: rows.length, totalRevenue, pendingOrders: rows.filter((row) => row.status === "pending").length }, orders: rows.map((row) => ({ ...row, total: Number(row.total), items: items.filter((item) => item.orderId === row.id) })) });
}
