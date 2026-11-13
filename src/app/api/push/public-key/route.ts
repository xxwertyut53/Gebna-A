import { getVapidPublicKey } from "@/lib/push";

export const dynamic = "force-dynamic";

// The public VAPID key is shared with the browser so it can create a push subscription.
export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) return Response.json({ error: "Push notifications are not configured." }, { status: 503 });
  return Response.json({ publicKey });
}
