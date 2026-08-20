import { NextResponse } from "next/server";
import { collectNews, pickBest } from "@/lib/news/collector";
import { generateArticle } from "@/lib/llm/generator";
import { saveArticle, buildArticle, listArticles } from "@/lib/data/articles";
import { commitArticle } from "@/lib/git/commit";

export const runtime = "nodejs";
export const revalidate = 0;

/**
 * POST /api/generate-auto
 * Collecte automatiquement une actualité (GNews + RSS), puis génère l'article.
 */
export async function POST() {
  try {
    const news = await collectNews(15);
    if (news.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Aucune actualité collectée (vérifier GNEWS_API_KEY et RSS_FEEDS)" },
        { status: 502 },
      );
    }

    // Évite les doublons avec les articles déjà publiés (comparaison titre).
    const existing = await listArticles();
    const existingTitles = new Set(
      existing.map((a) => a.title.toLowerCase().slice(0, 50)),
    );
    const fresh = news.find(
      (n) => !existingTitles.has(n.title.toLowerCase().slice(0, 50)),
    );
    const picked = fresh ?? pickBest(news)!;

    const generated = await generateArticle(picked);
    const article = buildArticle(generated, picked);
    const saved = await saveArticle(article);

    // Auto-commit Git pour persistance sur Vercel.
    const commit = await commitArticle(
      saved.slug,
      `article(auto): ${saved.title.slice(0, 72)}`,
    );

    return NextResponse.json({
      ok: true,
      article: { slug: saved.slug, title: saved.title },
      source: picked.source,
      committed: commit.committed,
      commitReason: commit.reason,
    });
  } catch (err: any) {
    console.error("[api/generate-auto]", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Erreur inconnue" },
      { status: 500 },
    );
  }
}