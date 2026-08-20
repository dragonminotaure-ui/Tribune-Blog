import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  { id: "tech", name: "Technologie", description: "IA, plateformes, innovation, géants du numériques.", color: "#2563eb" },
  { id: "economie", name: "Économie", description: "Marchés, entreprises, pouvoir d'achat, capitalisme.", color: "#059669" },
  { id: "politique", name: "Politique", description: "Gouvernance, démocratie, géopolitique, élections.", color: "#7c3aed" },
  { id: "societe", name: "Société", description: "Vivre ensemble, justice sociale, mœurs, générations.", color: "#db2777" },
  { id: "environnement", name: "Environnement", description: "Climat, biodiversité, transition écologique.", color: "#16a34a" },
  { id: "culture", name: "Culture", description: "Médias, arts, divertissement, créateurs.", color: "#ea580c" },
  { id: "international", name: "International", description: "Conflits, diplomatie, relations mondiales.", color: "#0891b2" },
];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export function getCategory(id: string): Category | undefined {
  return CATEGORY_MAP[id];
}