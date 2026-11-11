import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { geologica, notoSerif } from "@/lib/fonts";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CookieConsent } from "@/components/site/CookieConsent";
import { BRAND } from "@/lib/brand";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Программы Центра знаний «Машук»",
    template: "%s — Центр знаний «Машук»",
  },
  description:
    "Цифровая экосистема сопровождения слушателей АНО «Центр знаний «Машук»: программы, материалы, общение участников и живая обратная связь.",
  applicationName: "Центр знаний «Машук»",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Машук", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: "Центр знаний «Машук»",
    title: "Программы Центра знаний «Машук»",
    description: "Программы, материалы, общение участников и живая обратная связь — в одной среде.",
  },
};

export const viewport: Viewport = {
  themeColor: BRAND.navy,
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Выбор по cookie известен на сервере: полоса согласия не появляется
  // и не исчезает после гидратации, вёрстка не прыгает.
  const stored = (await cookies()).get("mashuk-cookie-consent")?.value;
  const consent = stored === "accepted" || stored === "declined" ? stored : null;

  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      // Расширения браузера (например, LanguageTool) дописывают свои атрибуты
      // в <html> уже после отрисовки — для этого элемента предупреждение гасим.
      suppressHydrationWarning
      className={`${geologica.variable} ${notoSerif.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <CookieConsent initial={consent} />
        <main id="top" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
