import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { FORM_META, allApplications, isFormId, parseFilters } from "@/lib/forms/admin";
import { currentAdminUser } from "@/lib/forms/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cellValue(value: unknown): string | number {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.join(", ");
  if (value instanceof Date) return value.toLocaleString("ru-RU");
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) return new Date(text).toLocaleString("ru-RU");
  return text;
}

/** Выгрузка заявок формы в Excel (.xlsx) с учётом текущих фильтров. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ form: string }> },
) {
  const { form } = await params;
  if (!isFormId(form)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!(await currentAdminUser())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const sp = Object.fromEntries(url.searchParams.entries());
  const filters = parseFilters(form, sp);
  const rows = await allApplications(form, filters);
  const meta = FORM_META[form];

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Заявки");
  ws.columns = meta.excel.map((col) => ({ header: col.title, key: col.key, width: 26 }));
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF223F9A" } };
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  for (const row of rows) {
    const values = meta.excel.map((col) => cellValue(row[col.key]));
    const added = ws.addRow(values);
    meta.excel.forEach((col, index) => {
      const fileDef = meta.fileColumns.find((f) => f.column === col.key);
      if (fileDef && row[col.key]) {
        const cell = added.getCell(index + 1);
        const link = `${url.origin}/api/admin/forms/${form}/${row.id}/file/${fileDef.kind}`;
        cell.value = { text: `${fileDef.label}`, hyperlink: link };
        cell.font = { color: { argb: "FF0563C1" }, underline: true };
      }
    });
  }
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + meta.excel.length)}1` };

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `mashuk_${form}.xlsx`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
