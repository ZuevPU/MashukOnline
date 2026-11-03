import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getProgramStaff } from "@/lib/admin";
import { removeBuild, removeBuildVersion, saveBuild } from "@/lib/build-storage";
import type { IncomingBuildFile } from "@/lib/build-storage";
import { getDb, schema } from "@/lib/db/client";
import { buildBySlug } from "@/lib/db/queries";
import { publish } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Загрузка и удаление авторской сборки программы: POST /api/admin/build?program=<slug>
 * (multipart: files[] и paths[] — путь каждого файла внутри папки), DELETE — удалить.
 * Права — команда программы или администратор Центра.
 */

async function staffFor(request: Request) {
  const slug = new URL(request.url).searchParams.get("program") ?? "";
  return slug ? getProgramStaff(slug) : null;
}

function changed(slug: string) {
  revalidatePath(`/admin/programs/${slug}`, "layout");
  revalidatePath(`/programs/${slug}`, "layout");
  publish({ type: "program", programSlug: slug });
}

export async function POST(request: Request) {
  const staff = await staffFor(request);
  const db = getDb();
  if (!staff || !db) return NextResponse.json({ ok: false, error: "Нет доступа" }, { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Не удалось прочитать загрузку" }, { status: 400 });
  }

  const files = form.getAll("files");
  const paths = form.getAll("paths").map(String);
  const incoming: IncomingBuildFile[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!(file instanceof File)) continue;
    incoming.push({ path: paths[i] || file.name, bytes: new Uint8Array(await file.arrayBuffer()) });
  }

  const previous = await buildBySlug(staff.programSlug);
  const result = await saveBuild(staff.programId, incoming);
  if (!result.ok) return NextResponse.json(result, { status: 400 });

  // Переключаем версию, только потом убираем прежнюю — участники не видят полусборку
  await db
    .update(schema.programs)
    .set({ buildUploadedAt: new Date(result.version) })
    .where(eq(schema.programs.id, staff.programId));
  if (previous?.version) await removeBuildVersion(staff.programId, previous.version).catch(() => {});

  changed(staff.programSlug);
  return NextResponse.json({ ok: true, files: result.files });
}

export async function DELETE(request: Request) {
  const staff = await staffFor(request);
  const db = getDb();
  if (!staff || !db) return NextResponse.json({ ok: false, error: "Нет доступа" }, { status: 403 });

  await db.update(schema.programs).set({ buildUploadedAt: null }).where(eq(schema.programs.id, staff.programId));
  await removeBuild(staff.programId);
  changed(staff.programSlug);
  return NextResponse.json({ ok: true });
}
