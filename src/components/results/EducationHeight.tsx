"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { MountainLine } from "@/components/brand/MountainLine";

const ACCESS_KEY = "education-height-access";
const PASSWORD = "0210";
const DRIVE_FOLDER = "https://drive.google.com/drive/folders/1p8oQ0kEnTd0SHErsPdJ60nBHZkMnSjaV";

const RESULTS = [
  { num: "01", title: "Рамка будущего", text: "Понимание технологических и медиавызовов, которые уже меняют образование." },
  { num: "02", title: "Ценностная опора", text: "Способы переводить разговор о ценностях в совместный опыт и конкретные дела." },
  { num: "03", title: "Инструменты", text: "Механики проектирования образовательных событий, рефлексии и медиаграмотности." },
  { num: "04", title: "Проектные решения", text: "Командные практики с понятной задачей, действием, результатом и способом оценки." },
];

const PURPOSE = [
  { title: "Цель", text: "Создать среду профессионального обмена, в которой участники сопоставляют мировые изменения со своей практикой и проектируют решения, применимые в школе." },
  { title: "Задачи", text: "Осмыслить влияние ИИ и медиасреды, собрать работающие подходы к воспитательной работе, освоить событийное проектирование и перевести вызовы в практические решения." },
  { title: "Формат", text: "Визионерские лекции, экспертные панели, мастерские, групповая проектная работа и рефлексия — с постоянным переходом от идеи к действию." },
];

const DAYS = [
  {
    day: 1,
    label: "День 1",
    side: "29 сентября\nЗнакомство и рамка",
    slots: [
      { time: "17:30", title: "Открытие и установка на программу", text: "Профессиональный запрос и логика включения в международное сообщество.", tag: "старт" },
      { time: "19:30", title: "«Вызовы будущего vs Образование»", text: "Алексей Якель", tag: "лекция" },
      { time: "21:00", title: "Квиз", text: "Интерактивный игровой блок в формате школьных уроков.", tag: "игра" },
    ],
  },
  {
    day: 2,
    label: "День 2",
    side: "30 сентября\nСреда и ценности",
    slots: [
      { time: "15:10", title: "«Экосистема работы с молодёжью»", text: "Роман Богатырёв, Кристина Зорина, Алёна Девятайкина", tag: "панель" },
      { time: "17:00", title: "«Код будущего: ценностное воспитание как опора в эпоху перемен»", text: "Борис Мурванидзе", tag: "лекция" },
    ],
  },
  {
    day: 3,
    label: "День 3",
    side: "1 октября\nОт замысла к практике",
    slots: [
      { time: "09:45", title: "«Организация воспитательной работы в школах»", text: "Анна Сергутина, Константин Соловьёв, Наталия Никоноркина", tag: "панель" },
      { time: "13:00", title: "«Искусство педагогического замысла: от смысла к событию»", text: "Анна Завалина", tag: "мастерская" },
      { time: "15:15", title: "«От вызовов к практикам»", text: "Групповая работа и завершение проектов.", tag: "проект" },
      { time: "17:30", title: "Проектная работа", text: "Итоговые решения команд.", tag: "итог" },
    ],
  },
  {
    day: 4,
    label: "День 4",
    side: "2 октября\nЗавершение",
    slots: [
      { time: "05:15", title: "Восхождение на Машук", text: "Рассветный пикник и общий маршрут.", tag: "опыт" },
      { time: "10:00", title: "Завершение программы", text: "«Открытка другу» и рефлексия по итогам программы.", tag: "рефлексия" },
      { time: "11:30", title: "Экскурсия по Пятигорску", text: "Финальная точка общего маршрута.", tag: "экскурсия" },
    ],
  },
];

