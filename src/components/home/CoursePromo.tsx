import Image from "next/image";

/**
 * Плашка нового курса на главной: «Искусственный интеллект в работе наставника».
 *
 * Стиль — из визуальной концепции курса: кремовый фон, тонкая красная рамка,
 * синий заголовок, пилюли с ролями и цифровой маскот в голубом круге.
 */
export function CoursePromo() {
  return (
    <section className="course-card" aria-labelledby="ai-course-title">
      <div className="course-card__in">
        <div className="course-card__body">
          <p className="course-card__eyebrow">
            <i aria-hidden="true" /> Онлайн-курс · старт открыт
          </p>

          <h2 className="course-card__title" id="ai-course-title">
            Искусственный интеллект
            <br />в работе <em>наставника</em>
          </h2>

          <p className="course-card__lead">
            Шесть модулей о том, как встроить ИИ в ежедневную практику: тексты и документы, планы
            встреч, презентации, рабочие листы, квизы и трекеры — с проверкой результата.
          </p>

          <ul className="course-card__chips">
            <li className="course-card__chip course-card__chip--accent">Конструктор промтов</li>
            <li className="course-card__chip">Редактор</li>
            <li className="course-card__chip">Дизайнер</li>
            <li className="course-card__chip">Менеджер</li>
          </ul>

          <div className="course-card__actions">
            <a
              className="course-card__btn course-card__btn--blue"
              href="https://lms.mashuk.online/education/listener/course_sessions/iskusstvennyi-intellekt-v-rabote-nastavnika-11-12/register"
              target="_blank"
              rel="noopener"
            >
              Начать обучение
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
            <a
              className="course-card__btn course-card__btn--line"
              href="https://lms.mashuk.online/education/listener/course_sessions/iskusstvennyi-intellekt-v-rabote-nastavnika-11-12/register"
              target="_blank"
              rel="noopener"
            >
              Программа курса
            </a>
          </div>
        </div>

        <div className="course-card__media">
          <div className="course-card__circle" aria-hidden="true" />
          <div className="course-card__robot">
            <Image
              src="/brand/mascot/promo-robot.png"
              alt="Цифровой помощник — робот с планшетом и клавиатурой"
              width={760}
              height={806}
              sizes="(max-width: 900px) 60vw, 260px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
