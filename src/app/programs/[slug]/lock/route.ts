import { NextResponse } from "next/server";
import { gateCookieName } from "@/lib/program-gate";
import { buildUrl } from "@/lib/short-links";

export const dynamic = "force-dynamic";

/** «Выйти» из сборки: браузер забывает пароль программы (кнопка в авторской странице). */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: `/programs/${slug}/unlock?next=${encodeURIComponent(buildUrl(slug))}` },
  });
  response.cookies.delete(gateCookieName(slug));
  return response;
}
