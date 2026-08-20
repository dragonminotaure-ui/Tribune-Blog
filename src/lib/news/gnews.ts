import type { NewsInput } from "../types";

const GNEWS_API = "https://gnews.io/api/v4";

/**
 * Récupère les top headlines via GNews API.
 * Nécessite GNEWS_API_KEY. Retourne un tableau NewsInput.
 */
export async function fetchGNewsHeadlines(
  category?: string,
  lang = "fr",
  max = 10,
): Promise<NewsInput[]> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) {
    console.warn("[gnews] GNEWS_API_KEY manquant — source ignorée.");
    return [];
  }
  const params = new URLSearchParams({
    apikey: key,
    lang,
    max: String(Math.min(max, 10)),
  });
  if (category) params.set("category", category);

  try {
    const res = await fetch(`${GNEWS_API}/top-headlines?${params}`, {
      next: { revalidate: 900, tags: ["gnews"] },
    });
    if (!res.ok) {
      console.error(`[gnews] HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data.articles ?? []).map((a: any): NewsInput => ({
      title: a.title ?? "",
      summary: a.description ?? "",
      source: a.source?.name ?? "GNews",
      url: a.url ?? "",
      publishedAt: a.publishedAt,
      image: a.image,
      origin: "gnews",
    }));
  } catch (e) {
    console.error("[gnews] fetch error:", e);
    return [];
  }
}

/** Recherche GNews par mots-clés. */
export async function searchGNews(
  query: string,
  lang = "fr",
  max = 10,
): Promise<NewsInput[]> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) return [];
  const params = new URLSearchParams({
    apikey: key,
    lang,
    max: String(Math.min(max, 10)),
    q: query,
  });
  try {
    const res = await fetch(`${GNEWS_API}/search?${params}`, {
      next: { revalidate: 900, tags: ["gnews"] },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles ?? []).map((a: any): NewsInput => ({
      title: a.title ?? "",
      summary: a.description ?? "",
      source: a.source?.name ?? "GNews",
      url: a.url ?? "",
      publishedAt: a.publishedAt,
      image: a.image,
      origin: "gnews",
    }));
  } catch {
    return [];
  }
}