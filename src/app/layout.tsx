import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

export const metadata: Metadata = {
  title: "LeilãoVision",
  description: "SaaS para análise e acompanhamento de leilões imobiliários.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=20260308" },
      { url: "/brand/lv-logo.png?v=20260308", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=20260308",
    apple: "/brand/lv-logo.png?v=20260308",
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
