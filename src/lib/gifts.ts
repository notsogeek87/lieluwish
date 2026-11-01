// Pure helpers for gifts (no database, unit-tested in tests/gifts.test.ts).

export const GIFT_STATUSES = ["IDEA", "PLANNED", "BOUGHT"] as const;
export type GiftStatusValue = (typeof GIFT_STATUSES)[number];

export const STATUS_LABEL: Record<GiftStatusValue, string> = {
  IDEA: "Idée",
  PLANNED: "Prévu",
  BOUGHT: "Acheté",
};

/** Wording for the public page: tells grandparents whether a gift is still free. */
export const PUBLIC_STATUS_LABEL: Record<GiftStatusValue, string> = {
  IDEA: "Encore disponible",
  PLANNED: "Déjà prévu",
  BOUGHT: "Déjà acheté",
};

/**
 * Parses a price typed by a human ("29,99", "29.99 €", "30") into euro
 * cents. Empty input → null. Throws on anything else.
 */
export function parsePriceToCents(input: string | null | undefined): number | null {
  const raw = (input ?? "").replace(/€|\s| /g, "");
  if (raw === "") return null;
  if (!/^\d{1,6}([.,]\d{1,2})?$/.test(raw)) {
    throw new Error("Prix invalide (exemple : 29,99).");
  }
  const [euros, decimals = ""] = raw.split(/[.,]/);
  return Number(euros) * 100 + Number(decimals.padEnd(2, "0"));
}

const priceFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function formatPrice(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  return priceFormatter.format(cents / 100);
}

/** Value for the price <input> when editing ("29,99"). */
export function priceInputValue(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "";
  const euros = Math.floor(cents / 100);
  const rest = cents % 100;
  return rest === 0 ? String(euros) : `${euros},${String(rest).padStart(2, "0")}`;
}

/**
 * Only http(s) links are kept: anything else (javascript:, data:...) would
 * be rendered as a clickable href, including on the public share page.
 */
export function normalizeGiftUrl(input: string | null | undefined): string | null {
  const raw = (input ?? "").trim();
  if (raw === "") return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new Error("Lien invalide.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Le lien doit commencer par http:// ou https://.");
  }
  return url.toString();
}

/** Short label for a link: the site name without "www.". */
export function linkLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Voir le lien";
  }
}

/** Default occasion suggested in the form: Christmas of the current season. */
export function defaultOccasion(now: Date = new Date()): string {
  return `Noël ${now.getFullYear()}`;
}

type Sortable = { status: GiftStatusValue; favorite: boolean; createdAt: Date };

/** Favorites first, then still-free ideas, then planned, then bought; oldest first. */
export function compareGifts(a: Sortable, b: Sortable): number {
  if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
  const order = GIFT_STATUSES.indexOf(a.status) - GIFT_STATUSES.indexOf(b.status);
  if (order !== 0) return order;
  return a.createdAt.getTime() - b.createdAt.getTime();
}
