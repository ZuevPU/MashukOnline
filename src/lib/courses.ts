import type { SeasonKey } from "./types";

/**
 * Витрина онлайн-курсов Центра знаний «Машук».
 *
 * Курсы проходят на внешнем портале обучения (lms.mashuk.online): карточка
 * ведёт на страницу регистрации. Данные статические — их видно без базы.
 */

export interface Course {
  slug: string;
  title: string;
  description: string;
  url: string;
  /** Направление — метка на карточке */
  tag: string;
  /** Ключ иконки (см. CourseCard) */
  icon: string;
  /** Сезонный акцент оформления */
  season: SeasonKey;
}

export const COURSES: Course[] = [
  {
    slug: "kinopedagogika",
    title: "Кинопедагогика",
    description:
      "Как превратить просмотр фильма в пространство для размышления, диалога и собственного открытия. Курс поможет использовать отечественное кино как образовательный и воспитательный инструмент: выбирать фильмы и фрагменты под конкретную задачу, анализировать киноязык, задавать вопросы, организовывать обсуждение и проектировать собственные кинозанятия.",
    url: "https://lms.mashuk.online/education/listener/course_sessions/kinopedagogika-10-05/register",
    tag: "Медиа и кино",
    icon: "film",
    season: "autumn",
  },
  {
    slug: "nastavnichestvo-tsifrovaya-sreda",
    title: "Наставничество в цифровой среде: практические инструменты и безопасность",
    description:
      "Цифровая среда меняет правила профессиональной коммуникации. Сегодня организации сталкиваются не только с техническими угрозами, но и с информационной перегрузкой, фейками, конфликтами в онлайн-пространстве, рисками при использовании искусственного интеллекта и снижением доверия аудитории.",
    url: "https://lms.mashuk.online/education/listener/course_sessions/nastavnichestvo-v-tsifrovoi-srede-prakticheskie-instrumenty-i-bezopasnost-07-27/register",
    tag: "Наставничество",
    icon: "shield",
    season: "winter",
  },
  {
    slug: "molodezhnye-programmy",
    title: "Молодёжные образовательные программы: от проектирования результата к системной реализации",
    description:
      "Курс по системному проектированию образовательных программ: от целей до измеримых результатов. Освойте полный цикл создания мероприятий с практическими инструментами для командной и индивидуальной работы.",
    url: "https://lms.mashuk.online/education/listener/course_sessions/molodyozhnye-obrazovatelnye-programmy-ot-proektirovaniya-rezultata-k-sistemnoi-realizatsii-09-01/register",
    tag: "Управление в образовании",
    icon: "route",
    season: "summer",
  },
  {
    slug: "pedagogika-buduschego",
    title: "Педагогика будущего: внедрение современных технологий в образовательный процесс",
    description:
      "Онлайн-курс посвящён практическому применению современных цифровых технологий и искусственного интеллекта в образовательной деятельности.",
    url: "https://lms.mashuk.online/education/listener/course_sessions/pedagogika-buduschego-vnedrenie-sovremennyh-tehnologii-v-obrazovatelnyi-protsess-07-20/register",
    tag: "Цифровые компетенции",
    icon: "cpu",
    season: "spring",
  },
  {
    slug: "pedagogicheskii-marafon",
    title: "Педагогический марафон: путь в профессию",
    description:
      "Онлайн-курс для педагогов: адаптация в профессии, первые шаги и поддержка наставников.",
    url: "https://lms.mashuk.online/education/listener/course_sessions/pedagogicheskii-marafon-put-pedagoga-08-24/register",
    tag: "Наставничество",
    icon: "compass",
    season: "autumn",
  },
  {
    slug: "patriotizm",
    title: "Патриотизм: воспитание в цифровую эпоху",
    description:
      "Онлайн-курс для педагогов и наставников о патриотизме в цифровую эпоху. Вы узнаете современные методы воспитания, освоите медиаграмотность и получите практические инструменты для работы с молодёжью.",
    url: "https://lms.mashuk.online/listener/course_sessions/patriotizm-vospitanie-v-tsifrovuu-epohu-09-16-1200/register",
    tag: "Воспитание",
    icon: "flag",
    season: "winter",
  },
  {
    slug: "instrumenty-nastavnika",
    title: "Инструменты наставника",
    description:
      "Онлайн-курс: современные подходы, методики и цифровые решения для педагогов-наставников. От культурного кода до искусственного интеллекта.",
    url: "https://lms.mashuk.online/listener/course_sessions/instrumenty-nastavnika-shkola-09-12/register",
    tag: "Наставничество",
    icon: "wrench",
    season: "summer",
  },
  {
    slug: "roditelskaya-akademiya",
    title: "Родительская Академия",
    description:
      "«Родительская Академия» — это пространство для диалога о семье как основе передачи культуры, идентичности и ценностей. Мы говорим о том, как в повседневных разговорах, традициях и совместных делах формируются устойчивость, доверие и уважение.",
    url: "https://lms.mashuk.online/listener/course_sessions/roditelskaya-akademiya-04-06/register",
    tag: "Работа с семьёй",
    icon: "users",
    season: "spring",
  },
  {
    slug: "letnii-pedsovet",
    title: "Семинар-практикум Летний ПедСовет",
    description:
      "Как говорить с молодёжью о ценностях без формальности и назидания? Как создавать события, которые не просто знакомят участников с культурой и историей страны, а помогают почувствовать свою причастность к ним? Как превратить городское пространство, совместную деятельность и живые истории в инструменты воспитания?",
    url: "https://lms.mashuk.online/listener/course_sessions/seminar-praktikum-letnii-pedsovet-2026-07-24/register",
    tag: "ПедСоветы",
    icon: "sun",
    season: "summer",
  },
  {
    slug: "vesennii-pedsovet",
    title: "Семинар-практикум Весенний ПедСовет",
    description:
      "1 мая стартует онлайн-курс по итогам «Весеннего ПедСовета». Мы собрали не сухие теории, а рабочий навигатор по цифровой педагогике: только проверенные инструменты, реальные кейсы и стратегии внедрения от экспертов, которые применяют их в школах и вузах уже сегодня.",
    url: "https://lms.mashuk.online/listener/course_sessions/seminar-praktikum-vesennii-pedsovet-2026-05-01/register",
    tag: "ПедСоветы",
    icon: "flower",
    season: "spring",
  },
  {
    slug: "zimnii-pedsovet",
    title: "Семинар-практикум Зимний ПедСовет",
    description:
      "Онлайн-семинар-практикум для педагогов и студентов, где вы освоите современные инструменты работы с молодёжью через вовлечённость, уникальные методики и обмен профессиональным опытом.",
    url: "https://lms.mashuk.online/listener/course_sessions/seminar-praktikum-zimnii-pedsovet-03-02/register",
    tag: "ПедСоветы",
    icon: "snow",
    season: "winter",
  },
  {
    slug: "vvedenie-v-spetsialnost",
    title: "Введение в специальность",
    description:
      "Онлайн-курс для студентов педвузов, помогающий осознанно выбрать профессию и понять первые шаги в образовательной практике.",
    url: "https://lms.mashuk.online/listener/course_sessions/vvedenie-v-spetsialnost-09-03-1600/register",
    tag: "Профориентация",
    icon: "cap",
    season: "autumn",
  },
];

/** Методические материалы: курсы и база практик. */
export const MATERIALS: { title: string; description: string; url: string; label: string }[] = [
  {
    title: "Педагогический марафон: путь в профессию",
    description: "Онлайн-курс для педагогов: адаптация в профессии, первые шаги и поддержка наставников.",
    url: "https://lms.mashuk.online/listener/course_sessions/pedagogicheskii-marafon-put-pedagoga-08-24/register",
    label: "Изучать",
  },
  {
    title: "База лучших наставнических практик",
    description:
      "База-реестр лучших наставнических практик сформирована из числа победителей федерального конкурса «Наставничество» в рамках исполнения поручения Президента о создании на базе Центра знаний «Машук» федерального методического центра по развитию института наставничества.",
    url: "https://mashuk.online/bestpractice",
    label: "Изучать",
  },
];
