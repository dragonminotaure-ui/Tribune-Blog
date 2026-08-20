import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { collectNews, pickBest } from "@/lib/news/collector";
import { generateArticle } from "@/lib/llm/generator";
import { saveArticle, buildArticle, listArticles } from "@/lib/data/articles";
import { commitArticle } from "@/lib/git/commit";

export const runtime = "nodejs";

/**
 * GET /api/cron?secret=XXX
 * Tâche planifiée Vercel Cron (5x/jour).
 * Vérifie CRON_SECRET, collecte une actualité, génère et publie l'article,
 * puis revalide les pages.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }

  try {
    const news = await collectNews(15);
    if (news.length === 0) {
      return NextResponse.json({ ok: false, error: "Aucune actualité collectée" });
    }

    // Évite les doublons.
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
      `article(cron): ${saved.title.slice(0, 72)}`,
    );

    // Revalidation des pages.
    revalidatePath("/", "layout");
    revalidatePath(`/article/${saved.slug}`);
    revalidatePath(`/category/${article.category}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      ok: true,
      article: { slug: saved.slug, title: saved.title },
      publishedAt: article.publishedAt,
      committed: commit.committed,
      commitReason: commit.reason,
    });
  } catch (err: any) {
    console.error("[api/cron]", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 },
    );
  }
}