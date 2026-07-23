import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return Response.json({
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      offerNotifications: user.offerNotifications,
    } : null
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as { offerNotifications?: boolean } | null;
  if (body === null || typeof body.offerNotifications !== "boolean") {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({ offerNotifications: body.offerNotifications, updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning();

  return Response.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      offerNotifications: updated.offerNotifications,
    }
  });
}
