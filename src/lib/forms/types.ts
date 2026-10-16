/**
 * Описание анкет (форм заявок).
 *
 * Каждая форма описывается данными: секции, поля, файлы. Общий компонент
 * ApplicationForm рисует интерфейс и собирает ответ, а серверный обработчик
 * проверяет данные и пишет в базу. Имена полей совпадают с колонками таблиц,
 * поэтому анкеты, собранные старой системой, переносятся без пересборки.
 */

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "textarea"
  | "radio"
  | "checkboxes"
  | "select"
  | "file";

export interface FieldDef {
  /** Имя поля — совпадает с колонкой в базе и ключом в payload */
  name: string;
  label: string;
  hint?: string;
  type: FieldType;
  /** Варианты для radio, checkboxes, select */
  options?: { value: string; label: string }[];
  /** Подсказки автодополнения для текстового поля (datalist) */
  datalist?: string[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  /** Для checkboxes: ровно столько отметок (например, 3 направления) */
  exactCount?: number;
  placeholder?: string;
  /** Поле занимает обе колонки сетки */
  wide?: boolean;
  /** Показывать, только если другое поле равно значению */
  showWhen?: { field: string; equals: string };
  /** Номер шага (если форма пошаговая) */
  step?: number;
}

export interface SectionDef {
  title?: string;
  fields: FieldDef[];
}

export interface FormFileDef {
  name: string;
  label: string;
  hint?: string;
  accept: string;
  required?: boolean;
  /** Номер шага, на котором показывать файл */
  step?: number;
}

export interface FormFact {
  /** Заголовок плитки (для потоков — «I поток») */
  label: string;
  text: string;
}

export interface FormConfig {
  id: "apply" | "info" | "muni" | "media";
  endpoint: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  lead?: string;
  paragraphs?: string[];
  /** Плитки общей информации (формат, язык, место, возраст) */
  facts?: string[];
  /** Потоки: четыре плитки с датами */
  waves?: FormFact[];
  notes?: string[];
  finance?: { title: string; lead: string; items: string[] };
  /** Если задано — форма пошаговая, разделы распределены по шагам */
  steps?: { label: string }[];
  sections: SectionDef[];
  files: FormFileDef[];
  /** Кнопки со скачиванием шаблона согласия */
  consents?: { kind: "apply-doc" | "muni-pdf" };
  submitLabel: string;
  successTitle: string;
  successText: string;
  /** Программа по умолчанию (можно привязать заявку к потоку) */
  programSlug?: string;
}

/** Значения формы: строки, массивы отметок и файлы (только на клиенте). */
export type FormValues = Record<string, string | string[] | File | null>;
