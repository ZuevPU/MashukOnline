import type { FormConfig } from "./types";

const opts = (...labels: string[]) => labels.map((label) => ({ value: label, label }));

const YES = "Да";
const NO = "Нет";

const STREAM_OPTIONS = opts(
  "1 поток: 29 сентября — 2 октября",
  "2 поток: 11 — 14 октября",
  "3 поток: 27 — 30 октября",
  "4 поток: 30 октября — 2 ноября",
);

/**
 * Сбор информационных данных участников международного образовательного
 * семинара «Образование на высоте»: шесть шагов, включая документ, маршрут,
 * визу, здоровье и ответственность сторон. Требует скан паспорта.
 */
export const infoConfig: FormConfig = {
  id: "info",
  endpoint: "/api/forms/info",
  kicker: "Машук",
  title:
    "Сбор информационных данных участников международного образовательного семинара «Образование на высоте»",
  lead:
    "Центр знаний «Машук» поздравляет Вас и приглашает на Международный " +
    "образовательный семинар «Образование на высоте»!",
  paragraphs: [
    "Для дальнейшей организации Вашего участия необходимо заполнить форму сбора данных.",
  ],
  steps: [
    { label: "Общая информация" },
    { label: "Документ, удостоверяющий личность" },
    { label: "Маршрут" },
    { label: "Виза" },
    { label: "Здоровье и питание" },
    { label: "Ответственность сторон" },
  ],
  sections: [
    {
      fields: [
        {
          name: "fio_latin",
          label: "ФИО полностью",
          hint: "латиницей, строго как в документе",
          type: "text",
          required: true,
          maxLength: 200,
          step: 1,
        },
        {
          name: "gender",
          label: "Пол",
          type: "radio",
          options: opts("Мужской", "Женский"),
          required: true,
          step: 1,
        },
        {
          name: "citizenship",
          label: "Гражданство (основное)",
          type: "text",
          required: true,
          maxLength: 120,
          step: 1,
        },
        {
          name: "other_citizenships",
          label: "Есть ли у Вас другие гражданства?",
          type: "radio",
          options: opts(YES, NO),
          required: true,
          step: 1,
        },
        {
          name: "other_citizenships_detail",
          label: "При выборе ответа «Да», укажите все имеющиеся",
          type: "text",
          maxLength: 300,
          wide: true,
          showWhen: { field: "other_citizenships", equals: YES },
          step: 1,
        },
      ],
    },
    {
      title: "Документ, удостоверяющий вашу личность",
      fields: [
        {
          name: "id_doc_type",
          label: "Тип документа",
          type: "radio",
          options: opts(
            "Паспорт гражданина страны",
            "ID-карта",
            "Загранпаспорт",
            "Другое",
          ),
          required: true,
          step: 2,
        },
        {
          name: "id_doc_type_other",
          label: "При выборе «Другое», укажите свой вариант",
          type: "text",
          maxLength: 200,
          showWhen: { field: "id_doc_type", equals: "Другое" },
          step: 2,
        },
        {
          name: "id_doc_series",
          label: "Серия документа (при наличии)",
          hint: "если нет — укажите «нет»",
          type: "text",
          required: true,
          maxLength: 40,
          step: 2,
        },
        {
          name: "id_doc_number",
          label: "Номер документа",
          type: "text",
          required: true,
          maxLength: 40,
          step: 2,
        },
        {
          name: "id_doc_issued",
          label: "Дата выдачи документа",
          type: "date",
          required: true,
          step: 2,
        },
        {
          name: "id_doc_valid_to",
          label: "Срок действия документа",
          hint: "если бессрочный — укажите «бессрочно»",
          type: "text",
          required: true,
          maxLength: 40,
          step: 2,
        },
        {
          name: "id_doc_issuer",
          label: "Кем выдан",
          type: "text",
          required: true,
          maxLength: 400,
          wide: true,
          step: 2,
        },
        {
          name: "entry_doc_name",
          label:
            "Укажите документ, по которому Вы планируете въезд на территорию РФ",
          type: "text",
          required: true,
          maxLength: 200,
          wide: true,
          step: 2,
        },
        {
          name: "entry_doc_series",
          label: "Серия документа",
          hint: "если нет — укажите «нет»",
          type: "text",
          required: true,
          maxLength: 40,
          step: 2,
        },
        {
          name: "entry_doc_number",
          label: "Номер документа",
          type: "text",
          required: true,
          maxLength: 40,
          step: 2,
        },
        {
          name: "entry_doc_issued",
          label: "Дата выдачи документа",
          type: "date",
          required: true,
          step: 2,
        },
        {
          name: "entry_doc_valid_to",
          label: "Срок действия паспорта",
          hint: "если бессрочный — укажите «бессрочно»",
          type: "text",
          required: true,
          maxLength: 40,
          step: 2,
        },
        {
          name: "entry_doc_issuer",
          label: "Кем выдан",
          type: "text",
          required: true,
          maxLength: 400,
          wide: true,
          step: 2,
        },
      ],
    },
    {
      title: "Маршрут",
      fields: [
        {
          name: "stream",
          label: "Выберите дату потока",
          hint:
            "Программа потоков не отличается между собой. Обратите внимание! Даты могут быть " +
            "скорректированы с предварительным уведомлением участников и согласованием переноса " +
            "авиабилетов со стороны организатора.",
          type: "radio",
          options: STREAM_OPTIONS,
          required: true,
          step: 3,
        },
        {
          name: "depart_country",
          label: "Страна вылета / отправления",
          type: "text",
          required: true,
          maxLength: 120,
          step: 3,
        },
        {
          name: "depart_city",
          label: "Город вылета / отправления",
          type: "text",
          required: true,
          maxLength: 120,
          step: 3,
        },
        {
          name: "return_ticket",
          label: "Нужен ли обратный билет?",
          type: "radio",
          options: opts(YES, NO),
          required: true,
          step: 3,
        },
        {
          name: "baggage",
          label: "Нужен ли багаж?",
          type: "radio",
          options: opts(YES, "Нет (только ручная кладь)"),
          required: true,
          step: 3,
        },
      ],
    },
    {
      title: "Виза",
      fields: [
        {
          name: "visa_needed",
          label: "Требуется ли Вам виза для въезда в Россию?",
          hint:
            "Если Вы являетесь гражданином безвизовой страны, например, Беларуси или " +
            "Казахстана, выберите «Нет»",
          type: "radio",
          options: opts(YES, "Нет (безвизовый режим)"),
          required: true,
          step: 4,
        },
        {
          name: "visa_current",
          label:
            "Есть ли у Вас действующая виза в Россию на период проведения " +
            "образовательного семинара?",
          type: "radio",
          options: opts("Да, виза ещё действует", NO),
          required: true,
          step: 4,
        },
        {
          name: "visa_status",
          label: "Статус оформления визы",
          type: "radio",
          options: opts(
            "Документы поданы, ожидаю выдачу",
            "Нужна визовая поддержка от Организатора",
            "Оформлю самостоятельно, помощь не требуется",
          ),
          step: 4,
        },
      ],
    },
    {
      title: "Информация о состоянии здоровья и индивидуальных потребностях",
      fields: [
        {
          name: "allergies",
          label:
            "Есть ли у Вас аллергические реакции или непереносимость " +
            "(продуктов, лекарств, иных веществ)?",
          type: "radio",
          options: opts(YES, NO),
          required: true,
          step: 5,
        },
        {
          name: "allergies_detail",
          label: "При выборе ответа «Да», укажите какие именно",
          type: "text",
          maxLength: 500,
          wide: true,
          showWhen: { field: "allergies", equals: YES },
          step: 5,
        },
        {
          name: "health_conditions",
          label:
            "Есть ли у вас заболевания или особенности состояния здоровья, которые " +
            "важно учесть организаторам при проведении мероприятия?",
          type: "radio",
          options: opts(YES, NO),
          required: true,
          step: 5,
        },
        {
          name: "health_conditions_detail",
          label: "При выборе ответа «Да», укажите какие именно",
          type: "text",
          maxLength: 500,
          wide: true,
          showWhen: { field: "health_conditions", equals: YES },
          step: 5,
        },
        {
          name: "meal_type",
          label: "Укажите Ваш тип питания",
          type: "radio",
          options: opts("Традиционное (смешанное)", "Вегетарианское", "Другое"),
          required: true,
          step: 5,
        },
        {
          name: "meal_type_other",
          label: "При выборе ответа «Другое», укажите какое именно",
          type: "text",
          maxLength: 200,
          showWhen: { field: "meal_type", equals: "Другое" },
          step: 5,
        },
      ],
    },
    {
      title: "Ответственность сторон",
      fields: [
        {
          name: "agree_participate",
          label:
            "Подтверждаю своё согласие на участие в Международном образовательном " +
            "семинаре «Образование на высоте».",
          type: "checkboxes",
          options: opts(YES),
          required: true,
          step: 6,
        },
        {
          name: "agree_notice",
          label:
            "Подтверждаю и обязуюсь уведомить Организатора о невозможности участия не " +
            "позднее, чем за 12 дней до начала потока. Я понимаю, что отказ в более поздний " +
            "срок может повлечь за собой организационные сложности и финансовые затраты для " +
            "Организатора, связанные с моей поездкой.",
          type: "checkboxes",
          options: opts(YES),
          required: true,
          step: 6,
        },
        {
          name: "agree_truth",
          label:
            "Подтверждаю достоверность всех предоставленных мной сведений и понимаю, что " +
            "указание недостоверной информации является основанием для отклонения заявки или " +
            "исключения из числа участников.",
          type: "checkboxes",
          options: opts(YES),
          required: true,
          step: 6,
        },
        {
          name: "agree_extra_docs",
          label:
            "Уведомлён(а) о том, что Организатор оставляет за собой право запросить у меня " +
            "дополнительные документы или информацию для подтверждения сведений, указанных в " +
            "заявке, а также для оформления проездных документов и визовой поддержки.",
          type: "checkboxes",
          options: opts(YES),
          required: true,
          step: 6,
        },
        {
          name: "agree_refusal",
          label:
            "Уведомлён(а) о том, что Организатор вправе принять решение об отказе в допуске " +
            "к участию в образовательном семинаре без указания причин.",
          type: "checkboxes",
          options: opts(YES),
          required: true,
          step: 6,
        },
        {
          name: "agree_logistics_city",
          label:
            "Уведомлён(а) о том, что логистика может быть организована только из города " +
            "фактического проживания до города проведения мероприятия и обратно.",
          type: "checkboxes",
          options: opts(YES),
          required: true,
          step: 6,
        },
        {
          name: "agree_logistics_change",
          label:
            "Уведомлён(а) о том, что Организатор оставляет за собой право изменения в " +
            "маршруте логистики по уважительным причинам.",
          type: "checkboxes",
          options: opts(YES),
          required: true,
          step: 6,
        },
        {
          name: "agree_logistics_fixed",
          label:
            "Уведомлён(а) о том, что при подтверждении маршрута логистики внесение изменений " +
            "невозможно.",
          type: "checkboxes",
          options: opts(YES),
          required: true,
          step: 6,
        },
      ],
    },
  ],
  files: [
    {
      name: "passport_scan",
      label: "Прикрепите скан-копию паспорта",
      hint:
        "Для приобретения билетов к месту проведения мероприятия и обратно просим прикрепить " +
        "скан-копию паспорта (страница с фотографией и данными). Форматы: PDF, JPG или PNG. " +
        "Убедитесь, что все данные читаемы и не обрезаны. Максимальный размер — 20 МБ.",
      accept: ".pdf,.jpg,.jpeg,.png",
      required: true,
      step: 2,
    },
  ],
  submitLabel: "Отправить",
  successTitle: "Готово",
  successText: "Спасибо, данные отправлены.",
};
