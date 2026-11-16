import type { IndexEntry } from "@/data/catalog";

/**
 * Catalogue search. Every word of the query must appear somewhere in a piece's
 * name, colour, cloth, category, occasion or house reference. Matches in the
 * name rank first.
 */
export function searchProducts(index: IndexEntry[], query: string): IndexEntry[] {
  const words = query
    .toLowerCase()
    .normalize("NFKD")
    .split(/[^a-z0-9.]+/)
    .filter(Boolean)
    // "sherwanis" should find "sherwani"
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
  if (words.length === 0) return [];

  return index
    .map((entry) => {
      const name = entry.name.toLowerCase();
      if (!words.every((w) => entry.keywords.includes(w))) return null;
      const score = words.reduce((s, w) => s + (name.includes(w) ? 2 : 1) + (name.startsWith(w) ? 1 : 0), 0);
      return { entry, score };
    })
    .filter((r): r is { entry: IndexEntry; score: number } => r !== null)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.entry);
}
