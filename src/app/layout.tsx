import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { geologica, notoSerif } from "@/lib/fonts";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
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

export default function RootLayout({ children }: { children: ReactNode }) {
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
        <main id="top" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        {process.env.NODE_ENV === "production" ? (
          <>
            <Script id="yandex-metrika" strategy="afterInteractive">
              {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(104001534,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
            </Script>
            <noscript>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://mc.yandex.ru/watch/104001534"
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        ) : null}
      </body>
    </html>
  );
}
