import type { FormConfig } from "./types";

const opts = (...labels: string[]) => labels.map((label) => ({ value: label, label }));

const OTHER = "Другое";

/**
 * Регистрация на образовательное мероприятие «Медиакомпетенции в сфере
 * межнациональных отношений: этика, инструменты, практики».
 */
export const mediaConfig: FormConfig = {
  id: "media",
  endpoint: "/api/forms/media",
  kicker: "Регистрация",
  title:
    "Регистрация на мероприятие «Медиакомпетенции в сфере межнациональных отношений: этика, инструменты, практики»",
  lead:
    "Четырёхдневная очная программа для журналистов, блогеров, создателей контента, " +
    "специалистов по связям с общественностью и сотрудников этнических и региональных СМИ.",
  facts: [
    "Формат: очно, четыре дня",
    "Место: г. Пятигорск, Центр знаний «Машук»",
    "Даты: 25–28 ноября 2026",
    "Возраст: от 18 лет",
  ],
  sections: [
    {
      title: "О себе",
      fields: [
        { name: "fio", label: "ФИО", hint: "как в паспорте", type: "text", required: true, maxLength: 200, wide: true },
        { name: "birth_date", label: "Дата рождения", type: "date", required: true },
        { name: "country", label: "Страна проживания", type: "text", required: true, maxLength: 120 },
        { name: "city", label: "Город", type: "text", required: true, maxLength: 120 },
        { name: "email", label: "E-mail", type: "email", required: true, maxLength: 254 },
        { name: "phone", label: "Контактный телефон", type: "tel", required: true, maxLength: 40 },
        {
          name: "messenger",
          label: "Предпочтительный мессенджер для связи",
          type: "checkboxes",
          options: opts("Telegram", "WhatsApp", "MAX", OTHER),
          required: true,
        },
        { name: "messenger_link", label: "Ссылка на мессенджер", type: "text", maxLength: 300 },
        {
          name: "org_name",
          label: "Издание / организация, которую Вы представляете",
          type: "text",
          required: true,
          maxLength: 300,
          wide: true,
        },
        { name: "position", label: "Ваша должность и роль", type: "text", required: true, maxLength: 200, wide: true },
        {
          name: "media_type",
          label: "Какая сфера деятельности Вам ближе?",
          type: "checkboxes",
          options: opts(
            "Журналистика",
            "Блоги и авторский контент",
            "Создание контента",
            "Связи с общественностью",
            "Этнические и региональные СМИ",
            OTHER,
          ),
          required: true,
        },
        {
          name: "media_type_other",
          label: "Если выбрали «Другое», уточните",
          type: "text",
          maxLength: 200,
        },
        {
          name: "stream",
          label: "Даты участия в соответствии с приглашением",
          type: "radio",
          options: opts("25–28 ноября 2026 года"),
        },
      ],
    },
    {
      title: "Мотивация и материалы",
      fields: [
        {
          name: "why",
          label: "Почему для Вас важно принять участие в мероприятии?",
          type: "textarea",
          required: true,
          minLength: 200,
          maxLength: 3000,
          wide: true,
        },
        {
          name: "links",
          label: "Ссылки на материалы, портфолио или публикации",
          hint: "Публикации, блоги, портфолио — по одной на строку",
          type: "textarea",
          maxLength: 2000,
          wide: true,
        },
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
            "Даю согласие на обработку персональных данных для организации участия в мероприятии",
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
  successText: "Спасибо! Мы свяжемся с Вами по указанным контактам.",
  programSlug: "mediakompetencii-2026",
};
