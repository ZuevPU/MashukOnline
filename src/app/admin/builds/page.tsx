import Link from "next/link";
import { ArrowUpRight, CalendarClock, LayoutTemplate, Settings2 } from "lucide-react";
import { listManagedPrograms, requireAdminArea, type AdminProgram } from "@/lib/admin";

export const metadata = { title: "Сборки" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const dateParts = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Moscow",
});

const timeParts = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Moscow",
});

function formatBuildDate(date: Date) {
  return {
    date: dateParts.format(date).replace(" г.", ""),
    time: timeParts.format(date),
  };
}

/** Сортировка: сначала самые свежие сборки, без сборки — в конце. */
function byBuildDate(a: AdminProgram, b: AdminProgram): number {
  const left = a.buildUploadedAt?.getTime() ?? 0;
  const right = b.buildUploadedAt?.getTime() ?? 0;
  return right - left;
}

export default async function AdminBuildsPage({ searchParams }: PageProps) {
  const user = await requireAdminArea();
  const programs = (await listManagedPrograms(user)).slice().sort(byBuildDate);
  const sp = await searchParams;
  const rawProgram = Array.isArray(sp.program) ? sp.program[0] : sp.program;
  const rawQuery = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const programFilter = rawProgram ?? "";
  const query = (rawQuery ?? "").trim().toLowerCase();

  const withBuild = programs.filter((program) => program.buildUploadedAt);
  const filtered = programs.filter((program) => {
    if (programFilter && program.slug !== programFilter) return false;
    if (!query) return true;
    return `${program.title} ${program.subtitle} ${program.slug}`.toLowerCase().includes(query);
  });
  const builds = filtered.filter((program) => program.buildUploadedAt);
  const withoutBuild = filtered.filter((program) => !program.buildUploadedAt);
  const last = withBuild[0]?.buildUploadedAt;

  const inputClass =
    "min-h-10 rounded-field border border-[var(--line)] bg-white px-3 text-ui text-ink outline-none focus:border-navy";

  return (
    <div className="wrap flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-meta font-semibold tracking-[0.14em] text-ink-soft uppercase">Авторские сборки</p>
          <h1 className="m-0 font-display text-[clamp(28px,3.4vw,40px)] leading-tight font-semibold tracking-[-0.045em] text-navy">
            Сборки программ
          </h1>
          <p className="m-0 mt-2 max-w-170 text-ui leading-relaxed text-ink-soft">
            Даты загрузки — по убыванию: сверху самые свежие сборки. Выберите программу, чтобы оставить только её.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-meta">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-ink-soft shadow-[inset_0_0_0_1px_var(--line)]">
            <LayoutTemplate size={14} />
            Всего сборок: <b className="text-navy">{withBuild.length}</b>
          </span>
          {last && (
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-ink-soft shadow-[inset_0_0_0_1px_var(--line)]">
              <CalendarClock size={14} />
              Последняя: <b className="text-navy">{formatBuildDate(last).date}</b>
            </span>
          )}
        </div>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-panel border border-[var(--line)] bg-white p-4">
        <label className="flex min-w-64 flex-1 flex-col gap-1 text-caption text-ink-soft">
          Программа
          <select className={inputClass} name="program" defaultValue={programFilter}>
            <option value="">Все программы</option>
            {programs.map((program) => (
              <option key={program.slug} value={program.slug}>
                {program.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-caption text-ink-soft">
          Поиск
          <input className={inputClass} type="search" name="q" defaultValue={rawQuery ?? ""} placeholder="Название или адрес программы" />
        </label>
        <button
          type="submit"
          className="min-h-10 rounded-full bg-navy px-5 text-ui font-semibold text-white hover:bg-navy-deep"
        >
          Показать
        </button>
        <Link href="/admin/builds" className="text-meta text-ink-soft no-underline hover:text-navy">
          Сбросить
        </Link>
        <span className="ml-auto text-meta text-ink-soft">
          Показано: {builds.length}
        </span>
      </form>

      {builds.length === 0 ? (
        <div className="rounded-panel border border-dashed border-[var(--line)] bg-white px-6 py-10 text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-paper-warm text-navy">
            <LayoutTemplate size={20} />
          </span>
          <p className="m-0 font-display text-title-sm font-semibold text-navy">Сборок пока нет</p>
          <p className="m-0 mx-auto mt-2 max-w-150 text-ui leading-relaxed text-ink-soft">
            {programFilter || query
              ? "По выбранному фильтру сборок не нашлось. Сбросьте фильтр или загрузите сборку в карточке программы."
              : "Загрузите первую сборку в карточке программы — раздел «Сборка». После загрузки она появится здесь с датой и временем."}
          </p>
          <Link
            href={programFilter ? `/admin/programs/${programFilter}/build` : "/admin/programs"}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-navy px-5 text-ui font-semibold text-white no-underline hover:bg-navy-deep"
          >
            {programFilter ? "Перейти к сборке" : "К программам"}
          </Link>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {builds.map((program) => {
            const stamp = program.buildUploadedAt ? formatBuildDate(program.buildUploadedAt) : null;
            return (
              <li key={program.id}>
                <article className="grid gap-4 rounded-panel border border-[var(--line)] bg-white p-5 md:grid-cols-[130px_minmax(0,1fr)_auto] md:items-center">
                  <div className="flex items-center gap-4 md:block">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-navy text-white">
                      <CalendarClock size={20} />
                    </span>
                    <span className="min-w-0 md:mt-2">
                      <b className="block font-display text-[22px] leading-none tracking-[-0.03em] text-navy">
                        {stamp?.date.split(" ")[0]}
                      </b>
                      <span className="block text-meta text-ink-soft">
                        {stamp?.date.split(" ").slice(1).join(" ")} · {stamp?.time}
                      </span>
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="m-0 text-meta text-ink-soft">{program.subtitle}</p>
                    <h2 className="m-0 font-display text-title-sm font-semibold tracking-[-0.02em] text-navy">
                      {program.title}
                    </h2>
                    <p className="m-0 mt-1 text-meta text-ink-faint">
                      <code>{program.slug}</code> · {program.members} в составе
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/programs/${program.slug}/build/index.html`}
                      target="_blank"
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[var(--line)] px-4 text-meta font-semibold text-navy no-underline hover:bg-sky-tint"
                    >
                      Открыть
                      <ArrowUpRight size={13} />
                    </Link>
                    <Link
                      href={`/admin/programs/${program.slug}/build`}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-navy px-4 text-meta font-semibold text-white no-underline hover:bg-navy-deep"
                    >
                      <Settings2 size={13} />
                      Управлять
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {withoutBuild.length > 0 && (
        <section className="rounded-panel border border-[var(--line)] bg-white p-5">
          <h2 className="m-0 font-display text-title-sm font-semibold text-navy">Без сборки</h2>
          <p className="m-0 mt-1 text-meta text-ink-soft">
            Эти программы ещё не публиковали авторскую HTML-страницу.
          </p>
          <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
            {withoutBuild.map((program) => (
              <li key={program.id}>
                <Link
                  href={`/admin/programs/${program.slug}/build`}
                  className="inline-flex min-h-9 items-center rounded-full bg-paper-warm px-3.5 text-meta font-semibold text-ink-soft no-underline hover:text-navy"
                >
                  {program.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
