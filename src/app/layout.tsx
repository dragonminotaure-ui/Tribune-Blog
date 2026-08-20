import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tribune — Opinions tranchantes sur l'actualité",
    template: "%s | Tribune",
  },
  description:
    "Blog d'opinion indépendant. Analyses provocantes et regards critiques sur l'actualité tech, économie, société, politique et environnement.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Tribune",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-sans-ui antialiased">{children}</body>
    </html>
  );
}