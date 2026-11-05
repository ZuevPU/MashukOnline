import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { buildBySlug } from "@/lib/db/queries";
import { readBuildFile } from "@/lib/build-storage";
import { BUILD_SHORT_LINKS } from "@/lib/short-links";

/**
 * РђРІС‚РѕСЂСЃРєР°СЏ СЃР±РѕСЂРєР° РїСЂРѕРіСЂР°РјРјС‹ вЂ” С‚РѕР»СЊРєРѕ РґР»СЏ СѓС‡Р°СЃС‚РЅРёРєРѕРІ РїСЂРѕРіСЂР°РјРјС‹.
 * Р‘РµР· РїСѓС‚Рё РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ index.html: РѕС‚РЅРѕСЃРёС‚РµР»СЊРЅС‹Рµ СЃСЃС‹Р»РєРё РІРЅСѓС‚СЂРё СЃР±РѕСЂРєРё
 * (style.css, img/вЂ¦) СЂР°Р±РѕС‚Р°СЋС‚ РєР°Рє РЅР° РѕР±С‹С‡РЅРѕРј СЃР°Р№С‚Рµ.
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
  if (build.version === null) return new NextResponse("РЎР±РѕСЂРєР° РЅРµ Р·Р°РіСЂСѓР¶РµРЅР°", { status: 404 });

  // Р¤Р°Р№Р» РїРѕ РѕРґРЅРѕРјСѓ РїСѓС‚Рё РјРµРЅСЏРµС‚СЃСЏ С‚РѕР»СЊРєРѕ СЃ РЅРѕРІРѕР№ РІРµСЂСЃРёРµР№ СЃР±РѕСЂРєРё вЂ” РІРµСЂСЃРёСЏ Рё РµСЃС‚СЊ ETag
  const etag = `"b${build.version}"`;
  const privateCache = "private, no-cache";
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { etag, "cache-control": privateCache } });
  }

  const file = await readBuildFile(build.programId, build.version, path.map(safeDecode).join("/"));
  if (!file) return new NextResponse("Р¤Р°Р№Р» РЅРµ РЅР°Р№РґРµРЅ", { status: 404 });

  const raw = file.contentType.startsWith("text/html")
    ? withBaseHref(file.bytes, buildBase(slug))
    : file.bytes;
  const body = new Uint8Array(raw);

  return new NextResponse(body, {
    headers: {
      "content-type": file.contentType,
      etag,
      // Р—Р°РєСЂС‹С‚С‹Р№ РєРѕРЅС‚РµРЅС‚: С…СЂР°РЅРёС‚СЃСЏ С‚РѕР»СЊРєРѕ РІ Р±СЂР°СѓР·РµСЂРµ СѓС‡Р°СЃС‚РЅРёРєР° Рё СЃРІРµСЂСЏРµС‚СЃСЏ РїРѕ ETag
      "cache-control": privateCache,
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
      "referrer-policy": "same-origin",
    },
  });
}

/** РЎРµРіРјРµРЅС‚С‹ РјРѕРіСѓС‚ РїСЂРёР№С‚Рё Р·Р°РєРѕРґРёСЂРѕРІР°РЅРЅС‹РјРё (РєРёСЂРёР»Р»РёС†Р° РІ РёРјРµРЅР°С… С„Р°Р№Р»РѕРІ). */
function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Р‘Р°Р·РѕРІС‹Р№ Р°РґСЂРµСЃ СЃР±РѕСЂРєРё РґР»СЏ РѕС‚РЅРѕСЃРёС‚РµР»СЊРЅС‹С… СЃСЃС‹Р»РѕРє РІРЅСѓС‚СЂРё HTML.
 *
 * РЎР±РѕСЂРєСѓ РѕС‚РєСЂС‹РІР°СЋС‚ Рё РїРѕ РєРѕСЂРѕС‚РєРѕРјСѓ Р°РґСЂРµСЃСѓ (`/muni26`), Рё РїРѕ РґР»РёРЅРЅРѕРјСѓ
 * (`/programs/muni26/build/index.html`). Р‘РµР· <base> Р±СЂР°СѓР·РµСЂ СЃС‡РёС‚Р°РµС‚ Р±Р°Р·РѕР№
 * РєР°С‚Р°Р»РѕРі С‚РµРєСѓС‰РµРіРѕ Р°РґСЂРµСЃР°: РґР»СЏ `/muni26` СЌС‚Рѕ РєРѕСЂРµРЅСЊ СЃР°Р№С‚Р°, Рё `style.css`
 * СѓРµР·Р¶Р°РµС‚ РІ 404 вЂ” СЃС‚СЂР°РЅРёС†Р° РїСЂРёС…РѕРґРёС‚ Р±РµР· СЃС‚РёР»РµР№ Рё РєР°СЂС‚РёРЅРѕРє.
 */
function buildBase(slug: string): string {
  const short = BUILD_SHORT_LINKS[slug];
  return short ? `${short}/` : `/programs/${encodeURIComponent(slug)}/build/`;
}

/** Р’СЃС‚Р°РІР»СЏРµС‚ <base href> РІ HTML СЃР±РѕСЂРєРё, РµСЃР»Рё Р°РІС‚РѕСЂ РЅРµ Р·Р°РґР°Р» РµРіРѕ СЃР°Рј. */
function withBaseHref(bytes: Uint8Array, base: string): Uint8Array {
  const html = new TextDecoder().decode(bytes);
  if (/<base\s/i.test(html)) return bytes;
  const withBase = html.replace(/<head(\s[^>]*)?>/i, (tag) => `${tag}<base href="${base}">`);
  return new TextEncoder().encode(withBase);
}
