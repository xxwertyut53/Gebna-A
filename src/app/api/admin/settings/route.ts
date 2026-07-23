import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  return Response.json({ settings: await db.select().from(appSettings) });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as { key?: string; value?: unknown } | null;
  if (!body?.key) return Response.json({ error: "Setting key is required." }, { status: 400 });
  const [setting] = await db.insert(appSettings).values({ key: body.key, value: body.value }).onConflictDoUpdate({ target: appSettings.key, set: { value: body.value, updatedAt: new Date() } }).returning();
  return Response.json({ setting });
}
