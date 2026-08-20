import { listArticles } from "@/lib/data/articles";
import { ArticleLead, ArticleCard } from "@/components/article-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { itemListJsonLd, organizationJsonLd } from "@/lib/json-ld";

export const revalidate = 900;

export default async function HomePage() {
  const articles = await listArticles();
  const [lead, ...rest] = articles;

  return (
    <>
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(articles)) }}
        />

        <div className="mb-8 border-b-2 border-stone-900 pb-2">
          <h1 className="font-display text-3xl text-stone-900">L&apos;éditorial du jour</h1>
          <p className="text-sm text-stone-500 font-sans-ui mt-1">
            Opinions tranchantes sur l&apos;actualité — 5 publications par jour.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-stone-500 font-sans-ui">
            <p className="text-xl mb-2">Aucun article pour le moment.</p>
            <p className="text-sm">
              La génération automatique tourne 5x/jour via Vercel Cron.
              Vous pouvez aussi générer un article depuis l&apos;<a href="/admin" className="text-red-600 underline">interface admin</a>.
            </p>
          </div>
        ) : (
          <>
            {lead && (
              <div className="mb-10">
                <ArticleLead article={lead} />
              </div>
            )}
            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}