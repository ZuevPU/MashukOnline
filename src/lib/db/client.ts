import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Подключение к PostgreSQL.
 *
 * База опциональна: если переменная DATABASE_URL не задана, приложение
 * работает на демонстрационных данных из src/lib/mock и остаётся полностью
 * работоспособным. Это позволяет запускать платформу локально без установки
 * базы данных, а на сервере — включить настоящую.
 */
function createDb(url: string) {
  const client = postgres(url, {
    // Всплеск в зале — 150 ответов на опрос за секунды. Пул должен вмещать его,
    // но оставаться в пределах max_connections Postgres (по умолчанию 100).
    max: Number(process.env.DB_POOL_MAX) || 20,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;

let cached: Database | null = null;

/**
 * Приводит DATABASE_URL к пригодному виду.
 *
 * В переменную часто вставляют строку-заглушку или команду `psql …` со скобками
 * и лишним текстом. Достаём из неё сам адрес postgres://… и проверяем синтаксис;
 * если адрес некорректен — базы «нет», приложение работает в демонстрационном
 * режиме и сборка не падает.
 */
export function normalizeDatabaseUrl(raw: string | undefined): string | undefined {
  let value = (raw ?? "").trim().replace(/^['"]+|['"]+$/g, "");
  if (!value) return undefined;
  const found = value.match(/postgres(?:ql)?:\/\/\S+/i);
  if (found) value = found[0].replace(/['";,]+$/, "");
  if (!/^postgres(?:ql)?:\/\//i.test(value)) return undefined;
  try {
    const parsed = new URL(value);
    const host = parsed.hostname;
    // Хост — только латиница, цифры, точки и дефисы. Так отсекаются заглушки
    // вида «postgres://…», но допускаются короткие имена (например, db в Docker).
    if (!host || !/^[a-z0-9.-]+$/i.test(host) || /^[.-]+$/.test(host)) return undefined;
  } catch {
    return undefined;
  }
  return value;
}

export function databaseUrl(): string | undefined {
  return normalizeDatabaseUrl(process.env.DATABASE_URL);
}

export function hasDatabase(): boolean {
  return Boolean(databaseUrl());
}

export function getDb(): Database | null {
  const url = databaseUrl();
  if (!url) return null;
  if (!cached) cached = createDb(url);
  return cached;
}

export { schema };