const MATERIALS = [
  { day: "День 1 · старт", num: "01", title: "Открытие и установка на программу", text: "Профессиональный запрос участника, логика включения и международное профессиональное взаимодействие.", url: "https://drive.google.com/drive/folders/10itpd6dzQ1w8-vK4VyZpyFwDHb5ki4Pe", link: "Материалы блока" },
  { day: "День 1 · лекция", num: "02", title: "Вызовы будущего vs Образование", text: "ИИ, когнитивный долг, критическое мышление и механики значимого образовательного опыта.", speaker: "Алексей Якель", url: "https://drive.google.com/drive/folders/1Iv8mZRUJEG5uJL7hezXtPKXScQYY9PU3", link: "Конспект и презентация" },
  { day: "День 1 · игра", num: "03", title: "Квиз", text: "Интерактивный блок: география, культурология, русский язык и музыка.", url: "https://drive.google.com/drive/folders/1o64fXYM3H1Z979ulluG6EMm7XL5QjpMr", link: "Презентация квиза" },
  { day: "День 2 · панель", num: "04", title: "Экосистема работы с молодёжью", text: "Как федеральные, региональные и локальные возможности складываются в единый маршрут молодого человека.", speaker: "Роман Богатырёв · Кристина Зорина · Алёна Девятайкина", url: "https://drive.google.com/drive/folders/1bga2GfIegYZ-B9L2jTO2rABy9g-azS_n", link: "Все материалы панели" },
  { day: "День 2 · лекция", num: "05", title: "Код будущего", text: "Ценностное воспитание через историческую память, традиции, семью, ответственность и совместное действие.", speaker: "Борис Мурванидзе", url: "https://drive.google.com/drive/folders/1XNfMq3gOAyRcOT0RHueaLB7swvKzriAO", link: "Конспект и презентация" },
  { day: "День 3 · панель", num: "06", title: "Организация воспитательной работы в школах", text: "Школьная среда, семья, детские объединения, наставники, музей, цифровое пространство и местное сообщество как единая система.", speaker: "Анна Сергутина · Константин Соловьёв · Наталия Никоноркина", url: "https://drive.google.com/drive/folders/1iZor1MCujIkU3Vs-FaG-Hq0QX0C5Bz9y", link: "Все материалы панели" },
  { day: "День 3 · мастерская", num: "07", title: "Искусство педагогического замысла", text: "Проектирование события от ожидаемой перемены в человеке: смысл, пространство, действие, роли и рефлексия.", speaker: "Анна Завалина", url: "https://drive.google.com/drive/folders/1XuO1qdqsWUS2V7fyXeTSkQuRx0Vfa9Kb", link: "Презентация и рабочие листы" },
  { day: "День 3 · проектный трек", num: "08", title: "От вызовов к практикам", text: "Сквозная командная работа: от глобального вызова к профессиональной задаче, практике, результату и способам оценки.", url: "https://drive.google.com/drive/folders/1Nu1Um7PgmB9kks-EFLmKGpYqSyfkJwas", link: "Материалы групповой работы" },
  { day: "День 3 · итог", num: "09", title: "Проектная работа", text: "Финальная сборка проектной линии и решения команд по ключевым вызовам современного образования.", url: "https://drive.google.com/drive/folders/1VyDfDK7qvtnbcZUSc4JAYxWfDGrDyaK2", link: "Результаты команд" },
];

