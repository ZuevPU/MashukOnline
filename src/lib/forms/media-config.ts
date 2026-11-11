import type { FormConfig } from "./types";
import { DISTRICTS, REGIONS } from "./muni-data";

const opts = (...labels: string[]) => labels.map((label) => ({ value: label, label }));

/** Метка потока для фильтра и выгрузок: у медиапрограммы один срок проведения. */
export const MEDIA_STREAM = "25 — 28 ноября 2026";

/**
 * Заявка участника образовательного семинара «Медиакомпетенции в сфере
 * межнациональных отношений: этика, инструменты, практики».
 *
 * Анкета по редакции от 10.11.2026. Форма живёт прямо на лендинге
 * /mediacompetencies, поэтому блоки идут в порядке заполнения: общие данные,
 * контакты, опыт, необязательное письмо-вызов и согласия. Подсказки короткие:
 * длинные пояснения отнимают у полей внимание.
 */
export const mediaConfig: FormConfig = {
  id: "media",
  endpoint: "/api/forms/media",
  kicker: "Регистрация",
  title:
    "Заявка участника образовательного семинара «Медиакомпетенции в сфере межнациональных отношений: этика, инструменты, практики»",
  lead:
    "Очная программа для журналистов, блогеров, создателей контента, специалистов " +
    "по связям с общественностью и сотрудников этнических и региональных СМИ.",
  facts: [
    "Формат мероприятия: очный",
    "Место проведения: Россия, Ставропольский край, город-курорт Пятигорск, Пионерлагерная ул., зд. 8в",
    "Возраст участников: от 18 лет",
    "Даты проведения: 25 – 28 ноября 2026 года",
  ],
  finance: {
    title: "Финансовые условия участия",
    lead:
      "Организационный взнос отсутствует. Принимающая сторона (АНО «ЦЕНТР ЗНАНИЙ «МАШУК»») " +
      "берёт на себя расходы по:",
    items: [
      "проживанию и питанию в период проведения семинара;",
      "участию во всех образовательных и культурных мероприятиях.",
    ],
  },
  sections: [
    {
      title: "Общая информация",
      fields: [
        {
          name: "fio",
          label: "ФИО",
          hint: "как в паспорте",
          type: "text",
          required: true,
          maxLength: 200,
          wide: true,
        },
        {
          name: "birth_date",
          label: "Дата рождения",
          type: "date",
          required: true,
        },
        {
          name: "snils",
          label: "СНИЛС",
          hint: "XXX-XXX-XXX XX",
          type: "text",
          required: true,
          maxLength: 20,
        },
        {
          name: "inn",
          label: "ИНН",
          hint: "12 цифр",
          type: "text",
          required: true,
          maxLength: 20,
        },
        {
          name: "federal_district",
          label: "Федеральный округ",
          type: "select",
          options: opts(...DISTRICTS),
          required: true,
        },
        {
          name: "region",
          label: "Регион проживания",
          hint: "выберите субъект из списка",
          placeholder: "Начните вводить название",
          type: "text",
          datalist: REGIONS,
          required: true,
        },
        {
          name: "city",
          label: "Город проживания",
          type: "text",
          required: true,
          maxLength: 120,
        },
        {
          name: "workplace",
          label: "Место работы / учёбы",
          type: "text",
          required: true,
          maxLength: 300,
          wide: true,
        },
        {
          name: "position",
          label: "Должность / курс обучения",
          type: "text",
          required: true,
          maxLength: 200,
        },
        {
          name: "category",
          label: "Категория участника",
          hint: "выберите ту, что ближе к вашей работе",
          type: "radio",
          options: opts(
            "Этнические и межэтнические журналисты",
            "Этноблогеры и создатели контента по теме межнациональных и межконфессиональных отношений",
            "Специалисты по связям с общественностью в сфере межнациональных отношений",
            "Сотрудники этнических и региональных средств массовой информации",
            "Представители, чья профессиональная деятельность связана с освещением тематики межнациональных и межконфессиональных отношений в медиа и социальных сетях",
          ),
          required: true,
          wide: true,
        },
      ],
    },
    {
      title: "Контакты",
      fields: [
        {
          name: "phone",
          label: "Контактный телефон",
          type: "tel",
          required: true,
          maxLength: 40,
        },
        {
          name: "email",
          label: "Электронная почта",
          hint: "На этот адрес придёт статус заявки — проверьте написание.",
          type: "email",
          required: true,
          maxLength: 254,
        },
        {
          name: "max_account",
          label: "Аккаунт в MAX",
          hint:
            "Коммуникация с участниками — в мессенджере MAX. В настройках профиля " +
            "разрешите добавление в чат программы.",
          type: "text",
          required: true,
          maxLength: 300,
          wide: true,
        },
      ],
    },
    {
      title: "Опыт и мотивация",
      fields: [
        {
          name: "motivation",
          label: "Почему вам важно участвовать в этом семинаре",
          hint: "коротко, до 500 символов",
          type: "textarea",
          required: true,
          maxLength: 500,
          wide: true,
        },
        {
          name: "experience",
          label: "Ваш профессиональный опыт",
          hint: "Где работаете, какие темы ведёте, что уже сделали в медиа.",
          type: "textarea",
          required: true,
          maxLength: 3000,
          wide: true,
        },
        {
          name: "portfolio",
          label: "Ссылка на портфолио",
          hint:
            "Облако (Яндекс.Диск, Облако Mail.ru) с примерами работ по теме, " +
            "публикациями, дипломами и сертификатами.",
          type: "text",
          required: true,
          maxLength: 500,
          wide: true,
        },
      ],
    },
    {
      title: "Письмо-вызов (если нужно)",
      collapsible: true,
      fields: [
        {
          name: "org_legal_name",
          label: "Полное наименование организации",
          type: "text",
          maxLength: 300,
          wide: true,
        },
        {
          name: "head_position",
          label: "Должность руководителя",
          type: "text",
          maxLength: 200,
        },
        {
          name: "head_fio",
          label: "ФИО руководителя",
          type: "text",
          maxLength: 200,
        },
        {
          name: "org_email",
          label: "E-mail организации для письма-вызова",
          type: "email",
          maxLength: 254,
          wide: true,
        },
      ],
    },
    {
      title: "Согласия",
      fields: [
        {
          name: "agree_truth",
          label: "Подтверждаю достоверность предоставленных данных",
          type: "checkboxes",
          options: opts("Да"),
          required: true,
          wide: true,
        },
        {
          name: "agree_consent",
          label:
            "Даю согласие на обработку предоставленных мной персональных данных " +
            "в соответствии со статьёй 9 Федерального закона от 27.07.2006 № 152-ФЗ " +
            "«О персональных данных»",
          type: "checkboxes",
          options: opts("Да"),
          required: true,
          wide: true,
        },
      ],
    },
  ],
  files: [],
  submitLabel: "Отправить заявку",
  successTitle: "Заявка отправлена",
  successText:
    "Спасибо! Статус заявки придёт на указанную электронную почту. Если письма нет — проверьте папку «Спам».",
  programSlug: "mediakompetencii-2026",
};
