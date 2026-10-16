"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isFormId, restoreApplication, trashApplication } from "./admin";
import { currentAdminUser } from "./guard";

/** Мягкое удаление и восстановление заявок из карточки. */
async function setDeleted(formData: FormData, trash: boolean): Promise<void> {
  const user = await currentAdminUser();
  if (!user) redirect("/join?next=/admin/applications");
  const form = String(formData.get("form") ?? "");
  const id = Number(formData.get("id"));
  if (isFormId(form) && Number.isInteger(id)) {
    await (trash ? trashApplication(form, id) : restoreApplication(form, id));
  }
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${form}/${id}`);
  if (!trash) redirect(`/admin/applications/${form}/${id}`);
}

export async function trashApplicationAction(formData: FormData): Promise<void> {
  await setDeleted(formData, true);
}

export async function restoreApplicationAction(formData: FormData): Promise<void> {
  await setDeleted(formData, false);
}
