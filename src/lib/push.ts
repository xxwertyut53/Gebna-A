import webpush from "web-push";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions, users } from "@/db/schema";

const publicKey = process.env.VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const subject = process.env.VAPID_SUBJECT || "mailto:gebna.a25@gmail.com";

let pushConfigured = false;
if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    pushConfigured = true;
  } catch (error) {
    console.error("[Gebna-A] Invalid VAPID configuration — push notifications disabled.", error);
  }
} else {
  console.info("[Gebna-A] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — push notifications disabled.");
}

export function isPushConfigured() {
  return pushConfigured;
}

export function getVapidPublicKey() {
  return pushConfigured ? publicKey : null;
}

export type PushSubscriptionInput = { endpoint: string; keys: { p256dh: string; auth: string } };

export function isValidSubscription(value: unknown): value is PushSubscriptionInput {
  if (!value || typeof value !== "object") return false;
  const sub = value as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  return typeof sub.endpoint === "string" && sub.endpoint.length > 0 && !!sub.keys && typeof sub.keys.p256dh === "string" && typeof sub.keys.auth === "string";
}

export async function saveSubscription(userId: string, sub: PushSubscriptionInput) {
  await db
    .insert(pushSubscriptions)
    .values({ userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth } });
}

export async function removeSubscription(endpoint: string) {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

type PushKind = "order" | "offer";
type PushPayload = { title: string; body: string; kind: PushKind; url: string };

async function sendToSubscriptions(rows: Array<{ id: string; endpoint: string; p256dh: string; auth: string }>, payload: PushPayload) {
  if (!pushConfigured || rows.length === 0) return { sent: 0, total: rows.length };
  const data = JSON.stringify(payload);
  const stale: string[] = [];
  await Promise.all(rows.map(async (row) => {
    try {
      await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, data);
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      // 404 / 410 mean the browser dropped this subscription — clean it up.
      if (status === 404 || status === 410) stale.push(row.id);
      else console.error("[Gebna-A] Push send failed", status, error instanceof Error ? error.message : error);
    }
  }));
  if (stale.length) await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, stale));
  return { sent: rows.length - stale.length, total: rows.length };
}

const subscriptionColumns = { id: pushSubscriptions.id, endpoint: pushSubscriptions.endpoint, p256dh: pushSubscriptions.p256dh, auth: pushSubscriptions.auth };

// New order -> notify owner/admin devices (plays the Shopify-style chime in the app).
export async function sendOrderPushToAdmins(order: { orderCode: string; customerName: string; total: string }) {
  const rows = await db
    .select(subscriptionColumns)
    .from(pushSubscriptions)
    .innerJoin(users, eq(users.id, pushSubscriptions.userId))
    .where(inArray(users.role, ["admin", "owner"]));
  return sendToSubscriptions(rows, { title: "🛒 New order received", body: `${order.customerName} · ₺${order.total} · #${order.orderCode}`, kind: "order", url: "/admin" });
}

// New offer -> notify customers who turned on offer alerts (plays the offer chime in the app).
export async function sendOfferPushToSubscribers(offer: { titleEn: string; titleAr: string; descriptionEn: string }) {
  const rows = await db
    .select(subscriptionColumns)
    .from(pushSubscriptions)
    .innerJoin(users, eq(users.id, pushSubscriptions.userId))
    .where(eq(users.offerNotifications, true));
  return sendToSubscriptions(rows, { title: `🎁 ${offer.titleEn}`, body: offer.descriptionEn || offer.titleAr, kind: "offer", url: "/home" });
}
