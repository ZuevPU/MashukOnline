"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "./auth";
import { setSupportResolved } from "./support";
import { canAccessForm } from "./forms/access";

/** Отметить обращение разобранным или вернуть в новые. Администратор Центра или модератор поддержки. */
export async function toggleSupportResolvedAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || !(await canAccessForm(user, "support"))) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  await setSupportResolved(id, formData.get("resolved") === "1");
  revalidatePath("/admin", "layout");
}
