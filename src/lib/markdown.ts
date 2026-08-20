import { remark } from "remark";
import remarkHtml from "remark-html";
import path from "node:path";
import fs from "node:fs/promises";

/** Convertit Markdown → HTML côté serveur. */
export async function markdownToHtml(md: string): Promise<string> {
  const file = await remark().use(remarkHtml).process(md);
  return String(file);
}

/** Lit un fichier .mdx du dossier data/articles (pour build statique). */
export async function readArticleFile(slug: string): Promise<string | null> {
  const filePath = path.join(process.cwd(), "data", "articles", `${slug}.mdx`);
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}