import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const ownerEmail = process.env.BUSINESS_EMAIL || "gebna.a25@gmail.com";

export async function sendOrderNotifications(order: {
  orderCode: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  total: string;
  items: Array<{ productName: string; size: string; flavorChoice: string; quantity: string; unitPrice: string }>;
}) {
  const user = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;
  if (!user || !password) {
    console.info(`[Gebna-A] Gmail notification skipped: configure GMAIL_USER and GMAIL_APP_PASSWORD. Order ${order.orderCode} was saved.`);
    return { sent: false, reason: "gmail_not_configured" };
  }
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass: password } });
  const items = order.items.map((item) => `• ${item.productName} · ${item.size} · ${item.flavorChoice} × ${item.quantity} = ₺${item.unitPrice}`).join("\n");
  const ownerText = `New Gebna-A order\n\nOrder: ${order.orderCode}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nTotal: ₺${order.total}\n\n${items}`;
  const customerText = `Thank you for ordering from Gebna-A, ${order.customerName}!\n\nYour order code is ${order.orderCode}. We will call ${order.customerPhone} to confirm delivery.\n\n${items}\n\nTotal: ₺${order.total}`;
  await transporter.sendMail({ from: user, to: ownerEmail, subject: `New Gebna-A order ${order.orderCode} · ₺${order.total}`, text: ownerText });
  if (order.customerEmail) await transporter.sendMail({ from: user, to: order.customerEmail, subject: `Gebna-A order confirmation · ${order.orderCode}`, text: customerText });
  return { sent: true };
}

export async function sendNewOfferNotification(offer: {
  titleEn: string;
  titleTr: string;
  titleAr: string;
  descriptionEn: string;
  descriptionTr: string;
  descriptionAr: string;
}) {
  const user = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;
  if (!user || !password) {
    console.info(`[Gebna-A] Gmail notification skipped for new offer: GMAIL_USER and GMAIL_APP_PASSWORD not set.`);
    return { sent: false, reason: "gmail_not_configured" };
  }

  // Fetch all users with offerNotifications turned on
  const subscribers = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.offerNotifications, true));

  if (subscribers.length === 0) {
    console.info("[Gebna-A] No subscribed users found for new offer email.");
    return { sent: true, count: 0 };
  }

  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass: password } });

  console.info(`[Gebna-A] Sending new offer emails to ${subscribers.length} subscribers.`);

  const emailPromises = subscribers.map((sub) => {
    const textContent = `Hello ${sub.name}!

We have published a new exciting offer at Gebna-A!

🎁 ${offer.titleEn}
${offer.descriptionEn}

---
Yeni Kampanya!
🎁 ${offer.titleTr}
${offer.descriptionTr}

---
عرض جديد!
🎁 ${offer.titleAr}
${offer.descriptionAr}

Visit us at https://gebna-a.app/home to claim your offer!
Thank you for being a valued part of the Gebna-A family.`;

    return transporter.sendMail({
      from: `"Gebna-A Cheese" <${user}>`,
      to: sub.email,
      subject: `🎉 New Offer: ${offer.titleEn} / ${offer.titleAr}`,
      text: textContent,
    }).catch((err) => {
      console.error(`Failed to send email to ${sub.email}:`, err);
    });
  });

  await Promise.all(emailPromises);
  return { sent: true, count: subscribers.length };
}
