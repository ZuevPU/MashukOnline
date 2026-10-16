import { and, desc, asc, eq, ilike, isNull, isNotNull, or, sql } from "drizzle-orm";
import { getDb, schema } from "../db/client";

/**
 * Админка заявок: списки, карточки, мягкое удаление и выгрузки.
 * Три формы — семинар (apply), данные участников (info), муниципалитеты (muni).
 */

export type FormId = "apply" | "info" | "muni" | "media";

export interface AppFilters {
  q: string;
  stream: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  limit: number;
  trashed: boolean;
  sort: string;
  order: "asc" | "desc";
}

// Ключи фильтра сортировки → свойства drizzle (camelCase).
const SORTABLE: Record<FormId, Record<string, string>> = {
  apply: { created_at: "createdAt", fio: "fioLatin", email: "email", stream: "stream", country: "country" },
  info: { created_at: "createdAt", fio: "fioLatin", stream: "stream", country: "departCountry" },
  muni: { created_at: "createdAt", fio: "fio", email: "email", stream: "stream", region: "region" },
  media: { created_at: "createdAt", fio: "fio", email: "email", stream: "stream", country: "country" },
};

export const FORM_META: Record<
  FormId,
  {
    label: string;
    short: string;
    fileColumns: { kind: string; column: string; label: string; accept: string }[];
    excel: { key: string; title: string }[];
  }
> = {
  apply: {
    label: "Семинар «Образование на высоте»",
    short: "Семинар",
    fileColumns: [
      { kind: "portfolio", column: "portfolio_path", label: "Портфолио", accept: ".pdf" },
      {
        kind: "consent",
        column: "consent_path",
        label: "Согласие",
        accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
      },
    ],
    excel: [
      { key: "id", title: "ID" },
      { key: "created_at", title: "Дата подачи" },
      { key: "fio_latin", title: "ФИО (лат.)" },
      { key: "fio_ru", title: "ФИО (рус.)" },
      { key: "birth_date", title: "Дата рождения" },
      { key: "gender", title: "Пол" },
      { key: "country", title: "Страна" },
      { key: "city", title: "Город" },
      { key: "arrival", title: "Откуда прибывает" },
      { key: "citizenship", title: "Гражданство" },
      { key: "phone", title: "Телефон" },
      { key: "email", title: "E-mail" },
      { key: "org_name", title: "Организация" },
      { key: "org_location", title: "Страна и город организации" },
      { key: "position", title: "Должность" },
      { key: "stream", title: "Поток" },
      { key: "audience", title: "Аудитория" },
      { key: "directions", title: "Направления" },
      { key: "why", title: "Почему важно участие" },
      { key: "coop", title: "Предложение по сотрудничеству" },
      { key: "mentor", title: "Наставник" },
      { key: "portfolio_path", title: "Портфолио (файл)" },
      { key: "consent_path", title: "Согласие (файл)" },
    ],
  },
  info: {
    label: "Данные участников",
    short: "Данные участников",
    fileColumns: [
      { kind: "passport", column: "passport_scan_path", label: "Скан паспорта", accept: ".pdf,.jpg,.jpeg,.png" },
    ],
    excel: [
      { key: "id", title: "ID" },
      { key: "created_at", title: "Дата подачи" },
      { key: "fio_latin", title: "ФИО" },
      { key: "gender", title: "Пол" },
      { key: "citizenship", title: "Гражданство" },
      { key: "id_doc_type", title: "Тип документа" },
      { key: "id_doc_series", title: "Серия документа" },
      { key: "id_doc_number", title: "Номер документа" },
      { key: "id_doc_issuer", title: "Кем выдан" },
      { key: "entry_doc_name", title: "Документ для въезда в РФ" },
      { key: "stream", title: "Поток" },
      { key: "depart_country", title: "Страна вылета" },
      { key: "depart_city", title: "Город вылета" },
      { key: "return_ticket", title: "Обратный билет" },
      { key: "baggage", title: "Багаж" },
      { key: "visa_needed", title: "Виза в РФ" },
      { key: "visa_current", title: "Действующая виза" },
      { key: "visa_status", title: "Статус оформления визы" },
      { key: "meal_type", title: "Тип питания" },
      { key: "passport_scan_path", title: "Скан паспорта (файл)" },
    ],
  },
  muni: {
    label: "Муниципалитеты",
    short: "Муниципалитеты",
    fileColumns: [
      {
        kind: "consent",
        column: "consent_path",
        label: "Согласие",
        accept: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
      },
    ],
    excel: [
      { key: "id", title: "ID" },
      { key: "created_at", title: "Дата подачи" },
      { key: "fio", title: "ФИО" },
      { key: "federal_district", title: "Федеральный округ" },
      { key: "region", title: "Регион" },
      { key: "city", title: "Город" },
      { key: "workplace", title: "Место работы" },
      { key: "position", title: "Должность" },
      { key: "birth_date", title: "Дата рождения" },
      { key: "snils", title: "СНИЛС" },
      { key: "inn", title: "ИНН" },
      { key: "phone", title: "Телефон" },
      { key: "email", title: "E-mail" },
      { key: "stream", title: "Поток" },
      { key: "colleagues", title: "Коллеги" },
      { key: "consent_path", title: "Согласие (файл)" },
    ],
  },
  media: {
    label: "Медиакомпетенции",
    short: "Медиа",
    fileColumns: [],
    excel: [
      { key: "id", title: "ID" },
      { key: "created_at", title: "Дата подачи" },
      { key: "fio", title: "ФИО" },
      { key: "birth_date", title: "Дата рождения" },
      { key: "country", title: "Страна" },
      { key: "city", title: "Город" },
      { key: "email", title: "E-mail" },
      { key: "phone", title: "Телефон" },
      { key: "messenger", title: "Мессенджер" },
      { key: "org_name", title: "Издание / организация" },
      { key: "position", title: "Должность" },
      { key: "media_type", title: "Сфера деятельности" },
      { key: "stream", title: "Даты участия" },
      { key: "links", title: "Материалы и портфолио" },
      { key: "why", title: "Мотивация" },
    ],
  },
};

