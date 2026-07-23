import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bootstrapDb } from "@/db/bootstrap";
import { offers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { sendNewOfferNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  await bootstrapDb();
  return Response.json({ offers: await db.select().from(offers).orderBy(desc(offers.active)) });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const offerType = body?.type === "bogo" ? "bogo" : body?.type === "simple" ? "simple" : "percentage";
  if (!body?.titleEn) return Response.json({ error: "An offer title is required." }, { status: 400 });
  if (offerType !== "simple" && (!body?.titleTr || !body?.titleAr)) return Response.json({ error: "Trilingual titles are required." }, { status: 400 });
  
  const strOrNull = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);
  const numOrNull = (v: unknown): string | null => { if (v === null || v === undefined || v === "") return null; const n = Number(v); return Number.isFinite(n) ? String(Math.trunc(n)) : null; };
  
  const [offer] = await db.insert(offers).values({
    titleEn: String(body.titleEn), 
    titleTr: String(body.titleTr || body.titleEn), 
    titleAr: String(body.titleAr || body.titleEn),
    descriptionEn: String(body.descriptionEn || ""), 
    descriptionTr: String(body.descriptionTr || body.descriptionEn || ""), 
    descriptionAr: String(body.descriptionAr || body.descriptionEn || ""),
    imageUrl: strOrNull(body.imageUrl),
    type: offerType,
    discountPercent: String(body.discountPercent || 0),
    buyProductId: strOrNull(body.buyProductId), 
    buySize: strOrNull(body.buySize), 
    buyQuantity: numOrNull(body.buyQuantity),
    giftKind: body.giftKind === "custom" ? "custom" : "product",
    giftProductId: body.giftKind === "custom" ? null : strOrNull(body.giftProductId), 
    giftSize: strOrNull(body.giftSize), 
    giftQuantity: numOrNull(body.giftQuantity),
    giftCustomName: strOrNull(body.giftCustomName), 
    giftCustomImage: strOrNull(body.giftCustomImage),
    limitedCount: numOrNull(body.limitedCount),
    active: body.active !== false,
    startsAt: typeof body.startsAt === "string" ? new Date(body.startsAt) : undefined,
    endsAt: typeof body.endsAt === "string" ? new Date(body.endsAt) : undefined,
  }).returning();

  // Fire emails asynchronously to stay fast on UI
  if (offer.active) {
    sendNewOfferNotification({
      titleEn: offer.titleEn,
      titleTr: offer.titleTr,
      titleAr: offer.titleAr,
      descriptionEn: offer.descriptionEn,
      descriptionTr: offer.descriptionTr,
      descriptionAr: offer.descriptionAr,
    }).catch((err) => {
      console.error("[Gebna-A] Failed to broadcast offer emails:", err);
    });
  }

  return Response.json({ offer }, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return Response.json({ error: "Offer id is required." }, { status: 400 });
  const updates: Record<string, unknown> = {};
  const strKeys = ["titleEn", "titleTr", "titleAr", "descriptionEn", "descriptionTr", "descriptionAr", "imageUrl", "type", "buyProductId", "buySize", "giftKind", "giftProductId", "giftSize", "giftCustomName", "giftCustomImage"];
  for (const key of strKeys) if (key in (body || {})) { const v = body?.[key]; updates[key] = typeof v === "string" && v.length > 0 ? v : v === null ? null : undefined; }
  if ("discountPercent" in (body || {})) updates.discountPercent = String(body?.discountPercent || 0);
  if ("buyQuantity" in (body || {})) { const v = body?.buyQuantity; updates.buyQuantity = v === null || v === "" || v === undefined ? null : String(Math.trunc(Number(v))); }
  if ("giftQuantity" in (body || {})) { const v = body?.giftQuantity; updates.giftQuantity = v === null || v === "" || v === undefined ? null : String(Math.trunc(Number(v))); }
  if ("limitedCount" in (body || {})) { const v = body?.limitedCount; updates.limitedCount = v === null || v === "" || v === undefined ? null : String(Math.trunc(Number(v))); }
  if ("active" in (body || {})) updates.active = body?.active;
  if ("endsAt" in (body || {})) { const v = body?.endsAt; updates.endsAt = typeof v === "string" && v ? new Date(v) : null; }
  if ("startsAt" in (body || {})) { const v = body?.startsAt; updates.startsAt = typeof v === "string" && v ? new Date(v) : null; }
  for (const k of Object.keys(updates)) if (updates[k] === undefined) delete updates[k];
  const [offer] = await db.update(offers).set(updates).where(eq(offers.id, id)).returning();
  if (!offer) return Response.json({ error: "Offer not found." }, { status: 404 });
  return Response.json({ offer });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return Response.json({ error: "Offer id is required." }, { status: 400 });
  await db.delete(offers).where(eq(offers.id, body.id));
  return Response.json({ ok: true });
}
