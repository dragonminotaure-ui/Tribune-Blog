import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-stone-900 mt-16 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-3 text-sm font-sans-ui text-stone-600">
        <div>
          <p className="font-display text-xl text-stone-900 mb-1">Tribune</p>
          <p className="leading-relaxed">
            Blog d&apos;opinion indépendant. Analyses tranchantes sur
            l&apos;actualité, 5 fois par jour.
          </p>
        </div>
        <div>
          <p className="font-semibold text-stone-800 mb-2">Pages</p>
          <ul className="space-y-1">
            <li><Link href="/" className="hover:text-red-600">Accueil</Link></li>
            <li><Link href="/about" className="hover:text-red-600">À propos</Link></li>
            <li><Link href="/legal" className="hover:text-red-600">Mentions légales</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-stone-800 mb-2">Catégories</p>
          <ul className="space-y-1">
            <li><Link href="/category/tech" className="hover:text-red-600">Technologie</Link></li>
            <li><Link href="/category/economie" className="hover:text-red-600">Économie</Link></li>
            <li><Link href="/category/politique" className="hover:text-red-600">Politique</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-200 py-3 text-center text-xs text-stone-500 font-sans-ui">
        © {new Date().getFullYear()} Tribune — Tous droits réservés.
      </div>
    </footer>
  );
}