import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { MountainLine } from "@/components/brand/MountainLine";

export const metadata: Metadata = {
  title: "Медиакомпетенции в сфере межнациональных отношений",
  description:
    "Четырёхдневная очная программа для журналистов, блогеров, создателей контента, специалистов по связям с общественностью и сотрудников этнических и региональных СМИ.",
};

const CHIPS = ["4 дня очно", "г. Пятигорск", "25–28 ноября 2026", "Центр знаний «Машук»"];

const ABOUT = [
  "Образовательное мероприятие, посвящённое развитию межнационального и межконфессионального согласия, представляет собой четырёхдневную программу, ориентированную на журналистов, блогеров, создателей контента, специалистов по связям с общественностью, сотрудников этнических и региональных средств массовой информации.",
  "Программа направлена на формирование и развитие профессиональных компетенций в области освещения тематики межнациональных и межконфессиональных отношений в современных СМИ и социальных сетях. В ходе мероприятия рассматриваются актуальные форматы, инструменты и жанры работы с этнокультурной тематикой, а также этические и правовые аспекты профессиональной деятельности медиаспециалиста.",
  "Занятия проводятся в формате лекций, экспертных сессий и практических мастерских с разбором примеров медиапрактики и обменом опытом между участниками из различных регионов страны.",
  "По итогам программы участники смогут создавать медиаматериалы, которые укрепляют общероссийскую гражданскую идентичность и межнациональное согласие, а также профессионально реагировать на информационные провокации и деструктивные нарративы.",
];

const OUTCOMES = [
  "изучат современные форматы и жанры освещения вопросов межнациональных и межконфессиональных отношений в печатных и электронных изданиях, социальных сетях;",
  "освоят практические приёмы создания контента, ориентированного на различные аудитории, включая молодёжную;",
  "рассмотрят этические нормы и правовые основы подготовки материалов, затрагивающих вопросы национального единства;",
  "приобретут навыки верификации информации и конструктивного взаимодействия с аудиторией в публичных обсуждениях.",
];

const WHO = [
  "журналисты и блогеры",
  "создатели контента",
  "специалисты по связям с общественностью",
  "сотрудники этнических и региональных средств массовой информации",
];

const HOW = [
  { num: "01", title: "Откройте форму", text: "Перейдите к форме регистрации. На заполнение потребуется около 15–20 минут." },
  { num: "02", title: "Заполните данные", text: "Заполните все обязательные поля и укажите действующие телефон и электронную почту." },
  { num: "03", title: "Отправьте заявку", text: "Отправьте заявку и следите за сообщениями от команды организаторов, включая папку «Спам»." },
];

