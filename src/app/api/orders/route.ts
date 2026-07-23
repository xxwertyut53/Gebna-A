import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { sendOrderNotifications } from "@/lib/email";

const validFlavors = new Set(["spicy", "cool"]);

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.trim();
  const phone = url.searchParams.get("phone")?.trim();
  if (!user && (!code || !phone)) return Response.json({ error: "Order code and phone are required." }, { status: 400 });
  const conditions = code && phone ? and(eq(orders.orderCode, code), eq(orders.customerPhone, phone)) : eq(orders.userId, user!.id);
  const rows = await db.select().from(orders).where(conditions).orderBy(desc(orders.createdAt));
  const items = rows.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((row) => row.id))) : [];
  return Response.json({ orders: rows.map((order) => ({ ...order, total: Number(order.total), items: items.filter((item) => item.orderId === order.id).map((item) => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })) })) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in before placing an order." }, { status: 401 });
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Istanbul", weekday: "short" }).format(new Date());
  if (weekday !== "Sat" && weekday !== "Sun") return Response.json({ error: "Orders are accepted on Saturday & Sunday only.", code: "ORDERS_CLOSED" }, { status: 409 });
  const body = await request.json().catch(() => null) as {
    customerName?: string; customerPhone?: string; customerEmail?: string; deliveryAddress?: string; deliveryCity?: string; deliveryDistrict?: string; building?: string; floor?: string; door?: string; notes?: string; locationLat?: number; locationLng?: number;
    items?: Array<{ productId: string; size: "300g" | "600g"; quantity: number; flavorChoice: "spicy" | "cool" }>;
  } | null;
  const items = body?.items || [];
  if (!body?.customerName?.trim() || !body.customerPhone?.trim() || !body.deliveryAddress?.trim() || !body.deliveryCity?.trim() || !items.length) return Response.json({ error: "Customer information, delivery details, and at least one item are required." }, { status: 400 });
  if (items.some((item) => !validFlavors.has(item.flavorChoice) || !["300g", "600g"].includes(item.size) || item.quantity < 1)) return Response.json({ error: "Choose spicy or cool and a valid size for every item." }, { status: 400 });
  const ids = [...new Set(items.map((item) => item.productId))];
  const dbProducts = await db.select().from(products).where(inArray(products.id, ids));
  if (dbProducts.length !== ids.length) return Response.json({ error: "One or more products are no longer available." }, { status: 400 });
  const productMap = new Map(dbProducts.map((product) => [product.id, product]));
  const prepared = items.map((item) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = Number(item.size === "300g" ? product.price300g : product.price600g);
    return { ...item, productName: product.nameEn, unitPrice };
  });
  const total = prepared.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const orderCode = `GA-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const [order] = await db.insert(orders).values({ orderCode, userId: user.id, customerName: body.customerName.trim(), customerEmail: body.customerEmail?.trim() || user.email, customerPhone: body.customerPhone.trim(), deliveryAddress: body.deliveryAddress.trim(), deliveryCity: body.deliveryCity.trim(), deliveryDistrict: body.deliveryDistrict?.trim(), building: body.building?.trim(), floor: body.floor?.trim(), door: body.door?.trim(), locationLat: body.locationLat?.toString(), locationLng: body.locationLng?.toString(), notes: body.notes?.trim(), total: total.toFixed(2), status: "pending", orderSource: "in_app" }).returning();
  await db.insert(orderItems).values(prepared.map((item) => ({ orderId: order.id, productId: item.productId, productName: item.productName, size: item.size, flavorChoice: item.flavorChoice, quantity: String(item.quantity), unitPrice: item.unitPrice.toFixed(2) })));
  const notification = await sendOrderNotifications({ orderCode, customerName: order.customerName, customerEmail: order.customerEmail, customerPhone: order.customerPhone, total: total.toFixed(2), items: prepared.map((item) => ({ productName: item.productName, size: item.size, flavorChoice: item.flavorChoice, quantity: String(item.quantity), unitPrice: item.unitPrice.toFixed(2) })) }).catch((error: unknown) => { console.error("Gmail notification failed", error); return { sent: false, reason: "gmail_error" }; });
  return Response.json({ order: { ...order, total, notification }, whatsappUrl: `https://wa.me/905510668289?text=${encodeURIComponent(`Gebna-A order ${orderCode} · ${body.customerName} · ₺${total.toFixed(2)}`)}` }, { status: 201 });
}