export function EducationHeight() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [day, setDay] = useState<number | "all">("all");

  useEffect(() => {
    if (sessionStorage.getItem(ACCESS_KEY) === "granted") setUnlocked(true);
  }, []);

  function unlock(event: FormEvent) {
    event.preventDefault();
    if (password === PASSWORD) {
      sessionStorage.setItem(ACCESS_KEY, "granted");
      setError("");
      setUnlocked(true);
    } else {
      setError("Неверный пароль. Попробуйте ещё раз.");
      setPassword("");
    }
  }

  if (!unlocked) {
    return (
      <section className="mesh relative flex min-h-[80vh] items-center py-16">
        <div className="wrap relative max-w-125">
          <div className="rounded-[30px] border border-white/18 bg-white/10 p-10 shadow-[0_32px_90px_rgba(0,0,0,0.22)] backdrop-blur-glass">
            <p className="eyebrow eyebrow--light mb-10">База знаний · I поток</p>
            <h1 className="m-0 mb-4 font-display text-[clamp(36px,7vw,56px)] leading-[0.98] font-semibold tracking-[-0.055em] text-white">
              Образование
              <br />
              на высоте
            </h1>
            <p className="mb-6 text-ui leading-relaxed text-white/72">
              Введите пароль участника, чтобы открыть материалы программы.
            </p>
            <form onSubmit={unlock} className="grid gap-2.5 sm:grid-cols-[1fr_auto]">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                required
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Пароль"
                aria-label="Пароль"
                className="min-h-13.5 w-full rounded-full border border-white/30 bg-white/10 px-4.5 text-lead font-semibold tracking-[0.18em] text-white outline-none placeholder:text-white/55 focus:border-white"
              />
              <button
                type="submit"
                className="min-h-13.5 rounded-full bg-white px-6 text-ui font-semibold text-navy"
              >
                Открыть
              </button>
            </form>
            <p className="mt-3 min-h-5 text-meta text-[#ffd1d1]" role="alert" aria-live="polite">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const days = day === "all" ? DAYS : DAYS.filter((item) => item.day === day);

  return (
    <>
      <section className="mesh relative pt-24 pb-20">
        <div className="wrap relative grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="eyebrow eyebrow--light">Международный образовательный семинар · I поток</p>
            <h1 className="m-0 mb-6 font-display text-[clamp(48px,9vw,96px)] leading-[0.94] font-semibold tracking-[-0.06em] text-white">
              Образование
              <span className="block text-sky-light">на высоте</span>
            </h1>
            <p className="lead lead--light mb-8 max-w-170">
              Итоги четырёх дней профессионального диалога о ценностях, воспитании и образовании
              будущего.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#materials" className="inline-flex min-h-12 items-center rounded-full bg-white px-5 text-ui font-semibold text-navy no-underline">
                Перейти к материалам
              </a>
              <a href="#program" className="inline-flex min-h-12 items-center rounded-full px-5 text-ui font-semibold text-white no-underline shadow-[inset_0_0_0_1px_rgba(255,255,255,0.38)]">
                Вспомнить программу
              </a>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-field border border-white/15 bg-white/8 px-5 py-4">
              <b className="block font-display text-title text-white">4 дня</b>
              <span className="text-meta text-white/72">29 сентября — 2 октября 2026</span>
            </div>
            <div className="rounded-field border border-white/15 bg-white/8 px-5 py-4">
              <b className="block font-display text-title text-white">9 блоков</b>
              <span className="text-meta text-white/72">Лекции, панели, мастерская и проектный трек</span>
            </div>
            <div className="rounded-field border border-white/15 bg-white/8 px-5 py-4">
              <b className="block font-display text-title text-white">Пятигорск</b>
              <span className="text-meta text-white/72">Центр знаний «Машук»</span>
            </div>
          </div>
        </div>
        <MountainLine className="text-white" />
      </section>

      <section className="section" id="about">
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-panel border border-[var(--line-soft)] bg-white p-7">
            <p className="m-0 mb-4 font-long text-lead italic leading-relaxed text-ink">
              «Не серия готовых ответов, а пространство профессионального взаимодействия».
            </p>
            <small className="text-caption text-ink-soft">
              Логика программы — связывать знание, смысл, личное переживание и действие.
            </small>
          </aside>
          <div>
            <p className="eyebrow">О программе</p>
            <h2 className="section-title">От больших вызовов — к собственному педагогическому действию</h2>
            <p className="lead">
              Программа объединила русскоговорящих педагогов и специалистов школьного образования
              из разных стран вокруг вопросов ценностного воспитания и развития молодёжи.
            </p>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {PURPOSE.map((item) => (
                <article key={item.title} className="rounded-[16px] border border-[var(--line-soft)] bg-white p-4">
                  <h3 className="m-0 mb-2 font-display text-lead font-semibold text-navy">{item.title}</h3>
                  <p className="m-0 text-ui font-light leading-relaxed text-ink-soft">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mesh section">
        <div className="wrap">
          <p className="eyebrow eyebrow--light">Результаты</p>
          <h2 className="section-title section-title--light">Что участники увезли с собой</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RESULTS.map((item) => (
              <article key={item.num} className="glass p-5">
                <span className="mb-3 block font-display text-title text-sky-light">{item.num}</span>
                <h3 className="m-0 mb-2 font-display text-lead font-semibold text-white">{item.title}</h3>
                <p className="m-0 text-meta leading-relaxed text-white/72">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="program">
        <div className="wrap">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Программа</p>
              <h2 className="section-title section-title--tight">Четыре дня на высоте</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", 1, 2, 3, 4] as const).map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setDay(value)}
                  className={`min-h-10 rounded-full px-4 text-meta font-semibold ${
                    day === value ? "bg-navy text-white" : "bg-white text-ink-soft hover:text-navy"
                  }`}
                >
                  {value === "all" ? "Все дни" : `День ${value}`}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {days.map((item) => (
              <article key={item.day} className="overflow-hidden rounded-panel border border-[var(--line-soft)] bg-white md:grid md:grid-cols-[220px_1fr]">
                <div className="bg-paper-warm p-6">
                  <b className="block font-display text-title font-semibold text-navy">{item.label}</b>
                  <span className="mt-1 block whitespace-pre-line text-meta text-ink-soft">{item.side}</span>
                </div>
                <div className="grid gap-3 p-5">
                  {item.slots.map((slot) => (
                    <div key={slot.time + slot.title} className="grid grid-cols-[72px_1fr] gap-3">
                      <time className="font-display text-lead font-semibold text-navy">{slot.time}</time>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="m-0 text-lead font-semibold text-ink">{slot.title}</h3>
                        <p className="m-0 w-full text-meta text-ink-soft">{slot.text}</p>
                        <span className="tag">{slot.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0" id="materials">
        <div className="wrap">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">База знаний</p>
              <h2 className="section-title section-title--tight">Материалы по дням и спикерам</h2>
            </div>
            <a
              href={DRIVE_FOLDER}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center rounded-full bg-navy px-5 text-ui font-semibold text-white no-underline hover:bg-navy-deep"
            >
              Вся папка на Google Drive ↗
            </a>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {MATERIALS.map((card) => (
              <article key={card.num} className="card p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-caption uppercase tracking-wide text-gold-ink">{card.day}</span>
                  <span className="font-display text-title text-[rgba(34,63,154,0.2)]">{card.num}</span>
                </div>
                <h3 className="m-0 mb-2 font-display text-lead font-semibold text-navy">{card.title}</h3>
                <p className="m-0 mb-3 text-meta font-light leading-relaxed text-ink-soft">{card.text}</p>
                {card.speaker ? (
                  <p className="m-0 mb-3 text-caption font-semibold text-ink">{card.speaker}</p>
                ) : null}
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto font-semibold text-navy no-underline hover:underline"
                >
                  {card.link} ↗
                </a>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-215 text-meta font-light leading-relaxed text-ink-soft">
            <strong className="text-ink">Важно.</strong> Материалы дополняют живые выступления,
            обсуждения и контекст программы, но не заменяют их. Используйте их прежде всего как
            рабочий ресурс: возвращайтесь к идеям, сопоставляйте их со своей практикой и продолжайте
            собственное осмысление.
          </p>
        </div>
      </section>
    </>
  );
}
