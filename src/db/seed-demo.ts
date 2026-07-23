import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { offers, orderItems, orders, products, users } from "@/db/schema";

async function seedDemo() {
  // Demo customer
  const email = "mariam.demo@gebna-a.app";
  let [customer] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!customer) {
    [customer] = await db.insert(users).values({ name: "Mariam Hassan", email, phone: "5551234567", passwordHash: await bcrypt.hash("demo-pass-123", 12), role: "customer" }).returning();
    console.log("Created demo customer", customer.email);
  }

  const [classic, mexicano] = await Promise.all([
    db.select().from(products).where(eq(products.nameEn, "Classic")).limit(1).then((rows) => rows[0]),
    db.select().from(products).where(eq(products.nameEn, "Mexicano")).limit(1).then((rows) => rows[0]),
  ]);
  if (!classic || !mexicano) throw new Error("Seed cheese products first (run src/db/seed.ts).");

  // Pending order
  const [pending] = await db.select().from(orders).where(eq(orders.orderCode, "GA-DEMO01")).limit(1);
  if (!pending) {
    const [order] = await db.insert(orders).values({ orderCode: "GA-DEMO01", userId: customer.id, customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone, deliveryAddress: "Bağdat Cd. 120", deliveryCity: "Istanbul", deliveryDistrict: "Kadıköy", total: "478.00", status: "pending", orderSource: "in_app", createdAt: new Date(Date.now() - 1000 * 60 * 42) }).returning();
    await db.insert(orderItems).values([
      { orderId: order.id, productId: classic.id, productName: classic.nameEn, size: "600g", flavorChoice: "cool", quantity: "1", unitPrice: classic.price600g },
      { orderId: order.id, productId: mexicano.id, productName: mexicano.nameEn, size: "600g", flavorChoice: "spicy", quantity: "1", unitPrice: mexicano.price600g },
    ]);
    console.log("Created pending order GA-DEMO01");
  }

  // Delivered order
  const [delivered] = await db.select().from(orders).where(eq(orders.orderCode, "GA-DEMO02")).limit(1);
  if (!delivered) {
    const [order] = await db.insert(orders).values({ orderCode: "GA-DEMO02", userId: customer.id, customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone, deliveryAddress: "İstiklal Cd. 45", deliveryCity: "Istanbul", deliveryDistrict: "Beyoğlu", total: classic.price600g, status: "delivered", orderSource: "in_app", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26) }).returning();
    await db.insert(orderItems).values([{ orderId: order.id, productId: classic.id, productName: classic.nameEn, size: "600g", flavorChoice: "cool", quantity: "1", unitPrice: classic.price600g }]);
    console.log("Created delivered order GA-DEMO02");
  }

  // Demo offer
  const [offer] = await db.select().from(offers).where(eq(offers.titleEn, "Weekend cheese lovers")).limit(1);
  if (!offer) {
    await db.insert(offers).values({ titleEn: "Weekend cheese lovers", titleTr: "Hafta sonu peynir severler", titleAr: "عشاق الجبن في نهاية الأسبوع", descriptionEn: "10% off the whole cart every Saturday & Sunday.", descriptionTr: "Her Cumartesi ve Pazar sepette %10 indirim.", descriptionAr: "خصم ١٠٪ على السلة كل سبت وأحد.", type: "percentage", discountPercent: "10", active: true });
    console.log("Created demo offer");
  }
  console.log("Demo data ready.");
}

seedDemo().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await pool.end(); });
