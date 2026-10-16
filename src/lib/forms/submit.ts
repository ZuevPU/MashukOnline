import { eq } from "drizzle-orm";
import { getDb, schema } from "../db/client";
import { saveFormFile } from "./files";
import { validEmail, validInn, validRegion, validSnils, normalizeDistrict } from "./muni-data";
import { applyConfig } from "./apply-config";
import { infoConfig } from "./info-config";
import { muniConfig } from "./muni-config";
import type { FormConfig } from "./types";

/**
 * Приём заявок.
 *
 * Обработчик получает multipart-форму: поле `payload` — JSON с ответами,
 * остальные поля — файлы. Данные проверяются, файлы кладутся в хранилище,
 * строка пишется в базу. Возвращаем id созданной заявки.
 */

export const FORM_CONFIGS: Record<FormConfig["id"], FormConfig> = {
  apply: applyConfig,
  info: infoConfig,
  muni: muniConfig,
};

export class SubmitError extends Error {}

function str(data: Record<string, unknown>, key: string, max = 5000): string {
  const value = data[key];
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.map((v) => String(v)).join(", ").slice(0, max).trim();
  return String(value).slice(0, max).trim();
}

function list(data: Record<string, unknown>, key: string): string[] {
  const value = data[key];
  if (Array.isArray(value)) return value.map((v) => String(v).slice(0, 300));
  if (typeof value === "string" && value) return [value.slice(0, 300)];
  return [];
}

function yesNo(value: unknown): string {
  const text = String(value ?? "").trim().toLowerCase();
  return ["да", "true", "1", "yes"].includes(text) ? "да" : "нет";
}

async function resolveProgramId(slug: string): Promise<number | null> {
  const db = getDb();
  if (!db || !slug) return null;
  const rows = await db
    .select({ id: schema.programs.id })
    .from(schema.programs)
    .where(eq(schema.programs.slug, slug))
    .limit(1);
  return rows[0]?.id ?? null;
}

/** Проверяет обязательные поля и длины по конфигурации. */
function validateFields(config: FormConfig, data: Record<string, unknown>): void {
  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.showWhen) {
        const dep = str(data, field.showWhen.field, 300);
        if (dep !== field.showWhen.equals) continue;
      }
      if (field.type === "file") continue;
      const value = data[field.name];
      if (field.type === "checkboxes") {
        const selected = list(data, field.name);
        if (field.required && selected.length === 0) {
          throw new SubmitError(`Заполните поле: ${field.label}`);
        }
        if (field.exactCount && selected.length !== field.exactCount) {
          throw new SubmitError(`Нужно выбрать ровно ${field.exactCount}`);
        }
        continue;
      }
      const text = str(data, field.name);
      if (field.required && !text) throw new SubmitError(`Заполните поле: ${field.label}`);
      if (field.minLength && text && text.length < field.minLength) {
        throw new SubmitError(`Нужно не менее ${field.minLength} символов: ${field.label}`);
      }
    }
  }
}

export interface SubmitResult {
  id: number;
}

