import OpenAI from "openai";
import type { GeneratedArticle, NewsInput } from "../types";
import { slugify } from "../utils";

/**
 * Prompt système du workflow éditorial (intégré fidèlement à la spec).
 */
const SYSTEM_PROMPT = `Tu es un éditeur et rédacteur d'opinion chevronné. Ton objectif est de transformer une actualité brute en un article d'opinion incisif, engageant et bien structuré pour un blog francophone.

RÈGLES DE QUALITÉ :
- Ton direct, analytique et légèrement provocateur (style éditorial/tribune).
- Thèse claire : accord, désaccord, ou nuance critique méconnue.
- JAMAIS de neutralité tiède ni de phrases creuses ("Seul l'avenir nous le dira", "Il faudra voir", etc.).
- Langue : français soutenu mais accessible.
- Longueur cible : 500 à 800 mots.

STRUCTURE OBLIGATOIRE du contenu Markdown :
1. Titre d'accroche (Percutant, 8 à 12 mots, incluant la thèse ou une question forte).
2. Chapeau (2 phrases max : le fait d'actualité + ta position).
3. **Le Fait** (1 paragraphe : résumé concis avec mention de la source).
4. **L'Analyse** (2 à 3 paragraphes : pourquoi c'est important, les arguments, les conséquences prévisibles).
5. **Conclusion** (Un mot de la fin tranchant + une question pour inciter aux commentaires).

MÉTADONNÉES à produire (en plus du contenu) :
- category : une catégorie parmi [technologie, economie, politique, societe, environnement, culture, international].
- tags : 3 à 5 tags pertinents (mots-clés courts).
- excerpt : résumé SEO de 150 caractères maximum.

FORMAT DE RÉPONSE : JSON strict, aucun texte hors JSON.`;

function buildUserPrompt(news: NewsInput): string {
  return `Transforme cette actualité brute en article d'opinion selon le workflow.

DONNÉES BRUTES :
- Titre : ${news.title}
- Résumé : ${news.summary}
- Source : ${news.source}
- Lien : ${news.url}

Réponds UNIQUEMENT avec un JSON valide de cette forme exacte :
{
  "title": "...",
  "slug": "...",
  "category": "technologie|economie|politique|societe|environnement|culture|international",
  "tags": ["tag1", "tag2", "tag3"],
  "excerpt": "résumé SEO <= 150 caractères",
  "content": "## Titre\\n\\nChapeau...\\n\\n### Le Fait\\n\\n...\\n\\n### L'Analyse\\n\\n...\\n\\n### Conclusion\\n\\n..."
}`;
}

/**
 * Génère un article d'opinion via un LLM compatible OpenAI.
 *
 * Providers supportés :
 *  - OpenAI  : LLM_API_KEY=sk-...,  LLM_MODEL=gpt-4o-mini (défaut)
 *  - Mistral : LLM_API_KEY=jqEu..., LLM_MODEL=mistral-small-latest,
 *              LLM_BASE_URL=https://api.mistral.ai/v1
 *
 * Variables d'env :
 *  - LLM_API_KEY  (requis) : clé API du provider
 *  - LLM_MODEL    (optionnel, défaut: gpt-4o-mini)
 *  - LLM_BASE_URL (optionnel) : endpoint alternatif (ex: Mistral)
 *
 * Rétro-compatibilité : OPENAI_API_KEY / OPENAI_MODEL toujours lus.
 */
export async function generateArticle(
  news: NewsInput,
): Promise<GeneratedArticle> {
  const apiKey = process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("LLM_API_KEY (ou OPENAI_API_KEY) manquant — génération impossible.");
  }

  const baseURL = process.env.LLM_BASE_URL; // undefined → défaut OpenAI
  const model = process.env.LLM_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(news) },
    ],
    temperature: 0.8,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  let parsed: GeneratedArticle;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Réponse LLM non-JSON : " + raw.slice(0, 200));
  }

  // Assure un slug valide.
  if (!parsed.slug || parsed.slug.length < 3) {
    parsed.slug = slugify(parsed.title);
  } else {
    parsed.slug = slugify(parsed.slug);
  }

  return parsed;
}