import { NextResponse } from "next/server";
import { resolveShareToken } from "@/lib/data/shareLinks";

/**
 * Per-link web app manifest: "add to home screen" from a share link must
 * reopen these gift lists, not the parents login page.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const share = await resolveShareToken(token);
  if (!share) return new NextResponse(null, { status: 404 });

  const start = `/share/${token}`;
  return NextResponse.json(
    {
      name: `Cadeaux — ${share.familyName}`,
      short_name: "Cadeaux",
      start_url: start,
      scope: start,
      display: "standalone",
      background_color: "#f8fafc",
      theme_color: "#e11d48",
      lang: "fr",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
      },
    }
  );
}
