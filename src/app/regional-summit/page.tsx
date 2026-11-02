import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Всероссийское совещание региональных министров образования",
  description:
    "Образовательное мероприятие для руководителей органов власти субъектов РФ в сфере образования. Пятигорск, Центр знаний «Машук», 14–16 апреля 2026 года.",
};

/** Перенесено со страницы mashuk.online/regional-summit старого сайта. */
const FACTS = [
  { value: "89", label: "регионов" },
  { value: "4", label: "дня" },
];

export default function RegionalSummitPage() {
  return (
    <>
      <section className="mesh relative pt-20 pb-20">
        <div className="wrap relative">
          <p className="eyebrow eyebrow--light">Министерство просвещения Российской Федерации · Совещание</p>
          <h1 className="m-0 mb-6 max-w-220 font-display text-[clamp(34px,5.6vw,72px)] leading-[0.98] font-semibold tracking-[-0.05em] text-white">
            Всероссийское совещание региональных министров образования
          </h1>
          <p className="lead lead--light mb-8 max-w-180">
            Образовательное мероприятие для руководителей исполнительных органов субъектов Российской
            Федерации, осуществляющих государственное управление в сфере образования
          </p>
          <p className="m-0 text-ui text-white/80">г. Пятигорск · Центр знаний «Машук» · 14–16 апреля 2026 года</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="eyebrow">Образовательная среда</p>
            <h2 className="section-title section-title--tight">
              Пространство, где опыт регионов становится вектором общенационального прогресса
            </h2>
            <p className="lead">
              Единая платформа для стратегического диалога руководителей органов власти, направленная
              на синхронизацию лучших практик и развитие образовательных систем всех субъектов
              Российской Федерации.
            </p>
          </div>
          <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0">
            {FACTS.map((fact) => (
              <li key={fact.label} className="card p-7">
                <span className="block font-display text-[clamp(40px,5vw,64px)] leading-none font-semibold tracking-[-0.05em] text-navy">
                  {fact.value}
                </span>
                <span className="mt-2 block text-ui text-ink-soft">{fact.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
