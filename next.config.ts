import type { NextConfig } from "next";
import { BUILD_SHORT_LINKS } from "./src/lib/short-links";

const nextConfig: NextConfig = {
  // Сборка для Docker: рантайм берётся из .next/standalone (нужен только Node)
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // Явно фиксируем корень проекта: иначе Turbopack ищет его выше по дереву
  // и подхватывает служебные файлы из домашнего каталога.
  turbopack: {
    root: process.cwd(),
  },
  // Локальная разработка открывается и по 127.0.0.1, и по localhost
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Индикатор разработки перекрывает содержимое на скриншотах
  devIndicators: false,
  // Пакеты, которые нельзя бандлить: работают с ФС и нативными частями.
  serverExternalPackages: ["pdf-lib", "@pdf-lib/fontkit", "exceljs", "archiver", "postgres"],
  // В standalone-сборку нужно включить файлы, которые читаются из ФС в рантайме:
  // шаблоны согласий и шрифт для заполнения PDF.
  outputFileTracingIncludes: {
    "/api/forms/consent": [
      "./src/lib/forms/consent/**/*",
      "./src/assets/fonts/noto-serif/**/*",
    ],
  },
  // Адреса старого сайта на Tilda: ссылки на них разосланы и опубликованы, поэтому
  // открываем по ним страницы портала, не меняя адрес в строке браузера.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/privacypolicy", destination: "/privacy" },
        { source: "/interethnic", destination: "/apply" },
        { source: "/educationatitsbest", destination: "/info" },
        { source: "/educationatpeak", destination: "/events/seminar" },
        { source: "/municipalharmony", destination: "/muni" },
        { source: "/cultistudform", destination: "/cultistud" },
        { source: "/edu", destination: "/" },
        // Короткие адреса авторских сборок программ (mashuk.online/rnd26)
        ...Object.entries(BUILD_SHORT_LINKS).flatMap(([slug, short]) => [
          { source: short, destination: `/programs/${slug}/build/index.html` },
          { source: `${short}/:path+`, destination: `/programs/${slug}/build/:path+` },
        ]),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  // Анкета медиасеминара живёт прямо на лендинге /mediacompetencies.
  // Старые адреса формы и страницы события ведут туда же — к блоку заявки.
  async redirects() {
    return [
      { source: "/mediacompetencies/apply", destination: "/mediacompetencies#zayavka", permanent: true },
      { source: "/events/media/apply", destination: "/mediacompetencies#zayavka", permanent: true },
      { source: "/events/media", destination: "/mediacompetencies", permanent: true },
    ];
  },
  // Долгий кэш публичных медиафайлов (обложки курсов, бренд).
  async headers() {
    const week = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];
    return [
      { source: "/courses/:path*", headers: week },
      { source: "/brand/:path*", headers: week },
    ];
  },
};

export default nextConfig;
