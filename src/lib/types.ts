/** Article d'opinion généré par le workflow éditorial. */
export interface OpinionArticle {
  /** Titre d'accroche (8-12 mots). */
  title: string;
  /** Slug URL optimisé. */
  slug: string;
  /** Catégorie éditoriale. */
  category: string;
  /** 3 à 5 tags pertinents. */
  tags: string[];
  /** Résumé de 150 caractères max pour le SEO. */
  excerpt: string;
  /** Corps du texte en Markdown. */
  content: string;
  /** Date ISO 8601 de publication. */
  publishedAt: string;
  /** Source de l'actualité brute. */
  source: NewsSource;
  /** Image de couverture (optionnelle). */
  coverImage?: string;
  /** Auteur affiché. */
  author: string;
}

/** Actualité brute en entrée du workflow. */
export interface NewsInput {
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt?: string;
  image?: string;
  /** Origine de la collecte. */
  origin: "gnews" | "rss" | "manual";
}

/** Résultat structuré attendu du LLM. */
export interface GeneratedArticle {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
}

/** Définition d'une catégorie éditoriale. */
export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

/** Source de news (pour affichage). */
export interface NewsSource {
  name: string;
  url: string;
  origin: NewsInput["origin"];
}