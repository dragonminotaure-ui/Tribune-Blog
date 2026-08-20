import { listArticles } from "@/lib/data/articles";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * GET /news-sitemap.xml
 * Sitemap Google Actualités (News) pour l'indexation rapide.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await listArticles();
  const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;

  const urls = articles
    .filter((a) => new Date(a.publishedAt).getTime() > twoDaysAgo)
    .map(
      (a) => `    <url>
      <loc>${SITE_URL}/article/${a.slug}</loc>
      <news:news>
        <news:publication>
          <news:name>Tribune</news:name>
          <news:language>fr</news:language>
        </news:publication>
        <news:publication_date>${a.publishedAt}</news:publication_date>
        <news:title>${escapeXml(a.title)}</news:title>
        <news:keywords>${escapeXml(a.tags.join(", "))}</news:keywords>
      </news:news>
    </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
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