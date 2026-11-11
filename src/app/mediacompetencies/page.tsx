import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { MountainLine } from "@/components/brand/MountainLine";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { mediaConfig } from "@/lib/forms/media-config";

export const metadata: Metadata = {
  title: "Медиакомпетенции: семинар 25–28 ноября 2026",
  description:
    "Четырёхдневный очный семинар в Пятигорске о том, как освещать межнациональные и межконфессиональные отношения: этика, инструменты, практики. Заявка на участие — на этой странице.",
  alternates: { canonical: "/mediacompetencies" },
  openGraph: {
    type: "website",
    siteName: "Центр знаний «Машук»",
    url: "/mediacompetencies",
    title: "Медиакомпетенции: семинар 25–28 ноября 2026",
    description:
      "Этика, инструменты и практики освещения межнациональных и межконфессиональных отношений. Пятигорск, 25–28 ноября 2026.",
  },
};

/* ==========================================================================
   Лендинг семинара. Одна страница: сначала смысл и условия, ниже — анкета.
   Никаких дублирующих блоков: то, что можно сказать одной строкой, сказано
   одной строкой. Заявка живёт здесь же, отдельной страницы больше нет.
   ========================================================================== */

const META = "25–28 ноября 2026, Пятигорск, Центр знаний «Машук»";

const ABOUT = [
  "«Медиакомпетенции» — четырёхдневный очный семинар о том, как рассказывать о межнациональных и межконфессиональных отношениях точно, этично и интересно.",
  "Разбираем современные форматы и жанры, приёмы работы с разными аудиториями, этические нормы и правовые основы. Отдельно — верификация информации и конструктивный диалог с аудиторией в публичных обсуждениях.",
  "Занятия проходят в формате лекций, экспертных сессий и практических мастерских с разбором реальных медиапрактик.",
];

const OUTCOMES = [
  {
    lead: "Форматы и жанры",
    text: "современные способы освещения темы в печатных и электронных изданиях, социальных сетях.",
  },
  {
    lead: "Контент для аудиторий",
    text: "приёмы создания материалов для разных аудиторий, включая молодёжную.",
  },
  {
    lead: "Этика и право",
    text: "нормы и правовые основы подготовки материалов о национальном единстве.",
  },
  {
    lead: "Проверка и диалог",
    text: "навыки верификации информации и конструктивного общения с аудиторией.",
  },
];

const FACTS = [
  { term: "Даты", value: "25–28 ноября 2026" },
  { term: "Место", value: "Пятигорск, Пионерлагерная улица, 8В" },
  { term: "Формат", value: "очный, четыре дня" },
  { term: "Возраст", value: "от 18 лет" },
  {
    term: "Участие",
    value: "Организационного взноса нет. Проживание и питание — за счёт Центра знаний «Машук».",
  },
];

const H2 =
  "m-0 font-display text-[clamp(30px,3.6vw,46px)] leading-[1.08] font-semibold tracking-[-0.04em] text-navy";

export default function MediaCompetenciesPage() {
  return (
    <>
      <section className="mesh relative flex min-h-[62svh] flex-col justify-center overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-24 lg:min-h-[72svh] lg:pt-24 lg:pb-28">
        <div className="wrap relative z-10">
          <h1 className="m-0 font-display text-[clamp(30px,9vw,116px)] leading-[0.92] font-semibold tracking-[-0.055em] text-white">
            Медиакомпетенции
          </h1>
          <p className="mt-6 max-w-[620px] text-[clamp(19px,2vw,27px)] leading-[1.32] font-light text-white/85">
            Четырёхдневный семинар: этика, инструменты и практики освещения
            межнациональных и межконфессиональных отношений.
          </p>

          <div className="mt-10 flex flex-col items-start gap-5 sm:mt-12 sm:flex-row sm:items-center sm:gap-8">
            <ButtonLink href="#zayavka" variant="light" size="lg" className="w-full sm:w-auto">
              Заполнить заявку
            </ButtonLink>
            <p className="m-0 max-w-[34ch] text-[15px] leading-snug font-light text-white/72">
              {META}
            </p>
          </div>
        </div>
        <MountainLine className="text-white" />
      </section>

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <h2 className={H2}>О программе</h2>
          <div className="max-w-[62ch]">
            {ABOUT.map((text, index) => (
              <p
                key={text}
                className={`text-[17px] leading-[1.6] font-light text-ink ${
                  index > 0 ? "mt-4" : ""
                }`}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24 lg:pb-28">
        <div className="wrap">
          <h2 className={`${H2} max-w-[20ch]`}>Что даёт программа</h2>
          <ul className="mt-10 grid list-none gap-x-12 gap-y-8 p-0 sm:grid-cols-2 lg:mt-12 lg:gap-x-20">
            {OUTCOMES.map((item) => (
              <li key={item.lead} className="max-w-[46ch]">
                <p className="m-0 text-[17px] leading-[1.55] font-light text-ink">
                  <strong className="font-semibold text-ink">{item.lead}.</strong>{" "}
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pb-20 sm:pb-24 lg:pb-28">
        <div className="wrap grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className={H2}>Кого приглашаем</h2>
            <p className="mt-6 max-w-[52ch] text-[17px] leading-[1.6] font-light text-ink">
              Журналистов и блогеров, создателей контента, специалистов по связям с
              общественностью, сотрудников этнических и региональных СМИ — всех, чья работа
              связана с освещением межнациональных и межконфессиональных отношений.
            </p>
          </div>

          <dl className="m-0 flex flex-col gap-6 self-start">
            {FACTS.map((fact) => (
              <div key={fact.term} className="grid gap-1 sm:grid-cols-[116px_1fr] sm:gap-6">
                <dt className="text-[13px] leading-[1.5] font-medium text-ink-soft">{fact.term}</dt>
                <dd className="m-0 text-[17px] leading-[1.5] font-light text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div id="zayavka" className="wrap max-w-[760px]">
          <h2 className={H2}>Заявка</h2>
          <ApplicationForm
            config={mediaConfig}
            embedded
            intro="Заполните форму — это займёт 15–20 минут."
          />
        </div>
      </section>

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <h2 className={H2}>Контакты</h2>
          <div className="max-w-[54ch]">
            <p className="m-0 text-[17px] leading-[1.45] font-medium text-navy">
              Бокарева Анастасия Александровна
            </p>
            <p className="mt-2 text-[15px] leading-[1.55] font-light text-ink-soft">
              ведущий руководитель программ управления по развитию компетенций
              межнационального и межконфессионального согласия и единства АНО «ЦЗ «Машук»
            </p>
            <p className="mt-5">
              <a
                href="mailto:a.bokareva@czmashuk.ru"
                className="text-[17px] font-medium text-navy underline decoration-[color:var(--line)] decoration-1 underline-offset-4 transition-colors hover:decoration-navy"
              >
                a.bokareva@czmashuk.ru
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
