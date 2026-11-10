import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "../db/client";
import type { SessionUser } from "../auth";
import { FORM_META } from "./admin";
import type { FormId } from "./admin";

/**
 * Доступ к заявкам и обращениям.
 *
 * Администратор Центра видит всё. Остальные — только формы, модератором
 * которых их назначили (таблица form_moderators). «support» — обращения
 * в техническую поддержку.
 */

export type AccessKey = FormId | "support";

export const ACCESS_KEYS: AccessKey[] = ["apply", "info", "muni", "media", "cultistud", "competence", "support"];

export function accessLabel(key: AccessKey): string {
  return key === "support" ? "Техническая поддержка" : FORM_META[key].label;
}

export function isAccessKey(value: string): value is AccessKey {
  return (ACCESS_KEYS as string[]).includes(value);
}

/** Формы, которые человек видит в админке. */
export const accessibleForms = cache(async (user: SessionUser): Promise<AccessKey[]> => {
  if (user.isCenterAdmin) return ACCESS_KEYS;
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ form: schema.formModerators.form })
    .from(schema.formModerators)
    .where(eq(schema.formModerators.memberId, user.member.id));
  const mine = new Set(rows.map((row) => row.form));
  return ACCESS_KEYS.filter((key) => mine.has(key));
});

export async function canAccessForm(user: SessionUser, key: AccessKey): Promise<boolean> {
  return (await accessibleForms(user)).includes(key);
}

export interface FormModerator {
  memberId: string;
  name: string;
  contact: string | null;
}

/** Модераторы формы — для панели в админке. */
export async function listFormModerators(key: AccessKey): Promise<FormModerator[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select({ memberId: schema.members.id, name: schema.members.name, contact: schema.members.contact })
    .from(schema.formModerators)
    .innerJoin(schema.members, eq(schema.members.id, schema.formModerators.memberId))
    .where(eq(schema.formModerators.form, key))
    .orderBy(asc(schema.members.name));
}
