import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function SiteHeader() {
  return (
    <header className="border-b-2 border-stone-900 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-tight text-stone-900">
            Tribune
          </span>
          <span className="text-[10px] uppercase tracking-widest text-red-600 font-sans-ui font-semibold">
            Opinions
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-3 text-sm font-sans-ui">
          {CATEGORIES.slice(0, 6).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="text-stone-600 hover:text-red-600 transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}