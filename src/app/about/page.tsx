import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "À propos",
  description: "Présentation de Tribune, blog d'opinion indépendant.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display text-4xl text-stone-900 mb-6">À propos</h1>
        <div className="prose-opinion">
          <p>
            <strong>Tribune</strong> est un blog d&apos;opinion indépendant qui
            transforme l&apos;actualité brute en analyses tranchantes. Cinq
            fois par jour, notre moteur éditorial sélectionne une actualité,
            l&apos;analyse sous un angle critique et publie une tribune
            structurée.
          </p>
          <h2>Notre ligne éditoriale</h2>
          <p>
            Nous refusons la neutralité tiède. Chaque article prend position :
            accord, désaccord ou nuance critique méconnue. Le ton est direct,
            analytique et légèrement provocateur — style éditorial de tribune.
          </p>
          <h2>Comment ça marche ?</h2>
          <ul>
            <li>Collecte d&apos;actualités via GNews API, flux RSS et saisie manuelle.</li>
            <li>Analyse éditoriale par un modèle de langage selon un workflow structuré.</li>
            <li>Publication automatique 5x/jour via Vercel Cron Jobs.</li>
          </ul>
          <h2>Sources</h2>
          <p>
            Chaque article mentionne sa source d&apos;origine avec un lien
            <em> nofollow</em>. Nous ne reproduisons jamais le texte intégral :
            seul un résumé du fait est présenté, suivi de notre analyse.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}