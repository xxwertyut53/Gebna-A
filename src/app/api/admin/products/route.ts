import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bootstrapDb } from "@/db/bootstrap";
import { productImages, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { autofillTrilingualText } from "@/lib/translation";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  await bootstrapDb();
  return Response.json({ products: await db.select().from(products).orderBy(asc(products.createdAt)) });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body?.nameEn || !body?.nameTr || !body?.nameAr) return Response.json({ error: "Trilingual names are required." }, { status: 400 });

  const productType = body.productType === "sandwich" ? "sandwich" : "cheese";
  const images300g = Array.isArray(body.images300g) ? body.images300g.filter((v): v is string => typeof v === "string" && v.length > 0) : [];
  const images600g = Array.isArray(body.images600g) ? body.images600g.filter((v): v is string => typeof v === "string" && v.length > 0) : [];
  const images = Array.isArray(body.images) ? body.images.filter((v): v is string => typeof v === "string" && v.length > 0) : [];
  const allImages = productType === "sandwich" ? images : [...images600g, ...images300g];
  const mainImage = typeof body.mainImage === "string" && body.mainImage ? body.mainImage : allImages[0] || null;
  const flavors = Array.isArray(body.flavors) ? body.flavors.filter((v): v is string => typeof v === "string" && ["cool", "spicy", "veryhot"].includes(v)) : ["cool", "spicy", "veryhot"];

  if (productType === "cheese" && (!body.price300g || !body.price600g)) return Response.json({ error: "Both 300g and 600g prices are required for cheese products." }, { status: 400 });
  if (productType === "sandwich" && !body.priceSingle) return Response.json({ error: "Price is required for sandwich products." }, { status: 400 });

  const rawDescEn = typeof body.descriptionEn === "string" ? body.descriptionEn : "";
  const rawDescTr = typeof body.descriptionTr === "string" ? body.descriptionTr : "";
  const rawDescAr = typeof body.descriptionAr === "string" ? body.descriptionAr : "";
  if (!rawDescEn.trim() && !rawDescTr.trim() && !rawDescAr.trim()) return Response.json({ error: "At least one description is required (EN/TR/AR)." }, { status: 400 });
  const descriptions = await autofillTrilingualText({ en: rawDescEn, tr: rawDescTr, ar: rawDescAr }).catch((e: unknown) => {
    const message = e instanceof Error ? e.message : "Translation failed.";
    return { error: message } as const;
  });
  if ("error" in descriptions) return Response.json({ error: `Auto-translation failed: ${descriptions.error}` }, { status: 502 });

  const [product] = await db.insert(products).values({
    productType,
    categoryId: typeof body.categoryId === "string" ? body.categoryId : null,
    nameEn: String(body.nameEn), nameTr: String(body.nameTr), nameAr: String(body.nameAr),
    descriptionEn: descriptions.en, descriptionTr: descriptions.tr, descriptionAr: descriptions.ar,
    price300g: String(body.price300g || 0), price600g: String(body.price600g || 0),
    priceSingle: productType === "sandwich" ? String(body.priceSingle) : null,
    flavors,
    image300g: images300g[0] || null, image600g: images600g[0] || null, mainImage,
    images, images300g, images600g,
    tags: Array.isArray(body.tags) ? body.tags : [],
    stockStatus: body.stockStatus === "out_of_stock" ? "out_of_stock" : "in_stock",
    featured: body.featured === true, active: body.active !== false,
  }).returning();
  if (allImages.length) await db.insert(productImages).values(allImages.map((imageUrl, index) => ({ productId: product.id, size: productType === "sandwich" ? "single" : (images600g.includes(imageUrl) ? "600g" : "300g"), imageUrl, isMain: imageUrl === mainImage, sortOrder: String(index) })));
  return Response.json({ product }, { status: 201 });
}
