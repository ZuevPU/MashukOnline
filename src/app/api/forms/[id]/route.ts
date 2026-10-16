import { NextResponse } from "next/server";
import { SubmitError, submitForm, FORM_CONFIGS } from "@/lib/forms/submit";
import type { FormConfig } from "@/lib/forms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Приём заявок: POST /api/forms/apply | /api/forms/info | /api/forms/muni.
 * Ожидает multipart/form-data с полем payload (JSON) и файлами по именам полей.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!(id in FORM_CONFIGS)) {
    return NextResponse.json({ error: "Форма не найдена" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректная форма" }, { status: 400 });
  }

  try {
    const result = await submitForm(id as FormConfig["id"], formData);
    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    if (error instanceof SubmitError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("form submit failed", error);
    return NextResponse.json({ error: "Не удалось отправить заявку" }, { status: 500 });
  }
}
