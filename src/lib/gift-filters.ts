// Filtering/grouping shared by the parents' list and the public share page.
import { formatPrice } from "@/lib/gifts";

type FilterableGift = { childId: string; occasion: string | null; status: string; priceCents: number | null };

/** Occasions present in the list, most common first. */
export function occasionsOf(gifts: FilterableGift[]): string[] {
  const counts = new Map<string, number>();
  for (const g of gifts) if (g.occasion) counts.set(g.occasion, (counts.get(g.occasion) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([o]) => o);
}

export function filterGifts<T extends FilterableGift>(gifts: T[], childId?: string, occasion?: string): T[] {
  return gifts.filter((g) => (!childId || g.childId === childId) && (!occasion || g.occasion === occasion));
}

export function summary(gifts: FilterableGift[]): string {
  const total = gifts.length;
  const free = gifts.filter((g) => g.status === "IDEA").length;
  const budget = gifts.reduce((sum, g) => sum + (g.priceCents ?? 0), 0);
  const parts = [`${total} cadeau${total > 1 ? "x" : ""}`];
  if (free > 0) parts.push(`${free} encore libre${free > 1 ? "s" : ""}`);
  if (budget > 0) parts.push(formatPrice(budget));
  return parts.join(" · ");
}
