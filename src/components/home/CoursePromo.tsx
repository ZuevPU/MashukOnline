import Image from "next/image";
import Link from "next/link";

/**
 * Плашка нового курса на главной: «Искусственный интеллект в работе наставника».
 *
 * Синяя карточка с лисом-талисманом, меткой «Новый курс» и кнопкой на регистрацию
 * в LMS. Стоит сразу после первого экрана, до каталога программ.
 */
export function CoursePromo() {
  return (
    <section className="promo-course" aria-labelledby="ai-course-title">
      <div className="promo-course__ridge" aria-hidden="true">
        <svg viewBox="0 0 1200 260" preserveAspectRatio="none" fill="none">
          <path
            d="M0 210 L120 168 L240 214 L360 150 L480 208 L600 128 L720 200 L840 142 L960 206 L1080 160 L1200 214"
            stroke="rgba(168,217,247,.55)"
            strokeWidth="2"
          />
          <path
            d="M0 244 L120 206 L240 248 L360 190 L480 244 L600 172 L720 238 L840 186 L960 244 L1080 202 L1200 250"
            stroke="rgba(168,217,247,.28)"
            strokeWidth="1.6"
          />
        </svg>
      </div>

      <div className="promo-course__in">
        <div className="promo-course__body">
          <p className="promo-course__badge">
            <i aria-hidden="true" /> Новый курс
          </p>

          <h2 className="promo-course__title" id="ai-course-title">
            Искусственный интеллект
            <br />в работе <em>наставника</em>
          </h2>

          <p className="promo-course__lead">
            Шесть модулей о том, как встроить ИИ в ежедневную практику: готовить тексты и документы,
            планировать встречи, собирать презентации и рабочие листы, делать квизы и трекеры без
            программирования — с проверкой результата и заботой о персональных данных.
          </p>

          <ul className="promo-course__facts">
            <li>6 модулей</li>
            <li>4 направления</li>
            <li>практикумы и шаблоны</li>
            <li>сертификат</li>
          </ul>

          <div className="promo-course__actions">
            <a
              className="promo-course__btn promo-course__btn--main"
              href="https://lms.mashuk.online/education/listener/course_sessions/iskusstvennyi-intellekt-v-rabote-nastavnika-11-12/register"
              target="_blank"
              rel="noopener"
            >
              Начать обучение
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
            <Link className="promo-course__btn promo-course__btn--ghost" href="/programs">
              Все программы
            </Link>
          </div>
        </div>

        <div className="promo-course__fox">
          <Image
            src="/brand/mascot/maskot_right-trim.png"
            alt="Лис — талисман Центра знаний «Машук»"
            width={900}
            height={936}
            sizes="(max-width: 900px) 60vw, 340px"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
