import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Методические материалы",
  description:
    "Методические материалы Центра знаний «Машук» для участников образовательного мероприятия «ПРО Образование».",
};

/** Перенесено со страницы mashuk.online/metod старого сайта. */
const MATERIALS = [
  "Комплект методических материалов «Инструменты адаптации молодого педагога»",
  "Комплект материалов настольной игры «Дай совет!»",
  "Методическое пособие «Наставничество в школах: обзор подходов и технологий»",
  "Онлайн-программы Центра знаний «Машук»",
];

export default function MetodPage() {
  return (
    <>
      <section className="mesh relative pt-20 pb-20">
        <div className="wrap relative">
          <p className="eyebrow eyebrow--light">Методические материалы</p>
          <h1 className="m-0 mb-6 max-w-200 font-display text-[clamp(32px,5vw,60px)] leading-[1.02] font-semibold tracking-[-0.04em] text-white">
            для участников образовательного мероприятия «ПРО Образование»
          </h1>
          <p className="lead lead--light max-w-170">
            для преподавателей и руководителей образовательных учреждений Республики Южная Осетия
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="eyebrow">Видеоинструкция</p>
            <div className="relative aspect-video overflow-hidden rounded-[var(--radius-card)] bg-black-ink">
              <iframe
                src="https://vkvideo.ru/video_ext.php?oid=-231468147&id=456239071&hd=2"
                title="Видеоинструкция по методическим материалам"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 text-ui font-light leading-relaxed text-ink">
            <p className="m-0">
              В данном разделе собраны инструкции и практические рекомендации по использованию
              методических материалов Центра знаний «Машук».
            </p>
            <p className="m-0">
              Материалы направлены на поддержку педагогов, наставников, методистов и управленческих
              команд в условиях развития современных воспитательных практик и цифровой
              трансформации образования.
            </p>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap">
          <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
            {MATERIALS.map((title, index) => (
              <li key={title} className="card flex items-start gap-5 p-7">
                <span className="font-display text-title font-semibold text-sky">{String(index + 1).padStart(2, "0")}</span>
                <span className="font-display text-lead font-semibold tracking-[-0.02em] text-navy">{title}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <ButtonLink href="https://lms.mashuk.online/" external>
              Онлайн-программы в LMS
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
