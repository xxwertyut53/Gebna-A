import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const statuses = new Set(["pending", "confirmed", "shipped", "delivered", "cancelled"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => null) as { status?: string } | null;
  if (!body?.status || !statuses.has(body.status)) return Response.json({ error: "Invalid order status." }, { status: 400 });
  const [order] = await db.update(orders).set({ status: body.status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  return Response.json({ order });
}
