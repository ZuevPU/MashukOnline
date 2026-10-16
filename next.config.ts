import type { NextConfig } from "next";

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
