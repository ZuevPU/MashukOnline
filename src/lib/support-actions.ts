"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "./auth";
import { setSupportResolved } from "./support";

/** Отметить обращение разобранным или вернуть в новые. Только администратор Центра. */
export async function toggleSupportResolvedAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user?.isCenterAdmin) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  await setSupportResolved(id, formData.get("resolved") === "1");
  revalidatePath("/admin", "layout");
}
