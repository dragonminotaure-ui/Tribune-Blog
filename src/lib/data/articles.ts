import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { OpinionArticle, NewsInput } from "../types";
import { slugify } from "../utils";

const ARTICLES_DIR = path.join(process.cwd(), "data", "articles");

async function ensureDir() {
  await fs.mkdir(ARTICLES_DIR, { recursive: true });
}

/** Liste tous les articles (tri du plus récent au plus ancien). */
export async function listArticles(): Promise<OpinionArticle[]> {
  await ensureDir();
  const files = await fs.readdir(ARTICLES_DIR).catch(() => []);
  const mdx = files.filter((f) => f.endsWith(".mdx"));

  const articles = await Promise.all(
    mdx.map(async (f) => {
      const raw = await fs.readFile(path.join(ARTICLES_DIR, f), "utf-8");
      const { data, content } = matter(raw);
      return {
        title: data.title,
        slug: data.slug ?? f.replace(/\.mdx$/, ""),
        category: data.category,
        tags: data.tags ?? [],
        excerpt: data.excerpt ?? "",
        content,
        publishedAt: data.publishedAt ?? new Date().toISOString(),
        source: data.source ?? { name: "Inconnu", url: "", origin: "manual" },
        coverImage: data.coverImage,
        author: data.author ?? "La Rédaction",
      } as OpinionArticle;
    }),
  );

  return articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/** Récupère un article par slug. */
export async function getArticle(slug: string): Promise<OpinionArticle | null> {
  const articles = await listArticles();
  return articles.find((a) => a.slug === slug) ?? null;
}

/** Vérifie si un slug existe déjà (anti-doublon). */
export async function slugExists(slug: string): Promise<boolean> {
  const articles = await listArticles();
  return articles.some((a) => a.slug === slug);
}

/** Génère le contenu .mdx (front-matter + body) en mémoire. */
export function articleToMdx(article: OpinionArticle): string {
  const front = {
    title: article.title,
    slug: article.slug,
    category: article.category,
    tags: article.tags,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt,
    source: article.source,
    coverImage: article.coverImage ?? null,
    author: article.author,
  };
  return matter.stringify(article.content, front);
}

/**
 * Sauvegarde un article en .mdx avec front-matter.
 * Évite les collisions de slug avec un suffixe -2, -3, etc.
 */
export async function saveArticle(
  article: OpinionArticle,
): Promise<OpinionArticle> {
  let slug = article.slug || slugify(article.title);
  if (await slugExists(slug)) {
    // Ajoute suffixe numérique.
    let i = 2;
    while (await slugExists(`${slug}-${i}`)) i++;
    slug = `${slug}-${i}`;
  }

  const saved = { ...article, slug };
  const fileContent = articleToMdx(saved);

  // Tente d'écrire sur disque (local). Sur Vercel (read-only), ignore l'erreur.
  try {
    await ensureDir();
    await fs.writeFile(path.join(ARTICLES_DIR, `${slug}.mdx`), fileContent, "utf-8");
  } catch (err: any) {
    if (err?.code === "EROFS" || err?.code === "ENOSPC") {
      // Filesystem en lecture seule (Vercel) — l'article sera commité via Git.
      console.log("[saveArticle] Filesystem read-only, article en mémoire uniquement.");
    } else {
      throw err;
    }
  }

  return saved;
}

/** Construit un OpinionArticle complet à partir du résultat LLM + la news source. */
export function buildArticle(
  gen: import("../types").GeneratedArticle,
  news: NewsInput,
): OpinionArticle {
  return {
    title: gen.title,
    slug: slugify(gen.slug || gen.title),
    category: gen.category,
    tags: gen.tags,
    excerpt: gen.excerpt,
    content: gen.content,
    publishedAt: new Date().toISOString(),
    source: { name: news.source, url: news.url, origin: news.origin },
    coverImage: news.image,
    author: "La Rédaction",
  };
}

/** Supprime un article par slug. */
export async function deleteArticle(slug: string): Promise<boolean> {
  try {
    await fs.unlink(path.join(ARTICLES_DIR, `${slug}.mdx`));
    return true;
  } catch {
    return false;
  }
}