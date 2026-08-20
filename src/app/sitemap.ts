import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/data/articles";
import { CATEGORIES } from "@/lib/categories";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listArticles();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/legal`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/admin`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/category/${c.id}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/article/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}