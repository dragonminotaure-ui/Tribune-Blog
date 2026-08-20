import Parser from "rss-parser";
import type { NewsInput } from "../types";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "Tribune-Bot/1.0" },
});

/**
 * Flux RSS par défaut (modifiables via env RSS_FEEDS, séparés par virgules).
 */
const DEFAULT_FEEDS = [
  "https://feeds.lemonde.fr/c/205/f/3000/index.rss", // Le Monde
  "https://www.francetvinfo.fr/titres.rss", // France Info
  "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
];

/** Récupère les items RSS comme NewsInput. */
export async function fetchRssFeeds(maxPerFeed = 5): Promise<NewsInput[]> {
  const feedsEnv = process.env.RSS_FEEDS;
  const feeds = feedsEnv
    ? feedsEnv.split(",").map((f) => f.trim()).filter(Boolean)
    : DEFAULT_FEEDS;

  const results = await Promise.allSettled(
    feeds.map(async (url) => {
      const feed = await parser.parseURL(url);
      return (feed.items ?? []).slice(0, maxPerFeed).map(
        (item): NewsInput => ({
          title: item.title ?? "",
          summary:
            item.contentSnippet ?? item.summary ?? item.content ?? "",
          source: feed.title ?? url,
          url: item.link ?? url,
          publishedAt: item.isoDate ?? item.pubDate,
          image:
            (item as any).enclosure?.url ??
            (item as any)["media:content"]?.url,
          origin: "rss",
        }),
      );
    }),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<NewsInput[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);
}