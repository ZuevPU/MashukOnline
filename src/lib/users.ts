import { asc, sql } from "drizzle-orm";
import { getDb, schema } from "./db/client";
import type { MemberRole } from "./types";

/** Пользователи портала — для раздела «Пользователи» в админке. */

export interface UserRow {
  id: string;
  name: string;
  contact: string | null;
  role: MemberRole;
  position: string | null;
  org: string | null;
  hasPassword: boolean;
  createdAt: Date;
  /** Формы и обращения, где человек модератор */
  forms: string[];
  /** Сколько программ, где человек в составе */
  programs: number;
}

export async function listUsers(): Promise<UserRow[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: schema.members.id,
      name: schema.members.name,
      contact: schema.members.contact,
      role: schema.members.role,
      position: schema.members.position,
      org: schema.members.org,
      hasPassword: sql<boolean>`${schema.members.passwordHash} is not null`,
      createdAt: schema.members.createdAt,
      forms: sql<string[]>`coalesce((select array_agg(fm.form order by fm.form) from ${schema.formModerators} fm where fm.member_id = ${schema.members.id}), '{}')`,
      programs: sql<number>`(select count(*)::int from ${schema.programMembers} pm where pm.member_id = ${schema.members.id})`,
    })
    .from(schema.members)
    .orderBy(asc(schema.members.name));
  return rows;
}

export interface MemberOption {
  id: string;
  name: string;
  contact: string | null;
}

/** Все, у кого есть логин, — для выбора модератора формы. */
export async function listMemberOptions(): Promise<MemberOption[]> {
  const db = getDb();
  if (!db) return [];
  return db
    .select({ id: schema.members.id, name: schema.members.name, contact: schema.members.contact })
    .from(schema.members)
    .where(sql`${schema.members.contact} is not null`)
    .orderBy(asc(schema.members.name));
}
