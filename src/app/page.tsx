import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { MountainLine } from "@/components/brand/MountainLine";
import { ProgramCatalog } from "@/components/programs/ProgramCatalog";
import { getAllPrograms, getShowcaseStats } from "@/lib/data";
import { DIRECTIONS } from "@/lib/types";

const ADVANTAGES = [
  {
    title: "Образовательные программы и экспертиза",
    text: "Доступное обучение из любой точки страны в рамках современного образовательного пространства России.",
  },
  {
    title: "Цифровая платформа и доступность",
    text: "Возможность пройти программы Центра знаний «Машук» онлайн — без поездки в Пятигорск, из любого региона страны.",
  },
  {
    title: "Сообщество и профессиональное развитие",
    text: "Всероссийское сообщество выпускников «Машука»: обмен практиками, профессиональный диалог и поддержка педагогов на всех этапах развития.",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const programs = await getAllPrograms();
  const stats = getShowcaseStats(programs);

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="mesh relative pt-24 pb-24">
        <div className="wrap relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow eyebrow--light">Центр знаний «Машук»</p>
            <h1 className="m-0 mb-7 font-display text-[clamp(44px,7.5vw,104px)] leading-[0.92] font-semibold tracking-[-0.07em] text-white">
              Цифровой
              <span className="block text-sky-light">Машук</span>
            </h1>
            <p className="lead lead--light mb-9 max-w-160">
              Центр знаний «Машук» теперь в цифровом формате: обучение, программы и материалы
              доступны онлайн для вашего обучения и развития.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="#programs" variant="light">
                Начать обучение
              </ButtonLink>
              <ButtonLink href="https://lms.mashuk.online/" variant="ghost" external>
                Методические материалы
              </ButtonLink>
            </div>
          </div>

          <div className="relative hidden justify-center lg:flex" aria-hidden="true">
            <div className="absolute inset-0 -z-10 rounded-full bg-sky/20 blur-3xl" />
            <Image
              src="/brand/mascot/maskot_front_3_4.png"
              alt=""
              width={460}
              height={560}
              priority
              className="h-auto w-[min(420px,80%)] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>
        <MountainLine className="text-white" />
      </section>

      {/* --------------------------------------------------------------- ЦИФРЫ */}
      <section className="border-b border-[var(--line-soft)] bg-white">
        <div className="wrap grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          <Stat value={String(stats.programs)} label="программ" />
          <Stat value={stats.participants ? `${stats.participants}+` : "—"} label="участников" />
          <Stat value={String(stats.upcoming)} label="идёт набор" />
          <Stat value={String(stats.days)} label="дней программы" />
        </div>
      </section>

      {/* ----------------------------------------------------------- ПРЕИМУЩЕСТВА */}
      <section className="section">
        <div className="wrap grid gap-6 md:grid-cols-3">
          {ADVANTAGES.map((item) => (
            <article key={item.title} className="card card--hover p-7">
              <h2 className="m-0 mb-3 font-display text-title font-semibold tracking-[-0.03em] text-navy">
                {item.title}
              </h2>
              <p className="m-0 text-ui font-light leading-relaxed text-ink-soft">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- КАТАЛОГ */}
      <section className="section pt-0" id="programs">
        <div className="wrap">
          <div className="mb-9 max-w-190">
            <p className="eyebrow">Программы обучения</p>
            <h2 className="section-title section-title--tight mb-4">Наши программы</h2>
            <p className="m-0 text-ui font-light leading-relaxed text-ink-soft">
              Наши программы — это пространство для тех, кто хочет учиться новому и применять
              знания на практике. Здесь курсы и мероприятия помогают педагогам и наставникам
              осваивать современные методики, работать с молодёжью, развивать цифровые
              компетенции и находить инструменты, которые работают в образовательной среде.
            </p>
          </div>

          <ProgramCatalog programs={programs} />
        </div>
      </section>

      {/* ----------------------------------------------------------- НАПРАВЛЕНИЯ */}
      <section className="section pt-0">
        <div className="wrap">
          <p className="eyebrow">Направления</p>
          <h2 className="section-title section-title--tight mb-6">Куда двигаться дальше</h2>
          <div className="flex flex-wrap gap-2.5">
            {DIRECTIONS.map((direction) => (
              <span
                key={direction.key}
                className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-meta text-navy"
              >
                {direction.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- МАТЕРИАЛЫ/CTA */}
      <section className="section pt-0">
        <div className="wrap">
          <div className="mesh relative overflow-hidden rounded-[var(--radius-card)] p-8 md:p-11">
            <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <p className="eyebrow eyebrow--light">Материалы</p>
                <h2 className="m-0 mb-4 font-display text-[clamp(26px,3.4vw,40px)] font-semibold tracking-[-0.03em] text-white">
                  Методические разработки и онлайн-курсы
                </h2>
                <p className="m-0 max-w-140 text-ui font-light leading-relaxed text-white/78">
                  Готовые инструменты, примеры и рекомендации экспертов Центра знаний «Машук» —
                  для ежедневной работы в современной образовательной среде.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <ButtonLink href="https://lms.mashuk.online/" variant="light" external>
                  Онлайн-курсы
                </ButtonLink>
                <ButtonLink href="https://mashuk.online/bestpractice" variant="ghost" external>
                  База практик
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-display text-[clamp(30px,4vw,46px)] leading-none font-semibold tracking-[-0.05em] text-navy">
        {value}
      </span>
      <span className="text-meta text-ink-soft">{label}</span>
    </div>
  );
}
