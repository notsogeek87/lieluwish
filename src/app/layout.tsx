import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { NetworkStatusBanner } from "@/components/network-status-banner";

export const metadata: Metadata = {
  title: "Lieluwish — Les cadeaux des enfants",
  description: "Les listes de cadeaux des enfants, à partager avec les grands-parents.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Lieluwish" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale: pinch-to-zoom must stay available for grandparents.
  themeColor: "#e11d48",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the per-request CSP nonce (set in src/middleware.ts) forces
  // dynamic rendering, so a cached page never ships with a stale nonce.
  await headers();

  return (
    <html lang="fr">
      <body>
        <NetworkStatusBanner />
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
