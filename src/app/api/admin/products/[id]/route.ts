import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!existing) return Response.json({ error: "Product not found." }, { status: 404 });
  const updates: Record<string, unknown> = {};
  const allowed = ["categoryId", "nameEn", "nameTr", "nameAr", "descriptionEn", "descriptionTr", "descriptionAr", "price300g", "price600g", "priceSingle", "productType", "stockStatus", "featured", "active", "mainImage", "tags"];
  for (const key of allowed) if (key in (body || {})) updates[key] = body?.[key];
  for (const key of ["price300g", "price600g", "priceSingle"]) if (key in updates) updates[key] = updates[key] != null ? String(updates[key]) : null;
  if (Array.isArray(body?.images300g)) { updates.images300g = body.images300g; updates.image300g = body.images300g[0] || null; }
  if (Array.isArray(body?.images600g)) { updates.images600g = body.images600g; updates.image600g = body.images600g[0] || null; }
  if (Array.isArray(body?.images)) { updates.images = body.images; }
  const final600 = Array.isArray(body?.images600g) ? body.images600g as string[] : (existing.images600g || []);
  const final300 = Array.isArray(body?.images300g) ? body.images300g as string[] : (existing.images300g || []);
  const finalSingle = Array.isArray(body?.images) ? body.images as string[] : (existing.images || []);
  const productType = (updates.productType || existing.productType || "cheese") as string;
  const allImages = productType === "sandwich" ? finalSingle : [...final600, ...final300];
  const requestedMain = typeof updates.mainImage === "string" ? updates.mainImage : typeof body?.mainImage === "string" ? body.mainImage : existing.mainImage || "";
  if (allImages.length) { updates.mainImage = requestedMain && allImages.includes(requestedMain) ? requestedMain : allImages[0]; }
  else if (!requestedMain) { updates.mainImage = null; }
  updates.updatedAt = new Date();
  const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
  if (!product) return Response.json({ error: "Product not found." }, { status: 404 });
  if (Array.isArray(body?.images300g) || Array.isArray(body?.images600g) || Array.isArray(body?.images)) {
    await db.delete(productImages).where(eq(productImages.productId, id));
    const imgs = [...(Array.isArray(body?.images300g) ? body.images300g.filter((v: unknown): v is string => typeof v === "string") : []).map((u: string, i: number) => ({ productId: id, size: "300g", imageUrl: u, isMain: u === product.mainImage, sortOrder: String(i) })), ...(Array.isArray(body?.images600g) ? body.images600g.filter((v: unknown): v is string => typeof v === "string") : []).map((u: string, i: number) => ({ productId: id, size: "600g", imageUrl: u, isMain: u === product.mainImage, sortOrder: String(i) })), ...(Array.isArray(body?.images) ? body.images.filter((v: unknown): v is string => typeof v === "string") : []).map((u: string, i: number) => ({ productId: id, size: "single", imageUrl: u, isMain: u === product.mainImage, sortOrder: String(i) }))];
    if (imgs.length) await db.insert(productImages).values(imgs);
  }
  return Response.json({ product });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  await db.delete(products).where(eq(products.id, id));
  return Response.json({ ok: true });
}
