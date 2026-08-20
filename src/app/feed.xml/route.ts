import { listArticles } from "@/lib/data/articles";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * GET /feed.xml
 * Flux RSS 2.0 du blog.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await listArticles();

  const items = articles
    .slice(0, 20)
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE_URL}/article/${a.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/article/${a.slug}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(a.category)}</category>
      <author>${escapeXml(a.author)}</author>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tribune — Opinions</title>
    <link>${SITE_URL}</link>
    <description>Blog d'opinion indépendant. Analyses tranchantes sur l'actualité, 5 fois par jour.</description>
    <language>fr-FR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}