export default function MediaLanding() {
  return (
    <>
      <section className="mesh relative pt-24 pb-20">
        <div className="wrap relative max-w-215">
          <p className="eyebrow eyebrow--light">Центр знаний «Машук»</p>
          <p className="mb-3 text-lead font-light text-white/80">
            Образовательное мероприятие, посвящённое развитию межнационального и
            межконфессионального согласия
          </p>
          <h1 className="m-0 mb-6 font-display text-[clamp(32px,4.6vw,60px)] leading-[1.02] font-semibold tracking-[-0.05em] text-white">
            Медиакомпетенции в сфере межнациональных отношений: этика, инструменты, практики
          </h1>
          <p className="lead lead--light mb-8 max-w-180">
            Четырёхдневная очная программа для журналистов, блогеров, создателей контента,
            специалистов по связям с общественностью и сотрудников этнических и региональных СМИ.
          </p>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CHIPS.map((chip) => (
              <div key={chip} className="rounded-field border border-white/15 bg-white/8 px-4 py-3 text-meta text-white">
                {chip}
              </div>
            ))}
          </div>
          <ButtonLink href="mailto:a.bokareva@czmashuk.ru" variant="light">
            Регистрация
          </ButtonLink>
        </div>
        <MountainLine className="text-white" />
      </section>

      <section className="section">
        <div className="wrap max-w-215">
          <p className="eyebrow">О мероприятии</p>
          <div className="card p-8">
            {ABOUT.map((text) => (
              <p key={text} className="mb-4 text-ui font-light leading-relaxed text-ink last:mb-0">
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap max-w-215">
          <h2 className="section-title">По итогам мероприятия участники</h2>
          <ol className="m-0 grid list-none gap-2.5 p-0">
            {OUTCOMES.map((text, index) => (
              <li key={text} className="grid grid-cols-[52px_1fr] items-start gap-3.5 rounded-[16px] border border-[var(--line-soft)] bg-white p-3.5">
                <span className="pt-0.5 text-meta font-semibold tracking-[0.14em] text-gold-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="m-0 text-ui font-light leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap max-w-215">
          <h2 className="section-title">Кого приглашаем</h2>
          <p className="lead mb-5">
            К участию приглашаются журналисты, блогеры, создатели контента, специалисты по связям
            с общественностью, сотрудники этнических и региональных средств массовой информации,
            а также иные заинтересованные лица, чья профессиональная деятельность связана с
            освещением тематики межнациональных и межконфессиональных отношений в медиа и
            социальных сетях.
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {WHO.map((text, index) => (
              <article key={text} className="rounded-[16px] border border-[var(--line-soft)] bg-white p-4">
                <b className="mb-1.5 block text-caption uppercase tracking-[0.12em] text-gold-ink">
                  {String(index + 1).padStart(2, "0")}
                </b>
                <p className="m-0 text-ui font-light leading-relaxed">{text.replace(/\.$/, "")}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap max-w-215">
          <h2 className="section-title">Даты проведения</h2>
          <div className="grid gap-2.5 sm:max-w-110">
            <article className="min-h-33 rounded-[18px] border border-[var(--line-soft)] bg-white p-4">
              <em className="mb-2.5 block font-display text-[28px] leading-none font-semibold not-italic tracking-[-0.04em] text-navy">
                25–28
              </em>
              <b className="mb-1.5 block text-caption uppercase tracking-[0.12em] text-gold-ink">
                ноября 2026
              </b>
              <span className="text-ui font-light leading-snug text-ink">
                очный формат, четыре дня
              </span>
            </article>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap max-w-215">
          <h2 className="section-title">Место проведения</h2>
          <div className="flex items-start gap-3.5 rounded-[18px] border border-[var(--line-soft)] bg-white p-4.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(34,63,154,0.08)] text-navy" aria-hidden="true">
              ▲
            </span>
            <p className="m-0 text-lead font-normal leading-snug text-navy">
              Мероприятие проводится в очном формате на базе Центра знаний «Машук» по адресу:
              город Пятигорск, Пионерлагерная улица, дом 8В
            </p>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap max-w-215">
          <h2 className="section-title">Как принять участие</h2>
          <div className="grid gap-2.5">
            {HOW.map((step) => (
              <article key={step.num} className="grid grid-cols-[64px_1fr] gap-3.5 rounded-[18px] border border-[var(--line-soft)] bg-white p-4">
                <div className="font-display text-[22px] leading-tight font-semibold tracking-[-0.04em] text-navy">
                  {step.num}
                </div>
                <div>
                  <h3 className="m-0 mb-1.5 text-lead font-semibold text-navy">{step.title}</h3>
                  <p className="m-0 text-ui font-light leading-relaxed">{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap max-w-215">
          <p className="eyebrow">Регистрация</p>
          <h2 className="section-title">Медиакомпетенции</h2>
          <div className="flex flex-wrap items-center gap-3.5">
            <ButtonLink href="mailto:a.bokareva@czmashuk.ru">Регистрация</ButtonLink>
          </div>

          <h3 className="mt-9 mb-3 font-display text-[22px] font-semibold text-navy">Контакты для связи</h3>
          <div className="card p-8">
            <p className="mb-1.5 text-ui font-light">
              <b>Бокарева Анастасия Александровна</b>
            </p>
            <p className="mb-4 text-ui font-light">
              ведущий руководитель программ управления по развитию компетенций межнационального и
              межконфессионального согласия и единства АНО «ЦЗ «Машук»
            </p>
            <p className="m-0 text-ui font-light">
              e-mail:{" "}
              <a href="mailto:a.bokareva@czmashuk.ru" className="font-semibold text-navy">
                a.bokareva@czmashuk.ru
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
