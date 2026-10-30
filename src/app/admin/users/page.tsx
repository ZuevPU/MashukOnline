import { redirect } from "next/navigation";
import { CreateUserPanel, UsersTable } from "@/components/admin/UsersAdmin";
import { getSessionUser } from "@/lib/auth";
import { ACCESS_KEYS, accessLabel } from "@/lib/forms/access";
import { listUsers } from "@/lib/users";

export const metadata = { title: "Пользователи" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = (await getSessionUser())!;
  if (!user.isCenterAdmin) redirect("/admin/programs");

  const users = await listUsers();
  const formLabels = Object.fromEntries(ACCESS_KEYS.map((key) => [key, accessLabel(key)]));

  return (
    <div className="wrap flex flex-col gap-6">
      <h1 className="m-0 font-display text-[clamp(28px,3.4vw,40px)] leading-tight font-semibold tracking-[-0.045em] text-navy">
        Пользователи
      </h1>
      <CreateUserPanel />
      <UsersTable users={users} selfId={user.member.id} formLabels={formLabels} />
    </div>
  );
}
