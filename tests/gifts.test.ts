import { describe, expect, it } from "vitest";
import { compareGifts, formatPrice, linkLabel, normalizeGiftUrl, parsePriceToCents, priceInputValue } from "@/lib/gifts";
import { filterGifts, occasionsOf, summary } from "@/lib/gift-filters";

describe("parsePriceToCents", () => {
  it("accepts French and English decimals, with or without €", () => {
    expect(parsePriceToCents("29,99")).toBe(2999);
    expect(parsePriceToCents("29.9")).toBe(2990);
    expect(parsePriceToCents("30 €")).toBe(3000);
    expect(parsePriceToCents("1 200")).toBe(120000);
  });
  it("returns null for an empty value", () => {
    expect(parsePriceToCents("")).toBeNull();
    expect(parsePriceToCents("  ")).toBeNull();
    expect(parsePriceToCents(null)).toBeNull();
  });
  it("rejects garbage and negative prices", () => {
    expect(() => parsePriceToCents("abc")).toThrow();
    expect(() => parsePriceToCents("-5")).toThrow();
    expect(() => parsePriceToCents("1,999")).toThrow();
  });
  it("round-trips with priceInputValue", () => {
    expect(priceInputValue(2999)).toBe("29,99");
    expect(priceInputValue(3000)).toBe("30");
    expect(priceInputValue(905)).toBe("9,05");
    expect(parsePriceToCents(priceInputValue(905))).toBe(905);
  });
  it("formats in euros", () => {
    expect(formatPrice(2999).replace(/\s/g, " ")).toBe("29,99 €");
    expect(formatPrice(null)).toBe("");
  });
});

describe("normalizeGiftUrl", () => {
  it("keeps http(s) links and adds https:// when missing", () => {
    expect(normalizeGiftUrl("https://www.lego.com/fr-fr/product/x")).toBe("https://www.lego.com/fr-fr/product/x");
    expect(normalizeGiftUrl("amazon.fr/dp/123")).toBe("https://amazon.fr/dp/123");
    expect(normalizeGiftUrl("")).toBeNull();
  });
  it("refuses dangerous schemes", () => {
    expect(() => normalizeGiftUrl("javascript:alert(1)")).toThrow();
    expect(() => normalizeGiftUrl("data:text/html,hi")).toThrow();
  });
  it("labels a link with its site", () => {
    expect(linkLabel("https://www.fnac.com/a/b")).toBe("fnac.com");
  });
});

describe("sorting and filters", () => {
  const d = (n: number) => new Date(2026, 10, n);
  const gifts = [
    { id: "a", childId: "leo", occasion: "Noël 2026", status: "BOUGHT" as const, favorite: false, priceCents: 1000, createdAt: d(1) },
    { id: "b", childId: "leo", occasion: "Noël 2026", status: "IDEA" as const, favorite: false, priceCents: 2000, createdAt: d(2) },
    { id: "c", childId: "emma", occasion: "Anniversaire", status: "PLANNED" as const, favorite: true, priceCents: null, createdAt: d(3) },
    { id: "d", childId: "emma", occasion: null, status: "IDEA" as const, favorite: false, priceCents: 500, createdAt: d(4) },
  ];

  it("puts favorites first, then ideas, planned, bought", () => {
    expect([...gifts].sort(compareGifts).map((g) => g.id)).toEqual(["c", "b", "d", "a"]);
  });
  it("filters by child and occasion", () => {
    expect(filterGifts(gifts, "leo").map((g) => g.id)).toEqual(["a", "b"]);
    expect(filterGifts(gifts, undefined, "Anniversaire").map((g) => g.id)).toEqual(["c"]);
  });
  it("lists occasions, most used first", () => {
    expect(occasionsOf(gifts)).toEqual(["Noël 2026", "Anniversaire"]);
  });
  it("summarizes a list", () => {
    expect(summary(filterGifts(gifts, "leo")).replace(/\s/g, " ")).toBe("2 cadeaux · 1 encore libre · 30,00 €");
  });
});