export async function submitForm(
  id: FormConfig["id"],
  formData: FormData,
): Promise<SubmitResult> {
  const config = FORM_CONFIGS[id];
  const db = getDb();
  if (!db) throw new SubmitError("База данных не подключена");

  let data: Record<string, unknown> = {};
  const raw = formData.get("payload");
  if (typeof raw === "string" && raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") data = parsed as Record<string, unknown>;
    } catch {
      throw new SubmitError("Некорректные данные формы");
    }
  }

  validateFields(config, data);

  // Файлы: сохраняем до записи в базу, чтобы ключи попали в строку.
  const saved: Record<string, string> = {};
  for (const file of config.files) {
    const upload = formData.get(file.name);
    if (upload instanceof File && upload.size > 0) {
      const allowed = file.accept.split(",").map((e) => e.trim()).filter((e) => e.startsWith("."));
      const result = await saveFormFile(file.name, upload, allowed);
      saved[file.name] = result.key;
    } else if (file.required) {
      throw new SubmitError(`Прикрепите файл: ${file.label}`);
    }
  }

  const programSlug = config.programSlug ?? str(data, "program_slug", 120);
  const programId = await resolveProgramId(programSlug);

  if (id === "apply") {
    await validateApply(data);
    const rows = await db
      .insert(schema.seminarApplications)
      .values({
        programId,
        program: str(data, "program", 300) || null,
        fioLatin: str(data, "fio_latin", 200),
        fioRu: str(data, "fio_ru", 200) || null,
        birthDate: str(data, "birth_date", 20) || null,
        gender: str(data, "gender", 20) || null,
        country: str(data, "country", 120) || null,
        city: str(data, "city", 120) || null,
        arrival: str(data, "arrival", 300) || null,
        citizenship: str(data, "citizenship", 120) || null,
        allCitizenships: str(data, "all_citizenships", 300) || null,
        phone: str(data, "phone", 40) || null,
        email: str(data, "email", 254) || null,
        messenger: list(data, "messenger"),
        messengerLink: str(data, "messenger_link", 300) || null,
        messengerOther: str(data, "messenger_other", 120) || null,
        orgName: str(data, "org_name", 300) || null,
        orgSpec: str(data, "org_spec", 300) || null,
        orgLocation: str(data, "org_location", 200) || null,
        position: str(data, "position", 200) || null,
        audience: list(data, "audience"),
        audienceOther: str(data, "audience_other", 200) || null,
        stream: str(data, "stream", 120) || null,
        howLearned: str(data, "how_learned", 300) || null,
        intlPrograms: str(data, "intl_programs", 20) || null,
        intlDetails: str(data, "intl_details", 500) || null,
        ruPrograms: str(data, "ru_programs", 20) || null,
        ruDetails: str(data, "ru_details", 500) || null,
        why: str(data, "why") || null,
        coop: str(data, "coop") || null,
        mentor: str(data, "mentor") || null,
        directions: list(data, "directions"),
        directionsOther: str(data, "directions_other", 200) || null,
        address: str(data, "address", 400) || null,
        passportSeries: str(data, "passport_series", 40) || null,
        passportNumber: str(data, "passport_number", 40) || null,
        passportDate: str(data, "passport_date", 20) || null,
        passportIssued: str(data, "passport_issued", 400) || null,
        portfolioPath: saved.portfolio ?? null,
        consentPath: saved.consent_file ?? null,
        payloadRaw: data,
      })
      .returning({ id: schema.seminarApplications.id });
    return { id: rows[0].id };
  }

  if (id === "info") {
    await validateInfo(data);
    const rows = await db
      .insert(schema.participantDetails)
      .values({
        programId,
        fioLatin: str(data, "fio_latin", 200),
        gender: str(data, "gender", 20) || null,
        citizenship: str(data, "citizenship", 120) || null,
        otherCitizenships: str(data, "other_citizenships", 20) || null,
        otherCitizenshipsDetail: str(data, "other_citizenships_detail", 300) || null,
        healthLimits: str(data, "health_limits", 500) || null,
        allergies: str(data, "allergies", 20) || null,
        allergiesDetail: str(data, "allergies_detail", 500) || null,
        healthConditions: str(data, "health_conditions", 20) || null,
        healthConditionsDetail: str(data, "health_conditions_detail", 500) || null,
        mealType: str(data, "meal_type", 100) || null,
        mealTypeOther: str(data, "meal_type_other", 200) || null,
        idDocType: str(data, "id_doc_type", 100) || null,
        idDocTypeOther: str(data, "id_doc_type_other", 200) || null,
        idDocSeries: str(data, "id_doc_series", 40) || null,
        idDocNumber: str(data, "id_doc_number", 40) || null,
        idDocIssued: str(data, "id_doc_issued", 20) || null,
        idDocValidTo: str(data, "id_doc_valid_to", 40) || null,
        idDocIssuer: str(data, "id_doc_issuer", 400) || null,
        entryDocName: str(data, "entry_doc_name", 200) || null,
        entryDocSeries: str(data, "entry_doc_series", 40) || null,
        entryDocNumber: str(data, "entry_doc_number", 40) || null,
        entryDocIssued: str(data, "entry_doc_issued", 20) || null,
        entryDocValidTo: str(data, "entry_doc_valid_to", 40) || null,
        entryDocIssuer: str(data, "entry_doc_issuer", 400) || null,
        stream: str(data, "stream", 120) || null,
        departCountry: str(data, "depart_country", 120) || null,
        departCity: str(data, "depart_city", 120) || null,
        returnTicket: str(data, "return_ticket", 20) || null,
        baggage: str(data, "baggage", 40) || null,
        visaNeeded: str(data, "visa_needed", 40) || null,
        visaCurrent: str(data, "visa_current", 60) || null,
        visaStatus: str(data, "visa_status", 100) || null,
        agreeParticipate: yesNo(list(data, "agree_participate")[0]),
        agreeNotice: yesNo(list(data, "agree_notice")[0]),
        agreeTruth: yesNo(list(data, "agree_truth")[0]),
        agreeExtraDocs: yesNo(list(data, "agree_extra_docs")[0]),
        agreeRefusal: yesNo(list(data, "agree_refusal")[0]),
        agreeLogisticsCity: yesNo(list(data, "agree_logistics_city")[0]),
        agreeLogisticsFixed: yesNo(list(data, "agree_logistics_fixed")[0]),
        agreeLogisticsChange: yesNo(list(data, "agree_logistics_change")[0]),
        passportScanPath: saved.passport_scan ?? null,
        payloadRaw: data,
      })
      .returning({ id: schema.participantDetails.id });
    return { id: rows[0].id };
  }

  // muni
  await validateMuni(data);
  const rows = await db
    .insert(schema.municipalApplications)
    .values({
      programId,
      fio: str(data, "fio", 200),
      federalDistrict: normalizeDistrict(str(data, "federal_district", 120)) || null,
      region: str(data, "region", 120) || null,
      city: str(data, "city", 120) || null,
      workplace: str(data, "workplace", 300) || null,
      position: str(data, "position", 200) || null,
      birthDate: str(data, "birth_date", 20) || null,
      snils: str(data, "snils", 20) || null,
      inn: str(data, "inn", 20) || null,
      phone: str(data, "phone", 40) || null,
      email: str(data, "email", 254) || null,
      stream: str(data, "stream", 120) || null,
      colleagues: str(data, "colleagues", 1000) || null,
      address: str(data, "address", 400) || null,
      passportSeries: str(data, "passport_series", 40) || null,
      passportNumber: str(data, "passport_number", 40) || null,
      passportIssued: str(data, "passport_issued", 400) || null,
      consentPath: saved.consent_file ?? null,
      payloadRaw: data,
    })
    .returning({ id: schema.municipalApplications.id });
  return { id: rows[0].id };
}

