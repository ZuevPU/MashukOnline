import { getSessionUser } from "../auth";
import { listManagedPrograms } from "../admin";
import type { SessionUser } from "../auth";

/**
 * Доступ к админке заявок: администратор Центра или команда хотя бы одной
 * программы. Для API возвращает null вместо редиректа — вызывающий сам решает.
 */
export async function currentAdminUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (user.isCenterAdmin) return user;
  const programs = await listManagedPrograms(user);
  return programs.length > 0 ? user : null;
}
