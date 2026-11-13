import { bootstrapDb } from "@/db/bootstrap";
import { getCurrentUser } from "@/lib/auth";
import { isPushConfigured, isValidSubscription, removeSubscription, saveSubscription } from "@/lib/push";

export const dynamic = "force-dynamic";

// Stores the browser's push subscription for the signed-in user so the server can
// reach this device for order alerts (admins) and offer alerts (customers).
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in first." }, { status: 401 });
  if (!isPushConfigured()) return Response.json({ error: "Push notifications are not configured." }, { status: 503 });
  await bootstrapDb();
  const body = await request.json().catch(() => null) as { subscription?: unknown } | null;
  if (!isValidSubscription(body?.subscription)) return Response.json({ error: "Invalid subscription." }, { status: 400 });
  await saveSubscription(user.id, body.subscription);
  return Response.json({ ok: true });
}

// Removes a subscription when the user turns notifications (or offer alerts) off.
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in first." }, { status: 401 });
  const body = await request.json().catch(() => null) as { endpoint?: string } | null;
  if (!body?.endpoint) return Response.json({ error: "An endpoint is required." }, { status: 400 });
  await removeSubscription(body.endpoint);
  return Response.json({ ok: true });
}
