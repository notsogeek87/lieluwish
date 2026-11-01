"use client";

import { useEffect, useState } from "react";

/** Opens the phone's share sheet (WhatsApp, SMS, mail…) when available. */
export function ShareLinkButton({ link, text }: { link: string; text: string }) {
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator.share === "function"), []);
  if (!canShare) return null;

  return (
    <button
      type="button"
      onClick={() => navigator.share({ title: text, text, url: link }).catch(() => undefined)}
      className="tap-target shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white active:bg-brand-700"
    >
      Envoyer…
    </button>
  );
}
