import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { PracticeList } from "@/components/practices/PracticeList";
import { BEST_PRACTICES } from "@/lib/best-practices";

export const metadata: Metadata = {
  title: "База лучших наставнических практик",
  description:
    "База-реестр лучших наставнических практик — победители федерального конкурса «Наставничество». Центр знаний «Машук».",
};

export default function BestPracticePage() {
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">Методические материалы</p>
        <h1 className="section-title">База лучших наставнических практик</h1>
        <p className="lead mb-6 max-w-190">
          База-реестр лучших наставнических практик сформирована из числа победителей федерального
          конкурса «Наставничество» в рамках исполнения поручения Президента о создании на базе
          Центра знаний «Машук» федерального методического центра по развитию института
          наставничества.
        </p>
        <p className="mb-10 max-w-190 text-ui text-ink-soft">
          База лучших практик по развитию института наставничества в Российской Федерации размещена
          на портале цифровой информационной системы{" "}
          <a href="https://добро.рф/" target="_blank" rel="nofollow noopener" className="text-navy">
            ДОБРО.РФ
          </a>
          .
        </p>
        <div className="mb-10">
          <ButtonLink href="https://practices.edu.dobro.ru/" external>
            Все практики на ДОБРО.РФ
          </ButtonLink>
        </div>

        <PracticeList practices={BEST_PRACTICES} />
      </div>
    </section>
  );
}
