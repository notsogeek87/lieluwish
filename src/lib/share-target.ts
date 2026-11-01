// Turns what Android's "Share" sheet sends (title / text / url, depending on
// the app) into a gift title and link. Amazon, for instance, often sends
// everything in `text`: "Découvrez Vélo enfant 16 pouces sur Amazon https://amzn.eu/d/abc".

const URL_RE = /https?:\/\/[^\s<>"']+/i;

// Wrapping phrases added by shopping apps around the product name.
const PREFIXES = [
  /^d[ée]couvrez\s+(ce produit\s*:?\s*)?/i,
  /^regardez\s+(ce produit\s*:?\s*)?/i,
  /^check out (this product\s*:?\s*)?/i,
  /^j'ai trouv[ée] (ce produit|ça)( sur amazon)?\s*:?\s*/i,
];
const SUFFIXES = [/\s+(sur|on|chez)\s+amazon(\.[a-z.]+)?\s*:?$/i, /\s*[-|:–]\s*amazon(\.[a-z.]+)?$/i];

function clean(raw: string): string {
  let s = raw.replace(/\s+/g, " ").trim();
  for (const re of PREFIXES) s = s.replace(re, "");
  for (const re of SUFFIXES) s = s.replace(re, "");
  return s.replace(/^["'«“\s]+|["'»”:\s]+$/g, "").trim();
}

export function parseSharedContent(input: { title?: string | null; text?: string | null; url?: string | null }): {
  title: string;
  url: string;
} {
  const text = input.text ?? "";
  const url = (input.url ?? "").trim() || (text.match(URL_RE)?.[0] ?? "");
  const textWithoutUrl = url ? text.replace(url, " ") : text;

  // Prefer the shared title, unless it is just the site's name.
  const sharedTitle = clean(input.title ?? "");
  const fromText = clean(textWithoutUrl);
  const title = sharedTitle && !/^amazon(\.[a-z.]+)?$/i.test(sharedTitle) ? sharedTitle : fromText;

  return { title: title.slice(0, 200), url: url.slice(0, 2000) };
}
