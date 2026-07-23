import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { bootstrapDb } from "@/db/bootstrap";
import { orderItems, orders, products, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  await bootstrapDb();

  const [allOrders, allUsers, allProducts] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select({ id: users.id, role: users.role }).from(users),
    db.select().from(products),
  ]);

  const itemRows = allOrders.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, allOrders.map((order) => order.id)))
    : [];

  const validOrders = allOrders.filter((order) => order.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const customers = allUsers.filter((user) => user.role === "customer").length;

  // Monthly revenue for the last 7 months
  const now = new Date();
  const months: { label: string; key: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    months.push({ label: date.toLocaleString("en", { month: "short" }), key, revenue: 0 });
  }
  for (const order of validOrders) {
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = months.find((entry) => entry.key === key);
    if (month) month.revenue += Number(order.total);
  }

  // Top selling products by quantity
  const productTotals = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const item of itemRows) {
    const existing = productTotals.get(item.productName) || { name: item.productName, quantity: 0, revenue: 0 };
    existing.quantity += Number(item.quantity);
    existing.revenue += Number(item.unitPrice) * Number(item.quantity);
    productTotals.set(item.productName, existing);
  }
  const topProducts = [...productTotals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const recent = allOrders.slice(0, 5).map((order) => ({
    orderCode: order.orderCode,
    customerName: order.customerName,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
  }));

  const maxRevenue = Math.max(...months.map((entry) => entry.revenue), 1);

  return Response.json({
    metrics: {
      totalOrders: allOrders.length,
      totalRevenue,
      pendingOrders: allOrders.filter((order) => order.status === "pending").length,
      confirmedOrders: allOrders.filter((order) => order.status === "confirmed").length,
      deliveredOrders: allOrders.filter((order) => order.status === "delivered").length,
      customers,
      products: allProducts.filter((product) => product.active).length,
      averageOrder: allOrders.length ? Math.round((totalRevenue / allOrders.length) * 100) / 100 : 0,
    },
    monthly: months.map((entry) => ({ label: entry.label, revenue: Math.round(entry.revenue) })),
    maxRevenue,
    recent,
    topProducts,
  });
}
