import { redirect } from "next/navigation";
import { parseSharedContent } from "@/lib/share-target";

/**
 * Target of the Android "Share" sheet (see share_target in
 * public/manifest.webmanifest): opens the new-gift form pre-filled.
 */
export default async function ShareTargetPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
}) {
  const { title, url } = parseSharedContent(await searchParams);
  const sp = new URLSearchParams({ shared: "1" });
  if (title) sp.set("title", title);
  if (url) sp.set("url", url);
  redirect(`/gifts/new?${sp.toString()}`);
}
