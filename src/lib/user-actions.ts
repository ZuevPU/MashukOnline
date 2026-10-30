"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getSessionUser, normalizeContact } from "./auth";
import type { AdminState } from "./admin-actions";
import { getDb, schema } from "./db/client";
import { accessLabel, isAccessKey } from "./forms/access";
import { generatePassword, hashPassword } from "./password";
import type { MemberRole } from "./types";

/**
 * Управление пользователями и модераторами форм. Только администратор Центра:
 * каждое действие заново проверяет права — серверное действие публичная точка входа.
 */

const ROLES: MemberRole[] = ["admin", "moderator", "participant"];

async function centerAdmin() {
  const user = await getSessionUser();
  return user?.isCenterAdmin ? user : null;
}

function text(form: FormData, name: string, max: number): string {
  return String(form.get(name) ?? "").trim().slice(0, max);
}

function changed() {
  revalidatePath("/admin", "layout");
}

export async function createUserAction(_prev: AdminState, form: FormData): Promise<AdminState> {
  const db = getDb();
  if (!db || !(await centerAdmin())) return { error: "Создавать пользователей может администратор Центра" };

  const name = text(form, "name", 120);
  const contact = normalizeContact(text(form, "contact", 200));
  const rawRole = text(form, "role", 20) as MemberRole;
  const role = ROLES.includes(rawRole) ? rawRole : "participant";
  const values = { name, contact: text(form, "contact", 200), role, position: text(form, "position", 160), org: text(form, "org", 200) };

  if (name.length < 2) return { error: "Укажите имя и фамилию", values };
  if (!contact) return { error: "Укажите почту или телефон — это логин", values };

  const [existing] = await db
    .select({ id: schema.members.id })
    .from(schema.members)
    .where(eq(schema.members.contact, contact));
  if (existing) return { error: "Пользователь с таким логином уже есть — найдите его в списке ниже", values };

  const password = generatePassword();
  await db.insert(schema.members).values({
    id: `m-${randomUUID()}`,
    name,
    role,
    contact,
    passwordHash: await hashPassword(password),
    position: values.position || null,
    org: values.org || null,
  });
  changed();
  return {
    ok: `Готово: ${name} добавлен(а). Передайте логин и пароль — пароль больше не покажется.`,
    secret: { label: `Логин: ${contact} · пароль`, value: password },
  };
}

export async function changeUserRoleAction(form: FormData): Promise<void> {
  const db = getDb();
  const admin = await centerAdmin();
  if (!db || !admin) return;
  const id = text(form, "id", 80);
  const role = text(form, "role", 20) as MemberRole;
  // Себя не понижаем — иначе можно остаться без администратора
  if (!ROLES.includes(role) || id === admin.member.id) return;
  await db.update(schema.members).set({ role }).where(eq(schema.members.id, id));
  if (role !== "admin") {
    // Сменилась роль — прежние входы закрываем, права пересчитаются при новом входе
    await db.delete(schema.authSessions).where(eq(schema.authSessions.memberId, id));
  }
  changed();
}

export async function resetUserPasswordAction(_prev: AdminState, form: FormData): Promise<AdminState> {
  const db = getDb();
  if (!db || !(await centerAdmin())) return { error: "Сбрасывать пароли может администратор Центра" };
  const id = text(form, "id", 80);
  const [member] = await db
    .select({ name: schema.members.name, contact: schema.members.contact })
    .from(schema.members)
    .where(eq(schema.members.id, id));
  if (!member?.contact) return { error: "У пользователя нет логина" };

  const password = generatePassword();
  await db.update(schema.members).set({ passwordHash: await hashPassword(password) }).where(eq(schema.members.id, id));
  await db.delete(schema.authSessions).where(eq(schema.authSessions.memberId, id));
  return {
    ok: `Новый пароль для ${member.name}. Старый больше не действует.`,
    secret: { label: `Логин: ${member.contact} · пароль`, value: password },
  };
}

export async function addFormModeratorAction(_prev: AdminState, form: FormData): Promise<AdminState> {
  const db = getDb();
  if (!db || !(await centerAdmin())) return { error: "Назначать модераторов может администратор Центра" };
  const key = text(form, "form", 40);
  const memberId = text(form, "memberId", 80);
  if (!isAccessKey(key)) return { error: "Неизвестная форма" };
  if (!memberId) return { error: "Выберите пользователя" };

  await db.insert(schema.formModerators).values({ form: key, memberId }).onConflictDoNothing();
  changed();
  return { ok: `Модератор назначен: «${accessLabel(key)}»` };
}

export async function removeFormModeratorAction(form: FormData): Promise<void> {
  const db = getDb();
  if (!db || !(await centerAdmin())) return;
  const key = text(form, "form", 40);
  const memberId = text(form, "memberId", 80);
  if (!isAccessKey(key)) return;
  await db
    .delete(schema.formModerators)
    .where(and(eq(schema.formModerators.form, key), eq(schema.formModerators.memberId, memberId)));
  changed();
}
