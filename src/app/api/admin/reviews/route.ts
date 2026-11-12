import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Admin moderation of customer reviews and their uploaded photos.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  return Response.json({ reviews: rows });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string; imageApproved?: boolean; approved?: boolean } | null;
  if (!body?.id) return Response.json({ error: "Review id is required." }, { status: 400 });
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.imageApproved === "boolean") patch.imageApproved = body.imageApproved;
  if (typeof body.approved === "boolean") patch.approved = body.approved;
  const [row] = await db.update(reviews).set(patch).where(eq(reviews.id, body.id)).returning();
  return Response.json({ review: row });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return Response.json({ error: "Review id is required." }, { status: 400 });
  await db.delete(reviews).where(eq(reviews.id, body.id));
  return Response.json({ ok: true });
}
