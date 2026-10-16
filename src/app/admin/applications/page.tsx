import Link from "next/link";
import { requireAdminArea } from "@/lib/admin";
import {
  FORM_META,
  isFormId,
  listApplications,
  listStreams,
  parseFilters,
} from "@/lib/forms/admin";
import type { FormId } from "@/lib/forms/admin";

export const metadata = { title: "Заявки" };
export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  fio: "ФИО",
  email: "E-mail",
  country: "Страна",
  stream: "Поток",
  region: "Регион",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function buildQuery(
  form: FormId,
  sp: Record<string, string | string[] | undefined>,
  overrides: Record<string, string>,
): string {
  const params = new URLSearchParams();
  const keep = ["q", "stream", "dateFrom", "dateTo", "trashed", "sort", "order"];
  for (const key of keep) {
    const value = sp[key];
    const v = Array.isArray(value) ? value[0] : value;
    if (v) params.set(key, v);
  }
  const formValue = overrides.form ?? form;
  params.set("form", formValue);
  for (const [key, value] of Object.entries(overrides)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  return `/admin/applications?${params.toString()}`;
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
  await requireAdminArea();
  const sp = await searchParams;
  const rawForm = Array.isArray(sp.form) ? sp.form[0] : sp.form;
  const form: FormId = rawForm && isFormId(rawForm) ? rawForm : "apply";
  const filters = parseFilters(form, sp);
  const [{ rows, total, page, pages }, streams] = await Promise.all([
    listApplications(form, filters),
    listStreams(form),
  ]);

  const inputClass =
    "min-h-10 rounded-field border border-[var(--line)] bg-white px-3 text-ui text-ink outline-none focus:border-navy";
  const exportParams = new URLSearchParams();
  if (filters.q) exportParams.set("q", filters.q);
  if (filters.stream) exportParams.set("stream", filters.stream);
  if (filters.dateFrom) exportParams.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) exportParams.set("dateTo", filters.dateTo);
  if (filters.trashed) exportParams.set("trashed", "1");

  return (
    <div className="wrap flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 font-display text-[clamp(28px,3.4vw,40px)] leading-tight font-semibold tracking-[-0.045em] text-navy">
          Заявки
        </h1>
        <div className="flex flex-wrap gap-2 text-ui">
          <a
            className="inline-flex min-h-10 items-center rounded-full border border-[var(--line)] px-4 font-semibold text-navy no-underline hover:bg-sky-tint"
            href={`/api/admin/forms/${form}/export?${exportParams.toString()}`}
          >
            Excel
          </a>
          <a
            className="inline-flex min-h-10 items-center rounded-full border border-[var(--line)] px-4 font-semibold text-navy no-underline hover:bg-sky-tint"
            href={`/api/admin/forms/${form}/consents.zip?${exportParams.toString()}`}
          >
            Согласия (ZIP)
          </a>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {(["apply", "info", "muni"] as FormId[]).map((id) => (
          <Link
            key={id}
            href={buildQuery(form, sp, { form: id, page: "" })}
            className={`rounded-full px-4 py-2 text-ui font-semibold no-underline ${
              id === form ? "bg-navy text-white" : "bg-white text-ink-soft hover:text-navy"
            }`}
          >
            {FORM_META[id].short}
          </Link>
        ))}
      </nav>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-panel border border-[var(--line)] bg-white p-4">
        <input type="hidden" name="form" value={form} />
        <label className="flex flex-col gap-1 text-caption text-ink-soft">
          Поиск
          <input className={inputClass} type="search" name="q" defaultValue={filters.q} placeholder="ФИО, e-mail…" />
        </label>
        <label className="flex flex-col gap-1 text-caption text-ink-soft">
          Поток
          <select className={inputClass} name="stream" defaultValue={filters.stream}>
            <option value="">Все</option>
            {streams.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-caption text-ink-soft">
          С даты
          <input className={inputClass} type="date" name="dateFrom" defaultValue={filters.dateFrom} />
        </label>
        <label className="flex flex-col gap-1 text-caption text-ink-soft">
          По дату
          <input className={inputClass} type="date" name="dateTo" defaultValue={filters.dateTo} />
        </label>
        <label className="flex items-center gap-2 text-meta text-ink-soft">
          <input type="checkbox" name="trashed" value="1" defaultChecked={filters.trashed} />
          Корзина
        </label>
        <button
          type="submit"
          className="min-h-10 rounded-full bg-navy px-5 text-ui font-semibold text-white hover:bg-navy-deep"
        >
          Показать
        </button>
        <Link href={`/admin/applications?form=${form}`} className="text-meta text-ink-soft no-underline hover:text-navy">
          Сбросить
        </Link>
        <span className="ml-auto text-meta text-ink-soft">Всего: {total}</span>
      </form>

      {rows.length === 0 ? (
        <p className="m-0 rounded-soft border border-[var(--line)] bg-white px-6 py-5 text-ui text-ink-soft">
          Заявок нет.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-panel border border-[var(--line)] bg-white">
          <table className="w-full border-collapse text-ui">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-caption uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3">Дата</th>
                {rows[0].columns.map((c) => (
                  <th key={c.key} className="px-4 py-3">
                    {LABELS[c.key] ?? c.key}
                  </th>
                ))}
                <th className="px-4 py-3">Файлы</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--line-soft)] last:border-0 hover:bg-sky-tint/40">
                  <td className="px-4 py-3 text-ink-soft">{new Date(row.created_at).toLocaleDateString("ru-RU")}</td>
                  {row.columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-ink">
                      <Link href={`/admin/applications/${form}/${row.id}`} className="text-navy no-underline hover:underline">
                        {c.value || "—"}
                      </Link>
                    </td>
                  ))}
                  <td className="px-4 py-3">{row.hasFiles ? "есть" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 ? (
        <nav className="flex flex-wrap items-center gap-2 text-ui">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildQuery(form, sp, { page: String(p) })}
              className={`rounded-full px-3 py-1.5 no-underline ${
                p === page ? "bg-navy text-white" : "bg-white text-ink-soft hover:text-navy"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
