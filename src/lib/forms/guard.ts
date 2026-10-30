import { getSessionUser } from "../auth";
import type { SessionUser } from "../auth";
import { canAccessForm } from "./access";
import type { AccessKey } from "./access";

/**
 * Доступ к заявкам формы: администратор Центра или модератор этой формы.
 * Для API возвращает null вместо редиректа — вызывающий сам решает.
 */
export async function currentFormUser(form: AccessKey): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return (await canAccessForm(user, form)) ? user : null;
}
