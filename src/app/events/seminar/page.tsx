import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { MountainLine } from "@/components/brand/MountainLine";

export const metadata: Metadata = {
  title: "Семинар «Образование на высоте»",
  description:
    "Очный четырёхдневный международный образовательный семинар для русскоговорящих педагогов и специалистов школьного образования из разных стран мира.",
};

const CHIPS = ["4 дня очно", "г. Пятигорск", "4 потока · 2026", "Центр знаний «Машук»"];

const ABOUT = [
  "«Образование на высоте» — очный четырёхдневный международный образовательный семинар, который объединит русскоговорящих педагогов и специалистов в сфере школьного образования из разных стран мира.",
  "Основные темы семинара — ценностное воспитание, вовлечение детей и молодёжи в социально значимую деятельность, событийная педагогика, игровые и цифровые образовательные инструменты, наставничество и развитие международного профессионального сотрудничества.",
  "В рамках экспертных дискуссий, практических мастер-классов, групповой работы и обмена профессиональным опытом участники познакомятся с актуальными образовательными практиками, современными инструментами педагогики, а также разработают собственные идеи и решения, которые смогут применить в своей профессиональной деятельности.",
];

const OUTCOMES = [
  "познакомятся с современными подходами к воспитанию, просвещению и организации образовательной среды;",
  "обсудят роль ценностей в образовании, способы вовлечения молодёжи в социально значимую деятельность и возможности передачи культурного и исторического опыта новым поколениям;",
  "узнают, как проектировать образовательные события, которые вызывают интерес и мотивируют участников;",
  "освоят игровые механики, инструменты событийной педагогики и цифровые сервисы, применимые в образовательной работе;",
  "обменяются профессиональными практиками с коллегами из разных стран;",
  "установят новые профессиональные контакты и организуют международное педагогическое сообщество для дальнейшего взаимодействия.",
];

const WHO = [
  "руководители и педагогические работники школ;",
  "преподаватели русского языка как иностранного;",
  "методисты и специалисты организаций, осуществляющих методическое сопровождение педагогических работников школ;",
  "представители органов управления образованием.",
];

const DATES = [
  { roman: "I", name: "1 поток", value: "29 сентября — 2 октября 2026 г." },
  { roman: "II", name: "2 поток", value: "11–14 октября 2026 г." },
  { roman: "III", name: "3 поток", value: "27–30 октября 2026 г." },
  { roman: "IV", name: "4 поток", value: "30 октября — 2 ноября 2026 г." },
];

const HOW = [
  { num: "01", title: "Выберите поток", text: "Выберите подходящий поток и подайте заявку." },
  { num: "02", title: "Откройте форму", text: "Перейдите к регистрационной форме. На заполнение потребуется около 15–20 минут." },
  { num: "03", title: "Заполните данные", text: "Заполните все обязательные поля и укажите действующие телефон и электронную почту." },
  { num: "04", title: "Отправьте заявку", text: "Отправьте заявку и следите за сообщениями от команды семинара." },
];

export default function SeminarLanding() {
  return (
    <>
      <section className="mesh relative pt-24 pb-20">
        <div className="wrap relative max-w-215">
          <p className="eyebrow eyebrow--light">Центр знаний «Машук»</p>
          <p className="mb-3 text-lead font-light text-white/80">
            Международный образовательный семинар
          </p>
          <h1 className="m-0 mb-6 font-display text-[clamp(40px,7vw,84px)] leading-[0.95] font-semibold tracking-[-0.06em] text-white">
            Образование на высоте
          </h1>
          <p className="lead lead--light mb-8 max-w-180">
            Очный четырёхдневный международный образовательный семинар для русскоговорящих
            педагогов и специалистов школьного образования из разных стран мира.
          </p>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CHIPS.map((chip) => (
              <div key={chip} className="rounded-field border border-white/15 bg-white/8 px-4 py-3 text-meta text-white">
                {chip}
              </div>
            ))}
          </div>
          <ButtonLink href="/apply" variant="light">
            Подать заявку
          </ButtonLink>
        </div>
        <MountainLine className="text-white" />
      </section>

      <section className="section">
        <div className="wrap max-w-215">
          <p className="eyebrow">О семинаре</p>
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
          <h2 className="section-title">По итогам семинара участники</h2>
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
            К участию приглашаются специалисты сферы образования и просвещения, осуществляющие
            профессиональную деятельность на территории иностранных государств и владеющие
            русским языком на уровне, достаточном для участия в семинаре, в том числе:
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {WHO.map((text, index) => (
              <article key={text} className="rounded-[16px] border border-[var(--line-soft)] bg-white p-4">
                <b className="mb-1.5 block text-caption uppercase tracking-[0.12em] text-gold-ink">
                  {String(index + 1).padStart(2, "0")}
                </b>
                <p className="m-0 text-ui font-light leading-relaxed">{text.replace(/;$/, "")}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap max-w-215">
          <h2 className="section-title">Даты проведения</h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {DATES.map((wave) => (
              <article key={wave.roman} className="min-h-33 rounded-[18px] border border-[var(--line-soft)] bg-white p-4">
                <em className="mb-2.5 block font-display text-[28px] leading-none font-semibold not-italic tracking-[-0.04em] text-navy">
                  {wave.roman}
                </em>
                <b className="mb-1.5 block text-caption uppercase tracking-[0.12em] text-gold-ink">{wave.name}</b>
                <span className="text-ui font-light leading-snug text-ink">{wave.value}</span>
              </article>
            ))}
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
              г. Пятигорск, Центр знаний «Машук», ул. Пионерлагерная, 8В
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
          <p className="eyebrow">Заявка</p>
          <h2 className="section-title">Образование на высоте</h2>
          <p className="mb-4 text-ui font-light leading-relaxed text-ink-soft">
            Перейдите к регистрационной форме.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <ButtonLink href="/apply">Подать заявку</ButtonLink>
          </div>

          <h3 className="mt-9 mb-3 font-display text-[22px] font-semibold text-navy">Контакты для связи</h3>
          <div className="card p-8">
            <p className="mb-1.5 text-ui font-light">
              <b>Ершова Екатерина Игоревна</b>
            </p>
            <p className="mb-4 text-ui font-light">ведущий руководитель программы</p>
            <p className="m-0 text-ui font-light">
              e-mail:{" "}
              <a href="mailto:e.ershova@czmashuk.ru" className="font-semibold text-navy">
                e.ershova@czmashuk.ru
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
