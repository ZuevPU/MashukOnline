import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { listManagedPrograms } from "@/lib/admin";
import { FORM_META, formCounts } from "@/lib/forms/admin";
import { accessibleForms } from "@/lib/forms/access";
import type { FormId } from "@/lib/forms/admin";
import { countOpenSupportRequests } from "@/lib/support";

export const metadata = { title: "Обзор" };

/** Публичные страницы портала. */
const PAGES: { href: string; title: string; note: string }[] = [
  { href: "/", title: "Главная «Цифровой Машук»", note: "Витрина, преимущества, материалы, форма поддержки" },
  { href: "/courses", title: "Программы обучения", note: "Карточки онлайн-курсов со ссылками на LMS" },
  { href: "/bestpractice", title: "База лучших наставнических практик", note: "100 практик — победителей конкурса «Наставничество»" },
  { href: "/events/seminar", title: "Семинар «Образование на высоте»", note: "Лендинг мероприятия" },
  { href: "/events/media", title: "Медиамероприятие", note: "Лендинг «Медиакомпетенции в сфере межнациональных отношений»" },
  { href: "/results/education-height", title: "Итоги «Образование на высоте»", note: "Результаты программы" },
  { href: "/metod", title: "Методические материалы", note: "«ПРО Образование», видеоинструкция" },
  { href: "/regional-summit", title: "Совещание региональных министров", note: "Лендинг, 14–16 апреля 2026" },
  { href: "/aihub", title: "База знаний для работы с ИИ", note: "Раздел готовится" },
  { href: "/poll", title: "Живые опросы", note: "Вход в опрос по коду" },
  { href: "/support", title: "Техническая поддержка", note: "Форма обращения" },
  { href: "/privacy", title: "Политика конфиденциальности", note: "Обработка персональных данных" },
];

/** Формы заявок: публичный адрес и раздел в админке. */
const FORMS: { id: FormId; href: string }[] = [
  { id: "apply", href: "/apply" },
  { id: "info", href: "/info" },
  { id: "muni", href: "/muni" },
  { id: "media", href: "/events/media/apply" },
  { id: "cultistud", href: "/cultistud" },
];

const EXTERNAL: { href: string; title: string; note: string }[] = [
  { href: "https://lms.mashuk.online/", title: "LMS — онлайн-курсы", note: "lms.mashuk.online" },
  { href: "https://practices.edu.dobro.ru/", title: "Практики на ДОБРО.РФ", note: "practices.edu.dobro.ru" },
];

function formatDate(date: Date | null): string {
  if (!date) return "заявок нет";
  return `последняя ${date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}`;
}

export default async function AdminOverview() {
  const user = (await getSessionUser())!;
  // Команда программы видит только свои программы
  if (!user.isCenterAdmin) {
    const programs = await listManagedPrograms(user);
    if (programs.length > 0) redirect("/admin/programs");
    const forms = await accessibleForms(user);
    redirect(forms.some((key) => key !== "support") ? "/admin/applications" : "/admin/support");
  }

  const [programs, support, ...counts] = await Promise.all([
    listManagedPrograms(user),
    countOpenSupportRequests(),
    ...FORMS.map((form) => formCounts(form.id)),
  ]);

  return (
    <div className="wrap flex flex-col gap-10">
      <h1 className="m-0 font-display text-[clamp(28px,3.4vw,40px)] leading-tight font-semibold tracking-[-0.045em] text-navy">
        Обзор портала
      </h1>

      <Block title="Формы и обращения">
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
          {FORMS.map((form, index) => (
            <li key={form.id} className="flex flex-col gap-3 rounded-panel border border-[var(--line)] bg-white p-5">
              <span className="font-display text-lead font-semibold tracking-[-0.02em] text-navy">
                {FORM_META[form.id].label}
              </span>
              <span className="text-meta text-ink-soft">
                Всего: <b className="text-ink">{counts[index].total}</b> · за неделю:{" "}
                <b className="text-ink">{counts[index].week}</b> · {formatDate(counts[index].last)}
              </span>
              <span className="mt-auto flex flex-wrap gap-2 text-meta">
                <Link href={`/admin/applications?form=${form.id}`} className={PRIMARY}>
                  Заявки
                </Link>
                <a href={form.href} target="_blank" rel="noopener" className={SECONDARY}>
                  Форма <ExternalLink size={13} />
                </a>
              </span>
            </li>
          ))}
          <li className="flex flex-col gap-3 rounded-panel border border-[var(--line)] bg-white p-5">
            <span className="font-display text-lead font-semibold tracking-[-0.02em] text-navy">Техническая поддержка</span>
            <span className="text-meta text-ink-soft">
              Новых обращений: <b className="text-ink">{support}</b>
            </span>
            <span className="mt-auto flex flex-wrap gap-2 text-meta">
              <Link href="/admin/support" className={PRIMARY}>
                Обращения
              </Link>
              <a href="/support" target="_blank" rel="noopener" className={SECONDARY}>
                Форма <ExternalLink size={13} />
              </a>
            </span>
          </li>
        </ul>
      </Block>

      <Block title="Программы">
        <Link
          href="/admin/programs"
          className="flex items-center justify-between gap-4 rounded-panel border border-[var(--line)] bg-white p-5 no-underline hover:border-navy/30"
        >
          <span className="text-ui text-ink">
            Программ: <b>{programs.length}</b> — расписание, материалы, участники и рабочие пространства
          </span>
          <ArrowUpRight size={18} className="text-navy" />
        </Link>
      </Block>

      <Block title="Страницы сайта">
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
          {PAGES.map((page) => (
            <li key={page.href}>
              <a
                href={page.href}
                target="_blank"
                rel="noopener"
                className="group flex h-full flex-col gap-1 rounded-panel border border-[var(--line)] bg-white p-5 no-underline hover:border-navy/30"
              >
                <span className="flex items-center justify-between gap-3 font-semibold text-navy group-hover:underline">
                  {page.title}
                  <ExternalLink size={14} className="shrink-0" />
                </span>
                <span className="text-meta text-ink-soft">{page.note}</span>
                <span className="text-caption text-ink-faint">{page.href}</span>
              </a>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Внешние сервисы">
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
          {EXTERNAL.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col gap-1 rounded-panel border border-[var(--line)] bg-white p-5 no-underline hover:border-navy/30"
              >
                <span className="flex items-center justify-between gap-3 font-semibold text-navy group-hover:underline">
                  {item.title}
                  <ExternalLink size={14} className="shrink-0" />
                </span>
                <span className="text-caption text-ink-faint">{item.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </Block>
    </div>
  );
}

const PRIMARY =
  "inline-flex min-h-9 items-center rounded-full bg-navy px-4 font-semibold text-white no-underline hover:bg-navy-deep";
const SECONDARY =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full bg-sky-tint px-4 font-semibold text-navy no-underline hover:bg-sky-pale";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="m-0 font-display text-title-sm font-semibold tracking-[-0.03em] text-ink">{title}</h2>
      {children}
    </section>
  );
}
