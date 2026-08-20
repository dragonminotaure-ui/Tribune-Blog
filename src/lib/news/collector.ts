import type { NewsInput } from "../types";
import { fetchGNewsHeadlines } from "./gnews";
import { fetchRssFeeds } from "./rss";

/**
 * Orchestrateur de collecte : fusionne GNews + RSS, déduplique par URL/titre.
 */
export async function collectNews(max = 15): Promise<NewsInput[]> {
  const [gnews, rss] = await Promise.all([
    fetchGNewsHeadlines(undefined, "fr", 10),
    fetchRssFeeds(5),
  ]);

  const all = [...gnews, ...rss].slice(0, max);
  return dedup(all);
}

/** Déduplication par URL et par similarité de titre. */
export function dedup(items: NewsInput[]): NewsInput[] {
  const seen = new Set<string>();
  const out: NewsInput[] = [];
  for (const it of items) {
    const keyUrl = normalizeUrl(it.url);
    const keyTitle = it.title.toLowerCase().slice(0, 60);
    if (seen.has(keyUrl) || seen.has(keyTitle)) continue;
    seen.add(keyUrl);
    seen.add(keyTitle);
    out.push(it);
  }
  return out;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

/** Sélectionne la meilleure actualité non encore traitée. */
export function pickBest(items: NewsInput[]): NewsInput | null {
  if (items.length === 0) return null;
  // Privilégie les plus récentes (GNews publie publishedAt ISO).
  return [...items].sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  })[0];
}