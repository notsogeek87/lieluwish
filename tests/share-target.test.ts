import { describe, expect, it } from "vitest";
import { parseSharedContent } from "@/lib/share-target";

describe("parseSharedContent (Android share sheet)", () => {
  it("extracts title and link when everything is in `text` (Amazon)", () => {
    expect(
      parseSharedContent({ text: "Découvrez Vélo enfant 16 pouces rouge sur Amazon https://amzn.eu/d/abc123" })
    ).toEqual({ title: "Vélo enfant 16 pouces rouge", url: "https://amzn.eu/d/abc123" });
  });

  it("handles the English wording and a trailing link", () => {
    expect(parseSharedContent({ text: "Check out this product: LEGO Ninjago 71799 https://www.amazon.fr/dp/B0C" })).toEqual({
      title: "LEGO Ninjago 71799",
      url: "https://www.amazon.fr/dp/B0C",
    });
  });

  it("uses explicit title and url fields when the app sends them", () => {
    expect(
      parseSharedContent({ title: "Trottinette 3 roues", text: "", url: "https://www.decathlon.fr/p/x" })
    ).toEqual({ title: "Trottinette 3 roues", url: "https://www.decathlon.fr/p/x" });
  });

  it("ignores a title that is just the site name", () => {
    expect(parseSharedContent({ title: "Amazon.fr", text: "Peluche licorne https://amzn.eu/d/z" }).title).toBe(
      "Peluche licorne"
    );
  });

  it("copes with nothing useful", () => {
    expect(parseSharedContent({})).toEqual({ title: "", url: "" });
  });
});
