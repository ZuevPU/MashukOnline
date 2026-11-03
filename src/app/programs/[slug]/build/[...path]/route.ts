import { NextResponse } from "next/server";
import { readBuildFile } from "@/lib/build-storage";
import { buildBySlug } from "@/lib/db/queries";
import { canViewBuild } from "@/lib/program-gate";
import { buildUrl } from "@/lib/short-links";

/** Сегменты могут прийти и закодированными, и уже раскодированными. */
function safeDecode(part: string): string {
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
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

  return new NextResponse(Buffer.from(file.bytes), {
    headers: {
      "Content-Type": file.contentType,
      // Закрытое содержимое: только в браузере участника, страницы — без кэша
      "Cache-Control": isPage ? "private, no-store" : "private, max-age=3600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
