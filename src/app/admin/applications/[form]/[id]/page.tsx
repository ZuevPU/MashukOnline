import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminArea } from "@/lib/admin";
import { FORM_META, getApplication, isFormId } from "@/lib/forms/admin";
import { restoreApplicationAction, trashApplicationAction } from "@/lib/forms/admin-actions";

export const metadata = { title: "Заявка" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ form: string; id: string }>;
}

function display(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "да" : "нет";
  if (value instanceof Date) return value.toLocaleString("ru-RU");
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) return new Date(text).toLocaleString("ru-RU");
  return text;
}

export default async function ApplicationDetail({ params }: PageProps) {
  await requireAdminArea();
  const { form, id } = await params;
  if (!isFormId(form)) notFound();
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) notFound();

  const row = await getApplication(form, numericId);
  if (!row) notFound();
  const meta = FORM_META[form];

  return (
    <div className="wrap flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href={`/admin/applications?form=${form}`} className="text-meta text-ink-soft no-underline hover:text-navy">
            ← Все заявки
          </Link>
          <h1 className="m-0 font-display text-[clamp(24px,3vw,34px)] leading-tight font-semibold tracking-[-0.04em] text-navy">
            {meta.label} · заявка №{numericId}
          </h1>
        </div>
        <form action={row.deletedAt ? restoreApplicationAction : trashApplicationAction}>
          <input type="hidden" name="form" value={form} />
          <input type="hidden" name="id" value={numericId} />
          <button
            type="submit"
            className={`min-h-10 rounded-full px-5 text-ui font-semibold ${
              row.deletedAt
                ? "bg-[#0b4d4d] text-white hover:opacity-90"
                : "border border-danger/40 text-danger hover:bg-danger/10"
            }`}
          >
            {row.deletedAt ? "Восстановить" : "В корзину"}
          </button>
        </form>
      </div>

      {meta.fileColumns.some((file) => row[`has_${file.kind}`]) ? (
        <div className="flex flex-wrap gap-3 rounded-panel border border-[var(--line)] bg-white p-4">
          {meta.fileColumns.map((file) =>
            row[`has_${file.kind}`] ? (
              <a
                key={file.kind}
                href={`/api/admin/forms/${form}/${numericId}/file/${file.kind}`}
                className="inline-flex min-h-10 items-center rounded-full bg-navy px-4 text-ui font-semibold text-white no-underline hover:bg-navy-deep"
              >
                {file.label}
              </a>
            ) : null,
          )}
        </div>
      ) : null}

      <dl className="grid gap-px overflow-hidden rounded-panel border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
        {meta.excel.map((col) => (
          <div key={col.key} className="flex flex-col gap-1 bg-white px-4 py-3">
            <dt className="text-caption uppercase tracking-wide text-ink-soft">{col.title}</dt>
            <dd className="m-0 whitespace-pre-wrap text-ui text-ink">{display(row[col.key])}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