export function isFormId(value: string): value is FormId {
  return value === "apply" || value === "info" || value === "muni" || value === "media";
}

function intParam(raw: unknown, fallback: number, lo: number, hi: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, Math.round(n)));
}

export function parseFilters(form: FormId, sp: Record<string, string | string[] | undefined>): AppFilters {
  const pick = (key: string) => {
    const v = sp[key];
    return (Array.isArray(v) ? v[0] : v ?? "").trim();
  };
  const sortKey = pick("sort");
  const sort = SORTABLE[form][sortKey] ? sortKey : "created_at";
  return {
    q: pick("q"),
    stream: pick("stream"),
    dateFrom: pick("dateFrom"),
    dateTo: pick("dateTo"),
    page: intParam(pick("page"), 1, 1, 100000),
    limit: intParam(pick("limit"), 50, 10, 100),
    trashed: ["1", "true", "yes"].includes(pick("trashed").toLowerCase()),
    sort,
    order: pick("order").toLowerCase() === "asc" ? "asc" : "desc",
  };
}

export interface ListRow {
  id: number;
  created_at: string;
  columns: { key: string; value: string }[];
  hasFiles: boolean;
  deleted: boolean;
}

export interface ListResult {
  rows: ListRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const SUMMARY: Record<FormId, { key: string; column: string }[]> = {
  apply: [
    { key: "fio", column: "fio_latin" },
    { key: "email", column: "email" },
    { key: "country", column: "country" },
    { key: "stream", column: "stream" },
  ],
  info: [
    { key: "fio", column: "fio_latin" },
    { key: "country", column: "depart_country" },
    { key: "stream", column: "stream" },
  ],
  muni: [
    { key: "fio", column: "fio" },
    { key: "email", column: "email" },
    { key: "region", column: "region" },
  ],
  media: [
    { key: "fio", column: "fio" },
    { key: "email", column: "email" },
    { key: "org", column: "orgName" },
    { key: "stream", column: "stream" },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

function table(form: FormId): AnyTable {
  if (form === "apply") return schema.seminarApplications;
  if (form === "info") return schema.participantDetails;
  if (form === "muni") return schema.municipalApplications;
  return schema.mediaApplications;
}

/** drizzle отдаёт ключи в camelCase — приводим к snake_case как в описаниях форм. */
function snake(key: string): string {
  return key.replace(/([A-Z])/g, (m) => "_" + m.toLowerCase());
}

function snakeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) out[snake(key)] = value;
  return out;
}

function searchColumns(form: FormId): string[] {
  if (form === "apply") return ["fio_latin", "fio_ru", "email", "phone", "country", "city", "org_name", "citizenship"];
  if (form === "info") return ["fio_latin", "citizenship", "depart_country", "depart_city", "stream"];
  if (form === "muni") return ["fio", "email", "phone", "region", "city", "workplace", "federal_district", "position"];
  return ["fio", "email", "phone", "org_name", "city", "country", "position"];
}

export async function listApplications(form: FormId, f: AppFilters): Promise<ListResult> {
  const db = getDb();
  if (!db) return { rows: [], total: 0, page: f.page, limit: f.limit, pages: 1 };
  const t = table(form);
  const conds = [f.trashed ? isNotNull(t.deletedAt) : isNull(t.deletedAt)];
  if (f.q) {
    const like = `%${f.q}%`;
    const parts = searchColumns(form).map((col) => ilike(sql.raw(col), like));
    conds.push(or(...parts)!);
  }
  if (f.stream) conds.push(eq(t.stream, f.stream));
  if (f.dateFrom) conds.push(sql`${t.createdAt}::date >= ${f.dateFrom}`);
  if (f.dateTo) conds.push(sql`${t.createdAt}::date <= ${f.dateTo}`);
  const where = and(...conds);

  const offset = (f.page - 1) * f.limit;
  const sortColumn = t[SORTABLE[form][f.sort]];
  const orderBy = f.order === "asc" ? asc(sortColumn) : desc(sortColumn);

  const raw = (await db
    .select()
    .from(t)
    .where(where)
    .orderBy(orderBy)
    .limit(f.limit)
    .offset(offset)) as Record<string, unknown>[];
  const rows = raw.map(snakeRow);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(t)
    .where(where);

  return {
    rows: rows.map((row) => ({
      id: Number(row.id),
      created_at: String(row.created_at),
      deleted: row.deleted_at != null,
      hasFiles: FORM_META[form].fileColumns.some((file) => Boolean(row[file.column])),
      columns: SUMMARY[form].map((c) => ({
        key: c.key,
        value: row[c.column] == null ? "" : String(row[c.column]),
      })),
    })),
    total: Number(count),
    page: f.page,
    limit: f.limit,
    pages: Math.max(1, Math.ceil(Number(count) / f.limit)),
  };
}

export async function getApplication(
  form: FormId,
  id: number,
): Promise<Record<string, unknown> | null> {
  const db = getDb();
  if (!db || !Number.isInteger(id)) return null;
  const t = table(form);
  const rows = await db.select().from(t).where(eq(t.id, id)).limit(1);
  if (!rows[0]) return null;
  const row = snakeRow(rows[0] as Record<string, unknown>);
  // Пути к файлам наружу не отдаём — вместо них признак наличия.
  for (const file of FORM_META[form].fileColumns) {
    row[`has_${file.kind}`] = Boolean(row[file.column]);
    delete row[file.column];
  }
  delete row.payloadRaw;
  return row;
}

async function setDeleted(form: FormId, id: number, trash: boolean): Promise<void> {
  const db = getDb();
  if (!db) return;
  const t = table(form);
  await db
    .update(t)
    .set({ deletedAt: trash ? sql`now()` : null })
    .where(eq(t.id, id));
}

export const trashApplication = (form: FormId, id: number) => setDeleted(form, id, true);
export const restoreApplication = (form: FormId, id: number) => setDeleted(form, id, false);

/** Значения для фильтра «Поток». */
export async function listStreams(form: FormId): Promise<string[]> {
  const db = getDb();
  if (!db) return [];
  const t = table(form);
  const rows = await db
    .selectDistinct({ value: t.stream })
    .from(t)
    .where(isNull(t.deletedAt))
    .orderBy(asc(t.stream));
  return rows.map((r: { value: string | null }) => r.value).filter((v): v is string => Boolean(v));
}

/** Полная выборка для выгрузки (без пагинации). */
export async function allApplications(form: FormId, f: AppFilters): Promise<Record<string, unknown>[]> {
  const db = getDb();
  if (!db) return [];
  const t = table(form);
  const conds = [f.trashed ? isNotNull(t.deletedAt) : isNull(t.deletedAt)];
  if (f.q) {
    const like = `%${f.q}%`;
    conds.push(or(...searchColumns(form).map((col) => ilike(sql.raw(col), like)))!);
  }
  if (f.stream) conds.push(eq(t.stream, f.stream));
  if (f.dateFrom) conds.push(sql`${t.createdAt}::date >= ${f.dateFrom}`);
  if (f.dateTo) conds.push(sql`${t.createdAt}::date <= ${f.dateTo}`);
  const sortColumn = t[SORTABLE[form][f.sort]];
  const result = (await db
    .select()
    .from(t)
    .where(and(...conds))
    .orderBy(f.order === "asc" ? asc(sortColumn) : desc(sortColumn))) as Record<string, unknown>[];
  return result.map(snakeRow);
}

/** Данные файла заявки: путь в хранилище и человекочитаемое имя. */
export async function getFileInfo(
  form: FormId,
  id: number,
  kind: string,
): Promise<{ path: string; fio: string } | null> {
  const db = getDb();
  if (!db) return null;
  const meta = FORM_META[form].fileColumns.find((f) => f.kind === kind);
  if (!meta) return null;
  const t = table(form);
  const rows = await db.select().from(t).where(eq(t.id, id)).limit(1);
  const row = rows[0] ? snakeRow(rows[0] as Record<string, unknown>) : undefined;
  if (!row) return null;
  const path = row[meta.column];
  if (!path) return null;
  const fio = String(row.fio ?? row.fio_latin ?? row.fio_ru ?? `id_${id}`);
  return { path: String(path), fio };
}
