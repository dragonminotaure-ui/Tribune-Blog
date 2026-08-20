import Link from "next/link";
import Image from "next/image";
import type { OpinionArticle } from "@/lib/types";
import { formatRelative, readingTime } from "@/lib/utils";
import { getCategory } from "@/lib/categories";

export function ArticleCard({ article }: { article: OpinionArticle }) {
  const cat = getCategory(article.category);
  return (
    <article className="group flex flex-col bg-white border border-stone-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {article.coverImage && (
        <Link href={`/article/${article.slug}`} className="block relative aspect-video overflow-hidden">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform"
            unoptimized
          />
        </Link>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs font-sans-ui mb-2">
          {cat && (
            <Link
              href={`/category/${cat.id}`}
              className="font-semibold uppercase tracking-wide hover:underline"
              style={{ color: cat.color }}
            >
              {cat.name}
            </Link>
          )}
          <span className="text-stone-400">·</span>
          <span className="text-stone-500">{formatRelative(article.publishedAt)}</span>
        </div>
        <Link href={`/article/${article.slug}`}>
          <h3 className="font-display text-lg leading-snug text-stone-900 group-hover:text-red-600 transition-colors mb-2">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-stone-600 line-clamp-3 flex-1">{article.excerpt}</p>
        <div className="mt-3 flex items-center justify-between text-xs font-sans-ui text-stone-400">
          <span>{readingTime(article.content)}</span>
          <span className="italic">— {article.author}</span>
        </div>
      </div>
    </article>
  );
}

export function ArticleLead({ article }: { article: OpinionArticle }) {
  const cat = getCategory(article.category);
  return (
    <article className="grid md:grid-cols-2 gap-6 items-center bg-white border border-stone-200 rounded-lg overflow-hidden">
      {article.coverImage && (
        <Link href={`/article/${article.slug}`} className="relative aspect-video md:aspect-auto md:h-full block overflow-hidden">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
            unoptimized
          />
        </Link>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs font-sans-ui mb-3">
          {cat && (
            <Link href={`/category/${cat.id}`} className="font-semibold uppercase tracking-wide" style={{ color: cat.color }}>
              {cat.name}
            </Link>
          )}
          <span className="text-stone-400">·</span>
          <span className="text-stone-500">{formatRelative(article.publishedAt)}</span>
        </div>
        <Link href={`/article/${article.slug}`}>
          <h2 className="font-display text-3xl leading-tight text-stone-900 hover:text-red-600 transition-colors mb-3">
            {article.title}
          </h2>
        </Link>
        <p className="text-lg text-stone-600 mb-4">{article.excerpt}</p>
        <div className="flex items-center gap-3 text-xs font-sans-ui text-stone-400">
          <span>{readingTime(article.content)}</span>
          <span>·</span>
          <span>Source : {article.source.name}</span>
        </div>
      </div>
    </article>
  );
}