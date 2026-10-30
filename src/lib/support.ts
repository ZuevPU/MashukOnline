import { count, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb, schema } from "./db/client";

/**
 * Обращения в техническую поддержку.
 *
 * Форма на сайте пишет обращение в базу, администратор Центра видит их в
 * админке и отмечает разобранные.
 */

export class SupportError extends Error {}

export interface SupportInput {
  name: string;
  email: string;
  message: string;
  consent: boolean;
  page?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createSupportRequest(input: SupportInput): Promise<number> {
  const db = getDb();
  if (!db) throw new SupportError("Форма временно недоступна. Напишите на online@czmashuk.ru");

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const message = input.message.trim();
  if (!name || name.length > 200) throw new SupportError("Укажите имя");
  if (!EMAIL.test(email) || email.length > 254) throw new SupportError("Проверьте адрес почты");
  if (message.length < 5) throw new SupportError("Опишите вопрос подробнее");
  if (message.length > 5000) throw new SupportError("Сообщение слишком длинное");
  if (!input.consent) throw new SupportError("Нужно согласие на обработку персональных данных");

  const [row] = await db
    .insert(schema.supportRequests)
    .values({ name, email, message, page: input.page?.slice(0, 300) || null })
    .returning({ id: schema.supportRequests.id });
  return row.id;
}

export type SupportRow = typeof schema.supportRequests.$inferSelect;

export async function listSupportRequests(resolved: boolean): Promise<SupportRow[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(schema.supportRequests)
    .where(resolved ? isNotNull(schema.supportRequests.resolvedAt) : isNull(schema.supportRequests.resolvedAt))
    .orderBy(desc(schema.supportRequests.createdAt))
    .limit(300);
}

export async function countOpenSupportRequests(): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const [row] = await db
    .select({ value: count() })
    .from(schema.supportRequests)
    .where(isNull(schema.supportRequests.resolvedAt));
  return row?.value ?? 0;
}

export async function setSupportResolved(id: number, resolved: boolean): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(schema.supportRequests)
    .set({ resolvedAt: resolved ? new Date() : null })
    .where(eq(schema.supportRequests.id, id));
}
