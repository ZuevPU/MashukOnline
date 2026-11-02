import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "База знаний для работы с ИИ",
  description: "База знаний Центра знаний «Машук» для работы с искусственным интеллектом.",
};

/** Адрес старого сайта mashuk.online/aihub: на Tilda страница была заготовкой без содержимого. */
export default function AiHubPage() {
  return (
    <section className="section">
      <div className="wrap max-w-190">
        <p className="eyebrow">Материалы</p>
        <h1 className="section-title">База знаний для работы с ИИ</h1>
        <p className="lead mb-8">Раздел готовится. А пока — онлайн-курсы и методические материалы Центра.</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/courses">Программы обучения</ButtonLink>
          <ButtonLink href="/metod" variant="outline">
            Методические материалы
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
