import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

export const metadata: Metadata = {
  title: "LeilãoVision",
  description: "SaaS para análise e acompanhamento de leilões imobiliários.",
  icons: {
    icon: "/brand/lv-logo.png",
    shortcut: "/brand/lv-logo.png",
    apple: "/brand/lv-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-lv-bg text-lv-text antialiased">
        <div className="fixed inset-0 -z-10 lv-grid-bg" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
