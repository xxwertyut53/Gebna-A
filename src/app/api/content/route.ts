import { db } from "@/db";
import { appSettings } from "@/db/schema";

export const dynamic = "force-dynamic";

// Public endpoint: storefront text overrides + whether the admin UI editor button is enabled.
export async function GET() {
  const rows = await db.select().from(appSettings);
  const map: Record<string, unknown> = {};
  for (const row of rows) map[row.key] = row.value;
  return Response.json({
    uiEditorEnabled: map["ui_editor_enabled"] === true,
    overrides: (map["ui_text_overrides"] as Record<string, string>) || {},
  });
}
