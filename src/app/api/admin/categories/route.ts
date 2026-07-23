import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bootstrapDb } from "@/db/bootstrap";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  await bootstrapDb();
  return Response.json({ categories: await db.select().from(categories).orderBy(asc(categories.sortOrder)) });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as { slug?: string; nameEn?: string; nameTr?: string; nameAr?: string; descriptionEn?: string; descriptionTr?: string; descriptionAr?: string; active?: boolean } | null;
  if (!body?.slug || !body.nameEn || !body.nameTr || !body.nameAr) return Response.json({ error: "Slug and trilingual names are required." }, { status: 400 });
  const [category] = await db.insert(categories).values({ slug: body.slug.trim().toLowerCase(), nameEn: body.nameEn.trim(), nameTr: body.nameTr.trim(), nameAr: body.nameAr.trim(), descriptionEn: body.descriptionEn?.trim(), descriptionTr: body.descriptionTr?.trim(), descriptionAr: body.descriptionAr?.trim(), active: body.active !== false }).returning();
  return Response.json({ category }, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string; nameEn?: string; nameTr?: string; nameAr?: string; active?: boolean } | null;
  if (!body?.id) return Response.json({ error: "Category id is required." }, { status: 400 });
  const [category] = await db.update(categories).set({ nameEn: body.nameEn, nameTr: body.nameTr, nameAr: body.nameAr, active: body.active }).where(eq(categories.id, body.id)).returning();
  return Response.json({ category });
}
