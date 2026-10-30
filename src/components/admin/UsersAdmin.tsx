"use client";

import { useActionState, useMemo, useState } from "react";
import { KeyRound, Search, UserPlus } from "lucide-react";
import { changeUserRoleAction, createUserAction, resetUserPasswordAction } from "@/lib/user-actions";
import { MEMBER_ROLE_LABELS } from "@/lib/types";
import type { MemberRole } from "@/lib/types";
import type { UserRow } from "@/lib/users";
import { Button, Panel, Result, Select, TextField, inputClass } from "./ui";

const ROLE_HINT: Record<MemberRole, string> = {
  admin: "Администратор Центра — видит и меняет всё",
  moderator: "Модератор — видит назначенные ему формы и программы",
  participant: "Участник — личный кабинет и свои программы",
};

export function CreateUserPanel() {
  const [state, action, pending] = useActionState(createUserAction, {});
  const v = state.values ?? {};

  return (
    <Panel
      title="Новый пользователь"
      description="Логин — почта или телефон. Пароль создаётся автоматически и показывается один раз."
    >
      <form action={action} className="grid gap-4 md:grid-cols-2">
        <TextField label="Имя и фамилия" name="name" required defaultValue={v.name} key={`n${v.name}`} />
        <TextField label="Почта или телефон" name="contact" required defaultValue={v.contact} key={`c${v.contact}`} />
        <TextField label="Должность" name="position" defaultValue={v.position} key={`p${v.position}`} />
        <TextField label="Организация" name="org" defaultValue={v.org} key={`o${v.org}`} />
        <Select label="Роль" name="role" defaultValue={v.role || "moderator"} key={`r${v.role}`}>
          {(Object.keys(MEMBER_ROLE_LABELS) as MemberRole[]).map((role) => (
            <option key={role} value={role}>
              {MEMBER_ROLE_LABELS[role]}
            </option>
          ))}
        </Select>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            <UserPlus size={16} />
            Создать
          </Button>
        </div>
        <div className="md:col-span-2">
          <Result state={state} />
        </div>
      </form>
    </Panel>
  );
}

export function UsersTable({ users, selfId, formLabels }: { users: UserRow[]; selfId: string; formLabels: Record<string, string> }) {
  const [query, setQuery] = useState("");
  const [reset, resetAction, resetting] = useActionState(resetUserPasswordAction, {});

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => `${u.name} ${u.contact ?? ""} ${u.org ?? ""}`.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <Panel
      title={`Пользователи · ${users.length}`}
      description="Роль меняется сразу. Модераторов форм назначают на странице заявок нужной формы."
      aside={
        <label className="relative w-full max-w-80">
          <span className="sr-only">Поиск</span>
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Имя, логин, организация"
            className={`${inputClass} w-full pl-10`}
          />
        </label>
      }
    >
      <div className="mb-4">
        <Result state={reset} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-ui">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-caption uppercase tracking-wide text-ink-soft">
              <th className="w-12 px-3 py-3 text-right">№</th>
              <th className="px-3 py-3">Пользователь</th>
              <th className="px-3 py-3">Роль</th>
              <th className="px-3 py-3">Модератор форм</th>
              <th className="px-3 py-3">Программ</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {shown.map((user, index) => (
              <tr key={user.id} className="border-b border-[var(--line-soft)] align-top last:border-0">
                <td className="px-3 py-3 text-right text-ink-soft tabular-nums">{index + 1}</td>
                <td className="px-3 py-3">
                  <span className="block font-semibold text-ink">{user.name}</span>
                  <span className="block text-meta text-ink-soft">{user.contact ?? "без логина"}</span>
                  {user.org || user.position ? (
                    <span className="block text-caption text-ink-faint">{[user.position, user.org].filter(Boolean).join(", ")}</span>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  {user.id === selfId ? (
                    <span className="text-meta text-ink-soft">{MEMBER_ROLE_LABELS[user.role]} (вы)</span>
                  ) : (
                    <form action={changeUserRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        title={ROLE_HINT[user.role]}
                        onChange={(event) => event.currentTarget.form?.requestSubmit()}
                        className={`${inputClass} min-h-9 cursor-pointer py-1`}
                      >
                        {(Object.keys(MEMBER_ROLE_LABELS) as MemberRole[]).map((role) => (
                          <option key={role} value={role}>
                            {MEMBER_ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </form>
                  )}
                </td>
                <td className="px-3 py-3 text-meta text-ink-soft">
                  {user.forms.length ? user.forms.map((f) => formLabels[f] ?? f).join(", ") : "—"}
                </td>
                <td className="px-3 py-3 text-meta text-ink-soft tabular-nums">{user.programs || "—"}</td>
                <td className="px-3 py-3 text-right">
                  {user.contact && (
                    <form action={resetAction}>
                      <input type="hidden" name="id" value={user.id} />
                      <Button type="submit" tone="quiet" size="sm" disabled={resetting}>
                        <KeyRound size={13} />
                        Новый пароль
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
