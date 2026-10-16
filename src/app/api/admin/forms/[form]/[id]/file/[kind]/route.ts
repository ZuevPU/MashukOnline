import { NextResponse } from "next/server";
import { contentTypeForExt, readFormFile } from "@/lib/forms/files";
import { getFileInfo, isFormId } from "@/lib/forms/admin";
import { currentAdminUser } from "@/lib/forms/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asciiName(name: string): string {
  return name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
}

/** Скачивание файла заявки: только для вошедшего администратора. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ form: string; id: string; kind: string }> },
) {
  const { form, id, kind } = await params;
  if (!isFormId(form)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!(await currentAdminUser())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const numericId = Number(id);
  const info = await getFileInfo(form, numericId, kind);
  if (!info) return NextResponse.json({ error: "file not found" }, { status: 404 });

  const bytes = await readFormFile(info.path);
  if (!bytes) return NextResponse.json({ error: "file not found" }, { status: 404 });

  const dot = info.path.lastIndexOf(".");
  const ext = dot >= 0 ? info.path.slice(dot).toLowerCase() : "";
  const base = info.fio.replace(/[^\w\sА-Яа-яЁё-]+/g, "").trim().replace(/\s+/g, "_").slice(0, 40) || `id_${numericId}`;
  const suffix = kind === "portfolio" ? "_portfolio" : kind === "passport" ? "_passport" : "";
  const filename = `${base}${suffix}${ext || ".bin"}`;

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "content-type": contentTypeForExt(ext),
      "content-disposition": `attachment; filename="${asciiName(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
