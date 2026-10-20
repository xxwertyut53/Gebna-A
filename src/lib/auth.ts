import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

export const SESSION_COOKIE = "gebna_session";
const SESSION_DAYS = 30;

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db.select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date()))).limit(1);
  return rows[0]?.user ?? null;
}

export async function createSession(userId: string, remember = true) {
  const token = crypto.randomUUID() + crypto.randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { expires: expiresAt, maxAge: SESSION_DAYS * 24 * 60 * 60 } : {}),
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  cookieStore.delete(SESSION_COOKIE);
}

export function isAdmin(user: User | null) {
  return Boolean(user && (user.role === "admin" || user.role === "owner"));
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  return isAdmin(user) ? user : null;
}