async function validateApply(data: Record<string, unknown>): Promise<void> {
  const email = str(data, "email", 254);
  if (!validEmail(email)) throw new SubmitError("Укажите корректный e-mail");
  if (list(data, "directions").length !== 3) {
    throw new SubmitError("Выберите ровно 3 направления");
  }
  if (str(data, "why").length < 500 || str(data, "coop").length < 500) {
    throw new SubmitError("Ответы должны содержать не менее 500 символов");
  }
  if (str(data, "intl_programs") === "Да" && !str(data, "intl_details")) {
    throw new SubmitError("Укажите детали международных программ");
  }
  if (str(data, "ru_programs") === "Да" && !str(data, "ru_details")) {
    throw new SubmitError("Укажите детали российских программ");
  }
}

async function validateInfo(data: Record<string, unknown>): Promise<void> {
  if (str(data, "other_citizenships") === "Да" && !str(data, "other_citizenships_detail")) {
    throw new SubmitError("Укажите другие гражданства");
  }
  for (const name of [
    "agree_participate",
    "agree_notice",
    "agree_truth",
    "agree_extra_docs",
    "agree_refusal",
    "agree_logistics_city",
    "agree_logistics_fixed",
    "agree_logistics_change",
  ]) {
    if (!list(data, name).length) throw new SubmitError("Проставьте все согласия");
  }
}

async function validateMuni(data: Record<string, unknown>): Promise<void> {
  if (!validSnils(str(data, "snils"))) throw new SubmitError("Укажите корректный СНИЛС");
  if (!validInn(str(data, "inn"))) throw new SubmitError("Укажите корректный ИНН");
  if (!validEmail(str(data, "email"))) throw new SubmitError("Укажите корректный e-mail");
  if (!validRegion(str(data, "region"))) throw new SubmitError("Выберите регион из списка");
  if (!["Да", "да"].includes(str(data, "consent_confirm", 20))) {
    throw new SubmitError("Подтвердите подписание согласия");
  }
}
