import { NextResponse } from "next/server";
import { readBuildFile } from "@/lib/build-storage";
import { buildBySlug } from "@/lib/db/queries";
import { canViewBuild } from "@/lib/program-gate";
import { BUILD_SHORT_LINKS, buildUrl } from "@/lib/short-links";

/** Сегменты могут прийти и закодированными, и уже раскодированными. */
function safeDecode(part: string): string {
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

/**
 * База для относительных ссылок внутри HTML сборки.
 *
 * Сборку открывают и по короткому адресу (`/muni26`), и по длинному
 * (`/programs/muni26/build/index.html`). Без <base> браузер берёт каталог
 * текущего адреса: для `/muni26` это корень сайта, и `style.css` уезжает в 404 —
 * страница приходит без стилей и картинок.
 */
function buildBase(slug: string): string {
  const short = BUILD_SHORT_LINKS[slug];
  return short ? `${short}/` : `/programs/${encodeURIComponent(slug)}/build/`;
}

/** Вставляет <base href> в HTML, если автор сборки не задал его сам. */
function withBaseHref(bytes: Uint8Array, base: string): Uint8Array {
  const html = new TextDecoder().decode(bytes);
  if (/<base\s/i.test(html)) return bytes;
  return new TextEncoder().encode(html.replace(/<head(\s[^>]*)?>/i, (tag) => `${tag}<base href="${base}">`));
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Файлы авторской сборки: /programs/<slug>/build/<путь>.
 * Без доступа страница сборки уводит на ввод пароля программы, остальные файлы — 403.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; path: string[] }> },
) {
  const { slug, path } = await params;
  const relative = path.map(safeDecode).join("/") || "index.html";

  const build = await buildBySlug(slug);
  if (!build?.version) return new NextResponse("Not found", { status: 404 });

  const isPage = /\.html?$/i.test(relative);
  if (!(await canViewBuild(slug))) {
    if (!isPage) return new NextResponse("Forbidden", { status: 403 });
    const next = buildUrl(slug, relative);
    return new NextResponse(null, {
      status: 303,
      headers: { Location: `/programs/${slug}/unlock?next=${encodeURIComponent(next)}`, "Cache-Control": "no-store" },
    });
  }

  const file = await readBuildFile(build.programId, build.version, relative);
  if (!file) return new NextResponse("Not found", { status: 404 });

  const raw = file.contentType.startsWith("text/html") ? withBaseHref(file.bytes, buildBase(slug)) : file.bytes;
  const body = new Uint8Array(raw);

  return new NextResponse(body, {
    headers: {
      "Content-Type": file.contentType,
      // Закрытое содержимое: только в браузере участника, страницы — без кэша
      "Cache-Control": isPage ? "private, no-store" : "private, max-age=3600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
