import { ButtonLink } from "@/components/ui/Button";
import { MountainLine } from "@/components/brand/MountainLine";
import { ProgramCatalog } from "@/components/programs/ProgramCatalog";
import { getAllPrograms } from "@/lib/data";

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

export default async function HomePage() {
  const programs = await getAllPrograms();

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="mesh relative pt-26 pb-20">
        <div className="wrap relative">
          <p className="eyebrow eyebrow--light">Центр знаний «Машук»</p>
          <h1 className="m-0 mb-7 max-w-215 font-display text-[clamp(44px,7.5vw,104px)] leading-[0.92] font-semibold tracking-[-0.07em] text-white">
            Цифровой
            <span className="block text-sky-light">Машук</span>
          </h1>
          <p className="lead lead--light mb-9 max-w-180">
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
        <MountainLine className="text-white" />
      </section>

      {/* ----------------------------------------------------------- ПРЕИМУЩЕСТВА */}
      <section className="section">
        <div className="wrap grid gap-6 md:grid-cols-3">
          {ADVANTAGES.map((item) => (
            <article key={item.title} className="card p-7">
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
    </>
  );
}
