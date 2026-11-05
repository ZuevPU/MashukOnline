import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { buildBySlug } from "@/lib/db/queries";
import { readBuildFile } from "@/lib/build-storage";
import { BUILD_SHORT_LINKS } from "@/lib/short-links";

/**
 * Авторская сборка программы — только для участников программы.
 * Без пути открывается index.html: относительные ссылки внутри сборки
 * (style.css, img/…) работают как на обычном сайте.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; path?: string[] }> },
) {
  const { slug, path = [] } = await params;

  if (path.length === 0) {
    return NextResponse.redirect(new URL(`/programs/${slug}/build/index.html`, request.url));
  }

  const [viewer, build] = await Promise.all([getViewer(slug), buildBySlug(slug)]);
  if (!viewer || !build) {
    return NextResponse.redirect(new URL(`/programs/${slug}/enter`, request.url));
  }
  if (build.version === null) return new NextResponse("Сборка не загружена", { status: 404 });

  // Файл по одному пути меняется только с новой версией сборки — версия и есть ETag
  const etag = `"b${build.version}"`;
  const privateCache = "private, no-cache";
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { etag, "cache-control": privateCache } });
  }

  const file = await readBuildFile(build.programId, build.version, path.map(safeDecode).join("/"));
  if (!file) return new NextResponse("Файл не найден", { status: 404 });

  const raw = file.contentType.startsWith("text/html")
    ? withBaseHref(file.bytes, buildBase(slug))
    : file.bytes;
  const body = new Uint8Array(raw);

  return new NextResponse(body, {
    headers: {
      "content-type": file.contentType,
      etag,
      // Закрытый контент: хранится только в браузере участника и сверяется по ETag
      "cache-control": privateCache,
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
      "referrer-policy": "same-origin",
    },
  });
}

/** Сегменты могут прийти закодированными (кириллица в именах файлов). */
function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Базовый адрес сборки для относительных ссылок внутри HTML.
 *
 * Сборку открывают и по короткому адресу (`/muni26`), и по длинному
 * (`/programs/muni26/build/index.html`). Без <base> браузер считает базой
 * каталог текущего адреса: для `/muni26` это корень сайта, и `style.css`
 * уезжает в 404 — страница приходит без стилей и картинок.
 */
function buildBase(slug: string): string {
  const short = BUILD_SHORT_LINKS[slug];
  return short ? `${short}/` : `/programs/${encodeURIComponent(slug)}/build/`;
}

/** Вставляет <base href> в HTML сборки, если автор не задал его сам. */
function withBaseHref(bytes: Uint8Array, base: string): Uint8Array {
  const html = new TextDecoder().decode(bytes);
  if (/<base\s/i.test(html)) return bytes;
  const withBase = html.replace(/<head(\s[^>]*)?>/i, (tag) => `${tag}<base href="${base}">`);
  return new TextEncoder().encode(withBase);
}
