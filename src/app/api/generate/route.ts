import { NextRequest, NextResponse } from "next/server";
import { generateArticle } from "@/lib/llm/generator";
import { saveArticle, buildArticle } from "@/lib/data/articles";
import { commitArticle } from "@/lib/git/commit";
import type { NewsInput } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 0;

/**
 * POST /api/generate
 * Body: { title, summary, source, url }
 * Génère un article d'opinion à partir d'une actualité saisie manuellement.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.summary || !body.source || !body.url) {
      return NextResponse.json(
        { ok: false, error: "Champs manquants : title, summary, source, url" },
        { status: 400 },
      );
    }

    const news: NewsInput = {
      title: body.title,
      summary: body.summary,
      source: body.source,
      url: body.url,
      publishedAt: body.publishedAt ?? new Date().toISOString(),
      image: body.image,
      origin: "manual",
    };

    const generated = await generateArticle(news);
    const article = buildArticle(generated, news);
    const saved = await saveArticle(article);

    // Auto-commit Git pour persistance sur Vercel.
    const commit = await commitArticle(
      saved.slug,
      `article: ${saved.title.slice(0, 72)}`,
    );

    return NextResponse.json({
      ok: true,
      article: { slug: saved.slug, title: saved.title },
      committed: commit.committed,
      commitReason: commit.reason,
    });
  } catch (err: any) {
    console.error("[api/generate]", err);
    return NextResponse.json(
      { ok: false, error: err.message ?? "Erreur inconnue" },
      { status: 500 },
    );
  }
}