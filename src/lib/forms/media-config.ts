import type { FormConfig } from "./types";
import { DISTRICTS, REGIONS } from "./muni-data";

const opts = (...labels: string[]) => labels.map((label) => ({ value: label, label }));

/** Метка потока для фильтра и выгрузок: у медиапрограммы один срок проведения. */
export const MEDIA_STREAM = "25 — 28 ноября 2026";

/**
 * Заявка участника образовательного семинара «Медиакомпетенции в сфере
 * межнациональных отношений: этика, инструменты, практики».
 *
 * Анкета по редакции от 10.11.2026: расширенная общая информация (округ,
 * регион, СНИЛС, ИНН, место работы, аккаунт MAX), блок об опыте с мотивацией
 * до 500 символов и ссылкой на портфолио, категория участника и необязательный
 * блок «Письмо-вызов».
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
          hint: "XXXXXXXXXXXX",
          type: "text",
          required: true,
          maxLength: 20,
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
          name: "phone",
          label: "Контактный телефон",
          type: "tel",
          required: true,
          maxLength: 40,
        },
        {
          name: "max_account",
          label: "Аккаунт в MAX",
          hint:
            "Коммуникация с участниками будет в этом мессенджере. В настройках профиля разрешите " +
            "добавление вас в чат программы на случай успешного прохождения отбора.",
          type: "text",
          required: true,
          maxLength: 300,
          wide: true,
        },
        {
          name: "email",
          label: "Электронная почта",
          hint: "Обязательно проверьте корректность: на этот адрес придёт статус заявки",
          type: "email",
          required: true,
          maxLength: 254,
          wide: true,
        },
      ],
    },
    {
      title: "Информация об опыте",
      fields: [
        {
          name: "motivation",
          label: "Опишите кратко свою мотивацию принять участие именно в этом мероприятии",
          hint: "почему для вас это важно — до 500 символов",
          type: "textarea",
          required: true,
          maxLength: 500,
          wide: true,
        },
        {
          name: "experience",
          label: "Расскажите о своём профессиональном опыте",
          type: "textarea",
          required: true,
          maxLength: 3000,
          wide: true,
        },
        {
          name: "portfolio",
          label: "Ссылка на портфолио с вашими достижениями",
          hint:
            "Портфолио должно содержать примеры по теме межнациональных и межконфессиональных " +
            "отношений: видео, аудио, публикации, блоги, подкасты, медиапроекты, а также дипломы " +
            "и сертификаты. Загрузите на облако (Яндекс.Диск, Облако Mail.ru) и прикрепите ссылку",
          type: "text",
          required: true,
          maxLength: 500,
          wide: true,
        },
      ],
    },
    {
      title: "Информация о себе",
      fields: [
        {
          name: "category",
          label: "Выберите категорию, к которой Вы относитесь",
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
      title: "Письмо-вызов (при необходимости)",
      fields: [
        {
          name: "org_legal_name",
          label: "Полное наименование Вашей организации",
          type: "text",
          maxLength: 300,
          wide: true,
        },
        {
          name: "head_position",
          label: "Должность руководителя организации",
          type: "text",
          maxLength: 200,
        },
        {
          name: "head_fio",
          label: "Фамилия, имя и отчество руководителя организации",
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
            "Регистрируясь, даю согласие на обработку предоставленных мной персональных данных " +
            "в соответствии с требованиями статьи 9 Федерального закона от 27.07.2006 № 152-ФЗ " +
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
  successText: "Спасибо! Статус заявки придёт на указанную электронную почту.",
  programSlug: "mediakompetencii-2026",
};
