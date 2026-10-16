import type { FormConfig } from "./types";
import { DISTRICTS, REGIONS } from "./muni-data";

const opts = (...labels: string[]) => labels.map((label) => ({ value: label, label }));

/**
 * Заявка участника образовательного мероприятия «Межнациональные и
 * межконфессиональные отношения в деятельности муниципалитетов».
 * Данные проверяются (СНИЛС, ИНН, регион), согласие — PDF-бланк.
 */
export const muniConfig: FormConfig = {
  id: "muni",
  endpoint: "/api/forms/muni",
  kicker: "Заявка",
  title:
    "Заявка участника «Межнациональные и межконфессиональные отношения в деятельности муниципалитетов»",
  lead:
    "Образовательное мероприятие для муниципальных служащих и специалистов органов " +
    "местного самоуправления.",
  paragraphs: [
    "Образовательное мероприятие «Межнациональные и межконфессиональные отношения в " +
      "деятельности муниципалитетов» предназначено для муниципальных служащих, " +
      "ответственных за реализацию государственной национальной политики, взаимодействие " +
      "с национально-культурными и религиозными объединениями, а также для специалистов " +
      "органов местного самоуправления.",
    "Участники обсудят приоритетные направления реализации Стратегии государственной " +
      "национальной политики Российской Федерации на муниципальном уровне, проанализируют " +
      "актуальные вызовы правоприменительной практики, освоят современные инструменты " +
      "мониторинга состояния межнациональных отношений и профилактики деструктивных проявлений.",
  ],
  facts: [
    "Форматы: очный",
    "Место: Россия, Ставропольский край, город-курорт Пятигорск, Пионерлагерная ул., зд. 8в",
    "Возраст: от 18 лет",
    "Даты: 13 – 16 ноября 2026 года",
  ],
  finance: {
    title: "Финансовые условия",
    lead:
      "Организационный взнос отсутствует. Принимающая сторона (АНО «ЦЕНТР ЗНАНИЙ «МАШУК»») " +
      "берёт на себя расходы по:",
    items: ["проживанию и питанию в период проведения семинара;", "участию во всех мероприятиях."],
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
          label: "Регион",
          hint: "выберите субъект из списка",
          placeholder: "Начните вводить название",
          type: "text",
          datalist: REGIONS,
          required: true,
        },
        {
          name: "city",
          label: "Город",
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
          name: "workplace",
          label: "Учебное заведение / место работы",
          type: "text",
          required: true,
          maxLength: 300,
          wide: true,
        },
        {
          name: "position",
          label: "Должность",
          type: "text",
          required: true,
          maxLength: 200,
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
          name: "phone",
          label: "Контактный телефон",
          type: "tel",
          required: true,
          maxLength: 40,
        },
        {
          name: "email",
          label: "Электронный адрес",
          hint: "name@domain.ru",
          type: "email",
          required: true,
          maxLength: 254,
        },
        {
          name: "stream",
          label: "Выберите даты участия в соответствии с датами в полученном приглашении",
          type: "radio",
          options: opts("13 – 16 ноября 2026 года"),
        },
        {
          name: "colleagues",
          label:
            "Есть ли среди Ваших коллег те, кто хочет тоже принять участие в семинаре? " +
            "Если да, напишите их ФИО, должность и контактный тел. При появлении " +
            "дополнительных мест мы рассмотрим возможность их участия в семинаре.",
          type: "textarea",
          maxLength: 1000,
          wide: true,
        },
      ],
    },
    {
      title: "Согласие и паспортные данные",
      fields: [
        {
          name: "address",
          label: "Адрес регистрации",
          hint: "нужен для автозаполнения бланка",
          type: "text",
          maxLength: 400,
          wide: true,
        },
        {
          name: "passport_series",
          label: "Серия паспорта",
          hint: "Необязательно: эти поля попадут в PDF-бланк",
          type: "text",
          maxLength: 40,
        },
        {
          name: "passport_number",
          label: "Номер паспорта",
          hint: "Необязательно: эти поля попадут в PDF-бланк",
          type: "text",
          maxLength: 40,
        },
        {
          name: "passport_issued",
          label: "Кем и когда выдан",
          type: "text",
          maxLength: 400,
          wide: true,
        },
        {
          name: "consent_confirm",
          label:
            "Подтверждаю, что подписал(а) согласие и загружаю подписанный документ",
          type: "checkboxes",
          options: opts("Да"),
          required: true,
        },
      ],
    },
  ],
  files: [
    {
      name: "consent_file",
      label: "Прикрепите подписанное согласие",
      hint: "PDF или фото, не более 20 МБ",
      accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
      required: true,
    },
  ],
  consents: { kind: "muni-pdf" },
  submitLabel: "Отправить заявку",
  successTitle: "Готово",
  successText: "Спасибо! Заявка отправлена.",
};
