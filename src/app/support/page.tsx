import type { Metadata } from "next";
import { SupportForm } from "@/components/site/SupportForm";

export const metadata: Metadata = {
  title: "Техническая поддержка",
  description: "Вопросы по онлайн-обучению и доступу к платформе Центра знаний «Машук».",
};

export default function SupportPage() {
  return (
    <section className="section">
      <div className="wrap">
        <SupportForm />
        <p className="mt-6 text-meta text-ink-soft">
          Можно написать и на почту:{" "}
          <a href="mailto:online@czmashuk.ru" className="font-semibold text-navy">
            online@czmashuk.ru
          </a>
        </p>
      </div>
    </section>
  );
}
