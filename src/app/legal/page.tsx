import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Mentions légales",
};

export default function LegalPage() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display text-4xl text-stone-900 mb-6">Mentions légales</h1>
        <div className="prose-opinion">
          <h2>Éditeur</h2>
          <p>
            Le blog Tribune est édité à titre indépendant. Contact :
            redaction@tribune.example
          </p>
          <h2>Responsabilité</h2>
          <p>
            Les articles publiés constituent des opinions éditoriales générées
            automatiquement puis publiées. Ils ne prétendent pas à l&apos;objectivité
            journalistique. Les sources d&apos;actualité sont citées et lienées
            avec l&apos;attribut <code>rel=&quot;nofollow&quot;</code>.
          </p>
          <h2>Propriété intellectuelle</h2>
          <p>
            Nous ne reproduisons pas le texte intégral des sources. Chaque
            article contient un résumé du fait d&apos;actualité et une analyse
            originale. Les images de couverture proviennent des flux sources
            et restent la propriété de leurs détenteurs respectifs.
          </p>
          <h2>Données personnelles</h2>
          <p>
            Ce site ne collecte aucune donnée personnelle. Aucun cookie de
            tracking n&apos;est utilisé.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}