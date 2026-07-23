export async function register() {
  // Runs once when the Next.js server boots. Ensures the database schema
  // exists and is seeded so a freshly (re)built preview is never empty.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrapDb } = await import("@/db/bootstrap");
    await bootstrapDb();
  }
}
