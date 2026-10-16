import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function SiteFooter() {
  return (
    <footer id="support" className="mesh py-14">
      <div className="wrap grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <p className="eyebrow eyebrow--light">Поддержка</p>
          <h2 className="m-0 mb-3 font-display text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.03em] text-white">
            Техническая поддержка
          </h2>
          <p className="m-0 max-w-105 text-ui font-light leading-relaxed text-white/72">
            Вопросы по онлайн-обучению и доступу к платформе — напишите нам, мы поможем.
          </p>
          <p className="mt-5">
            <a
              href="mailto:online@czmashuk.ru"
              className="font-display text-lead font-semibold text-white no-underline shadow-[0_1px_0_0_rgba(255,255,255,0.4)]"
            >
              online@czmashuk.ru
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <BrandLogo variant="fullWhite" width={170} />
          <p className="m-0 text-meta text-white/66">Знания на высоте · Учим тех, кто учит</p>
          <nav className="flex flex-wrap gap-4 text-meta text-white/72 md:justify-end">
            <a href="https://центрзнаниймашук.рф/" target="_blank" rel="nofollow noopener" className="no-underline hover:text-white">
              О Центре
            </a>
            <a href="https://lms.mashuk.online/" target="_blank" rel="noopener" className="no-underline hover:text-white">
              Онлайн-курсы
            </a>
            <Link href="/courses" className="no-underline hover:text-white">
              Программы
            </Link>
            <Link href="/privacy" className="no-underline hover:text-white">
              Политика конфиденциальности
            </Link>
          </nav>
          <p className="m-0 text-caption text-white/45">© 2026, АНО «Центр знаний «Машук»</p>
        </div>
      </div>
    </footer>
  );
}
