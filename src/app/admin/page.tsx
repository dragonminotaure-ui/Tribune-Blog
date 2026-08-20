"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

interface Result {
  ok: boolean;
  article?: { slug: string; title: string };
  error?: string;
}

export default function AdminPage() {
  const [form, setForm] = useState({
    title: "",
    summary: "",
    source: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
      if (data.ok) {
        setForm({ title: "", summary: "", source: "", url: "" });
      }
    } catch (err: any) {
      setResult({ ok: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleAutoGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate-auto", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ ok: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl text-stone-900 mb-2">
          Génération d&apos;article
        </h1>
        <p className="text-sm text-stone-500 font-sans-ui mb-8">
          Saisissez une actualité brute ou laissez le système collecter
          automatiquement (GNews + RSS).
        </p>

        {/* Génération auto */}
        <section className="mb-8 p-4 bg-stone-50 border border-stone-200 rounded-lg">
          <h2 className="font-display text-xl mb-2">Génération automatique</h2>
          <p className="text-sm text-stone-600 mb-3">
            Collecte une actualité depuis GNews + RSS, puis génère l&apos;article
            via le LLM.
          </p>
          <button
            onClick={handleAutoGenerate}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded font-sans-ui text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Génération en cours…" : "Collecter & générer"}
          </button>
        </section>

        {/* Saisie manuelle */}
        <section className="p-4 bg-white border border-stone-200 rounded-lg">
          <h2 className="font-display text-xl mb-4">Saisie manuelle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-sans-ui font-semibold mb-1">
                Titre de l&apos;actualité *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded font-sans-ui text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Ex : L&apos;UE dévoile son plan IA..."
              />
            </div>
            <div>
              <label className="block text-sm font-sans-ui font-semibold mb-1">
                Résumé *
              </label>
              <textarea
                required
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-stone-300 rounded font-sans-ui text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Résumé concis de l&apos;actualité..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-sans-ui font-semibold mb-1">
                  Source *
                </label>
                <input
                  required
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded font-sans-ui text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex : Le Monde"
                />
              </div>
              <div>
                <label className="block text-sm font-sans-ui font-semibold mb-1">
                  Lien *
                </label>
                <input
                  required
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded font-sans-ui text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-stone-900 text-white rounded font-sans-ui text-sm hover:bg-stone-700 disabled:opacity-50"
            >
              {loading ? "Génération…" : "Générer l&apos;article d&apos;opinion"}
            </button>
          </form>
        </section>

        {/* Résultat */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              result.ok
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            {result.ok ? (
              <p className="font-sans-ui text-sm">
                ✅ Article publié :{" "}
                <a
                  href={`/article/${result.article?.slug}`}
                  className="underline font-semibold"
                >
                  {result.article?.title}
                </a>
              </p>
            ) : (
              <p className="font-sans-ui text-sm">❌ Erreur : {result.error}</p>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}