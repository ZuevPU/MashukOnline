import type { Metadata } from "next";
import { CourseCard } from "@/components/courses/CourseCard";
import { COURSES, MATERIALS } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Программы обучения",
  description:
    "Онлайн-курсы и образовательные программы Центра знаний «Машук»: наставничество, цифровые компетенции, воспитание и работа с молодёжью.",
};

export default function CoursesPage() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <p className="eyebrow">Программы обучения</p>
          <h1 className="section-title">Наши программы</h1>
          <p className="lead mb-10 max-w-190">
            Наши программы — это пространство для тех, кто хочет учиться новому и применять знания
            на практике. Здесь курсы и мероприятия помогают педагогам и наставникам осваивать
            современные методики, работать с молодёжью, развивать цифровые компетенции и находить
            инструменты, которые работают в образовательной среде.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap">
          <p className="eyebrow">Методические материалы</p>
          <h2 className="section-title section-title--tight mb-6">Полезные ресурсы</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {MATERIALS.map((item) => (
              <article key={item.title} className="card p-7">
                <h3 className="m-0 mb-3 font-display text-title-sm font-semibold tracking-[-0.02em] text-navy">
                  {item.title}
                </h3>
                <p className="m-0 mb-5 text-meta font-light leading-relaxed text-ink-soft">
                  {item.description}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 font-semibold text-navy no-underline hover:underline"
                >
                  {item.label}
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
