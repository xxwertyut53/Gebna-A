import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(request: Request) {
  const headers = request.headers;
  const protocol = headers.get("x-forwarded-proto") || "https";
  const host = headers.get("x-forwarded-host") || headers.get("host") || "gebna-a.app";
  const appUrl = `${protocol}://${host}/home`;
  const logoUrl = `${protocol}://${host}/icons/icon-512.png`;

  // Try to embed the brand logo as the web-clip icon (optional — profile installs without it).
  let iconData = "";
  try {
    const iconRes = await fetch(logoUrl, { next: { revalidate: 86400 } });
    if (iconRes.ok) {
      const bytes = new Uint8Array(await iconRes.arrayBuffer());
      iconData = Buffer.from(bytes).toString("base64");
    }
  } catch {
    iconData = "";
  }

  const clipUUID = randomUUID().toUpperCase();
  const configUUID = randomUUID().toUpperCase();
  const iconBlock = iconData ? `\n      <key>Icon</key>\n      <data>${iconData}</data>` : "";

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>PayloadIdentifier</key>
      <string>app.gebna.webclip</string>
      <key>PayloadUUID</key>
      <string>${clipUUID}</string>
      <key>PayloadDisplayName</key>
      <string>Gebna-A</string>
      <key>PayloadDescription</key>
      <string>${escapeXml("Adds Gebna-A to your Home Screen as a full-screen app.")}</string>
      <key>Label</key>
      <string>Gebna-A</string>
      <key>URL</key>
      <string>${escapeXml(appUrl)}</string>
      <key>FullScreen</key>
      <true/>
      <key>IsRemovable</key>
      <true/>
      <key>Precomposed</key>
      <true/>${iconBlock}
    </dict>
  </array>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadIdentifier</key>
  <string>app.gebna.config</string>
  <key>PayloadUUID</key>
  <string>${configUUID}</string>
  <key>PayloadDisplayName</key>
  <string>Gebna-A</string>
  <key>PayloadDescription</key>
  <string>${escapeXml("Install the Gebna-A app on your iPhone or iPad.")}</string>
</dict>
</plist>
`;

  return new Response(plist, {
    headers: {
      "Content-Type": "application/x-apple-aspen-config; charset=utf-8",
      "Content-Disposition": 'attachment; filename="GEBNA-A.mobileconfig"',
      "Cache-Control": "no-store",
    },
  });
}
