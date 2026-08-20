import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listArticles } from "@/lib/data/articles";
import { getCategory, CATEGORIES } from "@/lib/categories";
import { ArticleCard } from "@/components/article-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { itemListJsonLd } from "@/lib/json-ld";

export const revalidate = 900;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const cat = getCategory(id);
  if (!cat) return {};
  return {
    title: `${cat.name} — Opinions`,
    description: cat.description,
    alternates: { canonical: `/category/${cat.id}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const cat = getCategory(id);
  if (!cat) notFound();

  const all = await listArticles();
  const articles = all.filter((a) => a.category === id);

  return (
    <>
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(articles, `/category/${id}`)) }}
        />
        <div className="mb-8 border-b-2 pb-3" style={{ borderColor: cat.color }}>
          <h1 className="font-display text-3xl text-stone-900" style={{ color: cat.color }}>
            {cat.name}
          </h1>
          <p className="text-sm text-stone-500 font-sans-ui mt-1">{cat.description}</p>
        </div>

        {articles.length === 0 ? (
          <p className="text-center py-20 text-stone-500 font-sans-ui">
            Aucun article dans cette catégorie pour le moment.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}