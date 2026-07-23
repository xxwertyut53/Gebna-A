import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedAddresses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  return Response.json({ addresses: await db.select().from(savedAddresses).where(eq(savedAddresses.userId, user.id)).orderBy(asc(savedAddresses.createdAt)) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { label?: string; city?: string; district?: string; address?: string; building?: string; floor?: string; door?: string; locationLat?: number; locationLng?: number } | null;
  if (!body?.city?.trim() || !body.address?.trim()) return Response.json({ error: "City and address are required." }, { status: 400 });
  const [address] = await db.insert(savedAddresses).values({ userId: user.id, label: body.label?.trim() || "Home", city: body.city.trim(), district: body.district?.trim(), address: body.address.trim(), building: body.building?.trim(), floor: body.floor?.trim(), door: body.door?.trim(), locationLat: body.locationLat?.toString(), locationLng: body.locationLng?.toString() }).returning();
  return Response.json({ address }, { status: 201 });
}
