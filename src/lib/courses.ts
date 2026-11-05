import type { SeasonKey } from "./types";

/**
 * Витрина онлайн-курсов Центра знаний «Машук».
 *
 * Курсы проходят на внешнем портале обучения (lms.mashuk.online): карточка
 * ведёт на страницу регистрации. Обложки — оригинальные изображения с сайта
 * «Цифровой Машук», сохранённые локально (public/courses).
 */

export interface Course {
  slug: string;
  title: string;
  description: string;
  url: string;
  /** Направление — метка на карточке */
  tag: string;
  /** Обложка карточки (файл в public/courses) */
  image: string;
  /** Ключ иконки-запаски (см. CourseCard), если нет обложки */
  icon: string;
  /** Сезонный акцент оформления */
  season: SeasonKey;
}

export const COURSES: Course[] = [
  {
    slug: "russkii-kod",
    title: "Русский код: культура, идентичность, слово",
    description:
      "«Русский код» — просветительский онлайн-курс Центра знаний «Машук» о связи культуры, языка и человека. Пять авторских лекций приглашают проследить эту связь: от произведений классиков и историй повседневных вещей до молодёжного сленга, переписки в мессенджерах и нашего собственного выбора слов.",
    url: "https://lms.mashuk.online/education/listener/course_sessions/russkii-kod-kultura-identichnost-slovo-11-04/register",
    tag: "Культура и язык",
    image: "/courses/russkii-kod.jpg",
    icon: "book",
    season: "autumn",
  },
  {
    slug: "kinopedagogika",
    title: "Кинопедагогика",
    description:
      "Как превратить просмотр фильма в пространство для размышления, диалога и собственного открытия. Курс поможет использовать отечественное кино как образовательный и воспитательный инструмент: выбирать фильмы и фрагменты под конкретную задачу, анализировать киноязык, задавать вопросы, организовывать обсуждение и проектировать собственные кинозанятия.",
    url: "https://lms.mashuk.online/education/listener/course_sessions/kinopedagogika-10-05/register",
    tag: "Медиа и кино",
    image: "/courses/kinopedagogika.jpg",
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
    image: "/courses/nastavnichestvo.webp",
    icon: "shield",
    season: "winter",
  },
  {
    slug: "molodezhnye-programmy",
    title: "Молодёжные образовательные программы: от проектирования результата к системной реализации",
    description:
      "Курс по системному проектированию образовательных программ: от целей до измеримых результатов. Освойте полный цикл создания мероприятий с практическими инструментами для командной и индивидуальной работы.",
    url: "https://lms.mashuk.online/education/listener/course_sessions/molodyozhnye-obrazovatelnye-programmy-ot-proektirovaniya-rezultata-k-sistemnoi-realizatsii-11-01/register",
    tag: "Управление в образовании",
    image: "/courses/molodezhnye-programmy.jpg",
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
    image: "/courses/pedagogika-buduschego.jpg",
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
    image: "/courses/pedagogicheskii-marafon.jpg",
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
    image: "/courses/patriotizm.png",
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
    image: "/courses/instrumenty-nastavnika.png",
    icon: "wrench",
    season: "summer",
  },
  {
    slug: "vvedenie-v-spetsialnost",
    title: "Введение в специальность",
    description:
      "Онлайн-курс для студентов педвузов, помогающий осознанно выбрать профессию и понять первые шаги в образовательной практике.",
    url: "https://lms.mashuk.online/listener/course_sessions/vvedenie-v-spetsialnost-09-03-1600/register",
    tag: "Профориентация",
    image: "/courses/vvedenie-v-spetsialnost.jpg",
    icon: "cap",
    season: "autumn",
  },
];

/** Курс «Педагогический марафон: путь в профессию» — на него ведёт кнопка «Онлайн-курсы» в «Материалах». */
export const MARATHON_URL =
  "https://lms.mashuk.online/listener/course_sessions/pedagogicheskii-marafon-put-pedagoga-08-24/register";

/** Методические материалы: курсы и база практик. */
export const MATERIALS: { title: string; description: string; url: string; label: string }[] = [
  {
    title: "Педагогический марафон: путь в профессию",
    description: "Онлайн-курс для педагогов: адаптация в профессии, первые шаги и поддержка наставников.",
    url: MARATHON_URL,
    label: "Изучать",
  },
  {
    title: "База лучших наставнических практик",
    description:
      "База-реестр лучших наставнических практик сформирована из числа победителей федерального конкурса «Наставничество» в рамках исполнения поручения Президента о создании на базе Центра знаний «Машук» федерального методического центра по развитию института наставничества.",
    url: "/bestpractice",
    label: "Изучать",
  },
];
