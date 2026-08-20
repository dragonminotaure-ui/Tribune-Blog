import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getArticle, listArticles } from "@/lib/data/articles";
import { markdownToHtml } from "@/lib/markdown";
import { formatDate, readingTime } from "@/lib/utils";
import { getCategory } from "@/lib/categories";
import { articleJsonLd } from "@/lib/json-ld";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/article-card";
import { ShareButtons } from "@/components/share-buttons";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await listArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  const cat = getCategory(article.category);
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
    alternates: { canonical: `/article/${article.slug}` },
    keywords: article.tags,
    category: cat?.name,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const cat = getCategory(article.category);
  const html = await markdownToHtml(article.content);

  // Articles liés (même catégorie, excluant l'article courant).
  const all = await listArticles();
  const related = all
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  return (
    <>
      <SiteHeader />
      <article className="max-w-3xl mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
        />

        {/* Fil d'ariane */}
        <nav className="text-sm font-sans-ui text-stone-500 mb-4">
          <Link href="/" className="hover:text-red-600">Accueil</Link>
          {" / "}
          {cat && (
            <Link href={`/category/${cat.id}`} className="hover:text-red-600" style={{ color: cat.color }}>
              {cat.name}
            </Link>
          )}
        </nav>

        {/* Header article */}
        <header className="mb-8">
          <h1 className="font-display text-4xl leading-tight text-stone-900 mb-4">
            {article.title}
          </h1>
          <p className="text-lg text-stone-600 italic mb-4">{article.excerpt}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm font-sans-ui text-stone-500 border-t border-b border-stone-200 py-2">
            <span className="font-semibold text-stone-700">{article.author}</span>
            <span>·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span>·</span>
            <span>{readingTime(article.content)} de lecture</span>
            <span>·</span>
            <a
              href={article.source.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-red-600 hover:underline"
            >
              Source : {article.source.name} ↗
            </a>
          </div>
        </header>

        {/* Cover */}
        {article.coverImage && (
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        )}

        {/* Contenu */}
        <div
          className="prose-opinion"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Tags */}
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-stone-100 text-stone-600 text-xs rounded-full font-sans-ui"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Partage */}
        <div className="mt-6 pt-6 border-t border-stone-200">
          <ShareButtons title={article.title} slug={article.slug} />
        </div>
      </article>

      {/* Articles liés */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8 border-t border-stone-200">
          <h2 className="font-display text-2xl text-stone-900 mb-6">
            Dans la même catégorie
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}