import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

export const metadata: Metadata = {
  title: "LeilãoVision",
  description: "SaaS para análise e acompanhamento de leilões imobiliários.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-lv-bg text-lv-text antialiased">
        <div className="fixed inset-0 -z-10 lv-grid-bg opacity-30" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
