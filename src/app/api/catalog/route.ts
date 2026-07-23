import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bootstrapDb } from "@/db/bootstrap";
import { categories, productImages, products } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  await bootstrapDb();
  const [categoryRows, productRows, imageRows] = await Promise.all([
    db.select().from(categories).where(eq(categories.active, true)).orderBy(asc(categories.sortOrder)),
    db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.createdAt)),
    db.select().from(productImages).orderBy(asc(productImages.sortOrder)),
  ]);
  return Response.json({ categories: categoryRows, products: productRows.map((product) => ({ ...product, price300g: Number(product.price300g), price600g: Number(product.price600g), images300g: product.images300g || [], images600g: product.images600g || [], gallery: imageRows.filter((image) => image.productId === product.id) })) });
}
