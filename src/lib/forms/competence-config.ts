import type { FormConfig } from "./types";
import { DISTRICTS, REGIONS } from "./muni-data";

const opts = (...labels: string[]) => labels.map((label) => ({ value: label, label }));

/**
 * Регистрационная форма участника Всероссийского семинара «Профессиональное
 * развитие государственных служащих, обеспечивающих реализацию государственной
 * национальной политики».
 *
 * Анкета открывается на странице `/competence` (авторская сборка): форма на
 * странице отправляет данные сюда, а заявки видны в админке в разделе
 * «Competence».
 */
export const competenceConfig: FormConfig = {
  id: "competence",
  endpoint: "/api/forms/competence",
  kicker: "Регистрация",
  title: "Регистрационная форма участника",
  lead:
    "Всероссийский семинар «Профессиональное развитие государственных служащих, " +
    "обеспечивающих реализацию государственной национальной политики».",
  facts: [
    "Формат: очный",
    "Место: Центр знаний «Машук», Пятигорск",
    "Возраст: от 18 лет",
    "Даты: 28 ноября — 1 декабря 2026",
  ],
  sections: [
    {
      title: "Общая информация",
      fields: [
        { name: "fio", label: "ФИО", hint: "как в паспорте", type: "text", required: true, maxLength: 200, wide: true },
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
          type: "text",
          datalist: REGIONS,
          required: true,
        },
        { name: "city", label: "Город", type: "text", required: true, maxLength: 120 },
        { name: "birth_date", label: "Дата рождения", type: "date", required: true },
        { name: "workplace", label: "Место работы", type: "text", required: true, maxLength: 300 },
        { name: "position", label: "Должность", type: "text", required: true, maxLength: 200 },
        { name: "phone", label: "Контактный телефон", type: "tel", required: true, maxLength: 40 },
        { name: "email", label: "Электронный адрес", type: "email", required: true, maxLength: 254, wide: true },
        {
          name: "colleagues",
          label:
            "Есть ли среди Ваших коллег те, кто хочет тоже принять участие в семинаре? Если да, " +
            "напишите их ФИО, должность и контактный телефон. При появлении резервных мест мы " +
            "рассмотрим возможность их участия в семинаре.",
          type: "textarea",
          maxLength: 1000,
          wide: true,
        },
      ],
    },
    {
      title: "Прибытие",
      fields: [
        { name: "arrival_date", label: "Дата прибытия", type: "date" },
        { name: "arrival_time", label: "Время прибытия", hint: "не позднее 15:30", type: "text", maxLength: 20 },
        { name: "arrival_place", label: "Место прибытия", type: "text", maxLength: 200 },
        { name: "arrival_flight", label: "Номер рейса / поезда прибытия", type: "text", maxLength: 60 },
      ],
    },
    {
      title: "Отбытие",
      fields: [
        { name: "departure_from", label: "Отбытие (откуда)", type: "text", maxLength: 200 },
        { name: "departure_flight", label: "Номер рейса / поезда отбытия", type: "text", maxLength: 60 },
        { name: "departure_date", label: "Дата отбытия", type: "date" },
        { name: "departure_time", label: "Время вылета / отправления", hint: "не ранее 11:00", type: "text", maxLength: 20 },
      ],
    },
    {
      title: "Проживание",
      fields: [
        {
          name: "accommodation",
          label:
            "Если Вы планируете бронировать проживание в Центре, поставьте соответствующую отметку",
          hint:
            "Проживание в гостиничном комплексе Центра знаний «Машук»: 2 500 ₽ с человека " +
            "при двухместном размещении",
          type: "radio",
          options: opts(
            "Да, планирую проживать в гостиничном комплексе Центра",
            "Нет, планирую проживать за территорией Центра",
          ),
          required: true,
          wide: true,
        },
        {
          name: "accommodation_note",
          label: "Комментарий по размещению",
          hint:
            "Если хотите жить в двухместном номере с конкретным коллегой — укажите его ФИО. " +
            "По возможности учтём пожелание при расселении",
          type: "text",
          maxLength: 300,
          wide: true,
        },
      ],
    },
    {
      title: "Согласие",
      fields: [
        {
          name: "agree_consent",
          label:
            "Отправляя форму, вы подтверждаете согласие на обработку персональных данных " +
            "в соответствии с политикой конфиденциальности",
          type: "checkboxes",
          options: opts("Да"),
          required: true,
          wide: true,
        },
      ],
    },
  ],
  files: [],
  submitLabel: "Подтвердить участие",
  successTitle: "Заявка отправлена",
  successText: "Спасибо! Подтверждение поступит организаторам семинара.",
  programSlug: "competence",
};
