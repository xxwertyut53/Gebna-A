import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const LOGO = "/icons/icon-512.png";
const SITE_URL = "https://gebna-a.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Gebna-A · Egyptian Artisan Cheese",
  description: "Finest Egyptian artisan cheese in Turkey. Unique, hand-crafted flavors delivered to your doorstep. Shop at gebna-a.app.",
  themeColor: "#309e2b",
  manifest: "/manifest.webmanifest",
  icons: { icon: LOGO, apple: LOGO },
  alternates: { canonical: SITE_URL },
  openGraph: { url: SITE_URL, siteName: "Gebna-A", title: "Gebna-A · Egyptian Artisan Cheese", type: "website" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Gebna-A" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#309e2b" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gebna-A" />
        <link rel="canonical" href={SITE_URL} />
        <link rel="icon" href={LOGO} />
        <link rel="apple-touch-icon" href={LOGO} />
      </head>
      <body>{children}</body>
    </html>
  );
}
