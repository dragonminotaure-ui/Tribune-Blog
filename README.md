# Tribune — Blog d&apos;Opinion (Next.js)

Blog d&apos;opinion indépendant qui transforme l&apos;actualité brute en tribunes
tranchantes. Génération automatique **5 fois par jour** via Vercel Cron Jobs,
LLM OpenAI et collecte multi-sources (GNews API + flux RSS + saisie manuelle).

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **OpenAI** (`gpt-4o-mini` par défaut) — génération éditoriale
- **GNews API** + **rss-parser** — collecte d&apos;actualités
- **gray-matter** + **remark** — articles en `.mdx` avec front-matter

## Structure

```
opinion-blog/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Accueil (lead + grille)
│   │   ├── article/[slug]/page.tsx  # Article (JSON-LD, canonical, nofollow source)
│   │   ├── category/[id]/page.tsx   # Page catégorie (7 catégories)
│   │   ├── admin/page.tsx           # Interface de génération (manuel + auto)
│   │   ├── about/ · legal/          # Pages statiques
│   │   ├── api/
│   │   │   ├── generate/            # POST : génération manuelle
│   │   │   ├── generate-auto/       # POST : collecte + génération
│   │   │   └── cron/                # GET  : tâche planifiée (Vercel Cron)
│   │   ├── sitemap.ts · robots.ts   # SEO
│   │   ├── news-sitemap.xml/        # Google News sitemap
│   │   └── feed.xml/                # RSS 2.0
│   ├── components/                  # Header, Footer, ArticleCard/Lead
│   └── lib/
│       ├── types.ts                 # OpinionArticle, NewsInput, GeneratedArticle
│       ├── categories.ts            # 7 catégories éditoriales
│       ├── utils.ts                 # slugify, formatDate, readingTime
│       ├── json-ld.ts               # Schema.org OpinionNewsArticle
│       ├── markdown.ts              # remark → HTML
│       ├── news/
│       │   ├── gnews.ts             # GNews API client
│       │   ├── rss.ts               # Parser RSS multi-flux
│       │   └── collector.ts         # Orchestrateur + dédup
│       ├── llm/
│       │   └── generator.ts         # Prompt workflow → LLM (OpenAI/Mistral/Groq)
│       ├── git/
│       │   └── commit.ts            # Auto-commit articles sur GitHub (persistance Vercel)
│       └── data/
│           └── articles.ts          # Data store .mdx (CRUD)
├── data/articles/*.mdx              # Articles persistés (commités sur Git)
├── vercel.json                      # Cron 5x/jour (07h, 10h, 13h, 16h, 19h UTC)
└── .env.local.example
```

## Workflow éditorial (intégré au prompt LLM)

Le système suit exactement le workflow demandé :

1. **Analyse** de l&apos;actualité source (3 points clés + enjeu sous-jacent)
2. **Prise de position** (thèse claire, ton provocateur, sans neutralité tiède)
3. **Rédaction** structurée : Titre → Chapeau → Le Fait → L&apos;Analyse → Conclusion + question ouverte
4. **Métadonnées** : `title`, `slug`, `category`, `tags`, `excerpt`, `content`

## Installation

```bash
cd opinion-blog
npm install
cp .env.local.example .env.local
# → Renseigner LLM_API_KEY, GNEWS_API_KEY, CRON_SECRET, NEXT_PUBLIC_SITE_URL
npm run dev
```

## Déploiement Vercel (avec auto-commit Git)

Le filesystem de Vercel est **éphémère** en production : les fichiers écrits
à l'exécution disparaissent au prochain déploiement. Pour persister les articles,
chaque génération **commit automatiquement** le fichier `.mdx` sur le repo GitHub
via l'API Git. Le commit déclenche un rebuild Vercel qui met l'article en ligne.

### Étapes

1. **Créer le repo GitHub** et pusher le code :
   ```bash
   git init && git add -A && git commit -m "init"
   git remote add origin https://github.com/USER/opinion-blog.git
   git push -u origin main
   ```

2. **Créer un Personal Access Token** GitHub :
   - Settings → Developer settings → Personal access tokens → Fine-grained
   - Permissions : **Contents = Read and write**
   - Copier le token `ghp_...`

3. **Importer dans Vercel** : vercel.com → New Project → importer le repo.

4. **Configurer les variables d'environnement** dans Vercel :
   ```
   LLM_API_KEY=cmB73bCPSr8EsnkLVEuuFnWSc6DoeJ4p
   LLM_MODEL=mistral-small-latest
   LLM_BASE_URL=https://api.mistral.ai/v1
   GNEWS_API_KEY=ta_cle_gnews
   RSS_FEEDS=https://feeds.lemonde.fr/c/205/f/3000/index.rss,https://www.francetvinfo.fr/titres.rss
   CRON_SECRET=openssl rand -hex 32
   NEXT_PUBLIC_SITE_URL=https://ton-domaine.vercel.app
   GIT_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GIT_REPO=USER/opinion-blog
   GIT_BRANCH=main
   GIT_AUTHOR=Tribune Bot
   GIT_EMAIL=bot@tribune.local
   ```

5. Le `vercel.json` déclare le cron `/api/cron?secret=$CRON_SECRET` à **07h, 10h, 13h, 16h, 19h UTC** (5x/jour).

6. Déployer. Chaque génération (cron, auto, manuel) fera un commit GitHub → rebuild automatique.

### En dev local

Sans `GIT_TOKEN`, les articles sont juste écrits sur disque (`data/articles/`).
Pour tester le commit local : `git add data/articles/*.mdx && git commit -m "article"`.

## Sources d&apos;actualité

| Source | Config | Notes |
|--------|--------|-------|
| **GNews API** | `GNEWS_API_KEY` | Plan gratuit : 100 req/jour. 5 générations/jour = OK. |
| **RSS** | `RSS_FEEDS` (csv) | Le Monde + France Info par défaut. |
| **Manuel** | Page `/admin` | Formulaire title/summary/source/url. |

## SEO

- `sitemap.xml` (pages statiques + catégories + articles)
- `news-sitemap.xml` (Google News, articles < 48h)
- `robots.ts` (autorise tout sauf `/admin` et `/api/`)
- **JSON-LD** `OpinionNewsArticle` sur chaque article
- `canonical` = URL de l&apos;article ; lien source en `rel="nofollow"`
- `feed.xml` RSS 2.0

## Partage social

Boutons de partage sur chaque page article (composant `ShareButtons`) :
- X (Twitter), Facebook, LinkedIn, WhatsApp
- Copier le lien (presse-papier)
- URL de partage construite dynamiquement selon le domaine de déploiement

## Copyright

Le blog ne reproduit **jamais** le texte intégral des sources. Chaque article
contient un résumé du fait d&apos;actualité suivi d&apos;une analyse originale.
Le lien vers la source est en `rel="nofollow"`.

## Catégories

`tech` · `economie` · `politique` · `societe` · `environnement` · `culture` · `international`