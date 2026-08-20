import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Commite un article .mdx sur le dépôt Git pour persistance sur Vercel.
 *
 * En production (Vercel), le filesystem est éphémère : un fichier écrit
 * disparaît au prochain déploiement. En commitant l'article sur la branche
 * principale via l'API Git, l'article devient permanent et déclenche un
 * rebuild qui le met en ligne.
 *
 * Variables d'env requises :
 * - GIT_TOKEN     : Personal Access Token (GitHub/GitLab) avec accès repo
 * - GIT_REPO      : owner/repo (ex: mitchell94/opinion-blog)
 * - GIT_BRANCH    : branche cible (défaut: main)
 * - GIT_AUTHOR    : nom auteur commit (défaut: Tribune Bot)
 * - GIT_EMAIL     : email auteur commit
 *
 * Si GIT_TOKEN est absent, la fonction ne fait rien (mode dev local).
 */

interface GitCommitResult {
  committed: boolean;
  reason?: string;
}

export async function commitArticle(
  slug: string,
  message: string,
): Promise<GitCommitResult> {
  const token = process.env.GIT_TOKEN;
  const repo = process.env.GIT_REPO;

  // En dev local : pas de commit, on garde juste le fichier sur disque.
  if (!token || !repo) {
    return { committed: false, reason: "GIT_TOKEN/GIT_REPO non configuré (mode local)" };
  }

  const branch = process.env.GIT_BRANCH ?? "main";
  const author = process.env.GIT_AUTHOR ?? "Tribune Bot";
  const email = process.env.GIT_EMAIL ?? "bot@tribune.local";

  try {
    // Utilise l'API Git GitHub pour créer un commit directement.
    // 1. Récupère le SHA du dernier commit de la branche.
    const refRes = await fetch(
      `https://api.github.com/repos/${repo}/git/refs/heads/${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    if (!refRes.ok) {
      return { committed: false, reason: `ref fetch HTTP ${refRes.status}` };
    }
    const ref = await refRes.json();
    const parentSha: string = ref.object.sha;

    // 2. Récupère l'arbre de base.
    const commitRes = await fetch(
      `https://api.github.com/repos/${repo}/git/commits/${parentSha}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    if (!commitRes.ok) {
      return { committed: false, reason: `commit fetch HTTP ${commitRes.status}` };
    }
    const commitData = await commitRes.json();
    const baseTreeSha: string = commitData.tree.sha;

    // 3. Lit le contenu du fichier .mdx local.
    const { readFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const filePath = path.join(process.cwd(), "data", "articles", `${slug}.mdx`);
    const content = await readFile(filePath, "utf-8");
    const base64Content = Buffer.from(content).toString("base64");

    // 4. Crée un blob.
    const blobRes = await fetch(
      `https://api.github.com/repos/${repo}/git/blobs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: base64Content,
          encoding: "base64",
        }),
      },
    );
    if (!blobRes.ok) {
      return { committed: false, reason: `blob create HTTP ${blobRes.status}` };
    }
    const blob = await blobRes.json();
    const blobSha: string = blob.sha;

    // 5. Crée un nouvel arbre avec le fichier.
    const treeRes = await fetch(
      `https://api.github.com/repos/${repo}/git/trees`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: [
            {
              path: `data/articles/${slug}.mdx`,
              mode: "100644",
              type: "blob",
              sha: blobSha,
            },
          ],
        }),
      },
    );
    if (!treeRes.ok) {
      return { committed: false, reason: `tree create HTTP ${treeRes.status}` };
    }
    const tree = await treeRes.json();
    const treeSha: string = tree.sha;

    // 6. Crée le commit.
    const newCommitRes = await fetch(
      `https://api.github.com/repos/${repo}/git/commits`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          tree: treeSha,
          parents: [parentSha],
          author: { name: author, email, date: new Date().toISOString() },
        }),
      },
    );
    if (!newCommitRes.ok) {
      return { committed: false, reason: `commit create HTTP ${newCommitRes.status}` };
    }
    const newCommit = await newCommitRes.json();
    const newCommitSha: string = newCommit.sha;

    // 7. Met à jour la référence de branche.
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${repo}/git/refs/heads/${branch}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sha: newCommitSha, force: false }),
      },
    );
    if (!updateRefRes.ok) {
      return { committed: false, reason: `ref update HTTP ${updateRefRes.status}` };
    }

    return { committed: true };
  } catch (err: any) {
    return { committed: false, reason: err.message };
  }
}

/**
 * En mode dev local (pas de GIT_TOKEN), tente un commit git classique.
 * Utile pour tester localement sans configurer l'API GitHub.
 */
export async function commitLocal(slug: string, message: string): Promise<boolean> {
  try {
    await execAsync(`git add data/articles/${slug}.mdx`, { cwd: process.cwd() });
    await execAsync(
      `git commit -m "${message.replace(/"/g, '\\"')}"`,
      { cwd: process.cwd() },
    );
    return true;
  } catch {
    return false;
  }
}