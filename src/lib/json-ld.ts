import type { OpinionArticle } from "./types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** JSON-LD Article pour Google Actualités / Rich Results. */
export function articleJsonLd(article: OpinionArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "OpinionNewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Tribune",
      url: SITE_URL,
    },
    articleSection: article.category,
    keywords: article.tags.join(", "),
    url: `${SITE_URL}/article/${article.slug}`,
    ...(article.coverImage
      ? { image: { "@type": "ImageObject", url: article.coverImage } }
      : {}),
    isPartOf: { "@type": "Blog", name: "Tribune", url: SITE_URL },
  };
}

/** JSON-LD Liste pour la home / catégorie. */
export function itemListJsonLd(articles: OpinionArticle[], path = "") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: articles.slice(0, 10).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/article/${a.slug}`,
      name: a.title,
    })),
    url: `${SITE_URL}${path}`,
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "Tribune",
    url: SITE_URL,
    description:
      "Blog d'opinion indépendant : analyses tranchantes sur l'actualité.",
    inLanguage: "fr-FR",
  };
}