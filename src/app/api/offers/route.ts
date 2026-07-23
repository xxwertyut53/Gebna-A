import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bootstrapDb } from "@/db/bootstrap";
import { offers, products } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  await bootstrapDb();
  const [offerRows, productRows] = await Promise.all([
    db.select().from(offers).where(eq(offers.active, true)).orderBy(desc(offers.discountPercent)),
    db.select({ id: products.id, nameEn: products.nameEn, nameAr: products.nameAr, nameTr: products.nameTr }).from(products),
  ]);
  const nameOf = (id: string | null) => (id ? productRows.find((p) => p.id === id) : null);
  const now = Date.now();
  const live = offerRows.filter((offer) => !offer.endsAt || new Date(offer.endsAt).getTime() > now);
  return Response.json({
    offers: live.map((offer) => ({
      id: offer.id,
      titleEn: offer.titleEn, titleTr: offer.titleTr, titleAr: offer.titleAr,
      descriptionEn: offer.descriptionEn, descriptionTr: offer.descriptionTr, descriptionAr: offer.descriptionAr,
      imageUrl: offer.imageUrl || offer.giftCustomImage,
      type: offer.type,
      discountPercent: Number(offer.discountPercent),
      buyQuantity: offer.buyQuantity ? Number(offer.buyQuantity) : null,
      buySize: offer.buySize,
      buyProductName: nameOf(offer.buyProductId)?.nameEn || null,
      giftKind: offer.giftKind,
      giftQuantity: offer.giftQuantity ? Number(offer.giftQuantity) : null,
      giftSize: offer.giftSize,
      giftProductName: nameOf(offer.giftProductId)?.nameEn || null,
      giftCustomName: offer.giftCustomName,
      limitedCount: offer.limitedCount ? Number(offer.limitedCount) : null,
      endsAt: offer.endsAt ? new Date(offer.endsAt).toISOString() : null,
    })),
  });
}
