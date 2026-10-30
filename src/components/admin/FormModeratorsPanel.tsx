"use client";

import { useActionState, useMemo } from "react";
import { UserMinus, UserPlus } from "lucide-react";
import { addFormModeratorAction, removeFormModeratorAction } from "@/lib/user-actions";
import type { FormModerator } from "@/lib/forms/access";
import type { MemberOption } from "@/lib/users";
import { Button, Result, inputClass } from "./ui";

/**
 * Модераторы формы: кто, кроме администратора Центра, видит её заявки.
 * Модератор видит форму в админке и в личном кабинете.
 */
export function FormModeratorsPanel({
  form,
  label,
  moderators,
  candidates,
}: {
  form: string;
  label: string;
  moderators: FormModerator[];
  candidates: MemberOption[];
}) {
  const [state, action, pending] = useActionState(addFormModeratorAction, {});
  const taken = useMemo(() => new Set(moderators.map((m) => m.memberId)), [moderators]);
  const free = candidates.filter((c) => !taken.has(c.id));

  return (
    <details className="rounded-panel border border-[var(--line)] bg-white p-4 [&_summary::-webkit-details-marker]:hidden">
      <summary className="cursor-pointer list-none text-ui font-semibold text-navy">
        Модераторы формы «{label}»: {moderators.length === 0 ? "не назначены" : moderators.map((m) => m.name).join(", ")}
        <span className="ml-2 text-meta font-normal text-ink-soft">изменить</span>
      </summary>

      <div className="mt-4 flex flex-col gap-4">
        <p className="m-0 text-meta text-ink-soft">
          Модераторы видят заявки этой формы в админке и в личном кабинете, могут выгружать их в Excel
          и убирать в корзину. Администратор Центра видит все формы.
        </p>

        {moderators.length > 0 && (
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {moderators.map((m) => (
              <li key={m.memberId} className="flex items-center gap-2 rounded-full bg-sky-tint py-1 pr-1 pl-3.5 text-meta text-navy">
                {m.name}
                {m.contact ? <span className="text-ink-faint">· {m.contact}</span> : null}
                <form action={removeFormModeratorAction}>
                  <input type="hidden" name="form" value={form} />
                  <input type="hidden" name="memberId" value={m.memberId} />
                  <button
                    type="submit"
                    aria-label={`Снять ${m.name}`}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-ink-soft hover:text-autumn"
                  >
                    <UserMinus size={14} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={action} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="form" value={form} />
          <label className="flex min-w-70 flex-1 flex-col gap-1.5 text-meta font-semibold text-ink">
            Добавить модератора
            <select name="memberId" className={`${inputClass} cursor-pointer`} defaultValue="" required>
              <option value="" disabled>
                {free.length ? "Выберите пользователя" : "Все пользователи уже назначены"}
              </option>
              {free.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.contact ? ` — ${c.contact}` : ""}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={pending || free.length === 0}>
            <UserPlus size={15} />
            Назначить
          </Button>
        </form>
        <p className="m-0 text-caption text-ink-faint">
          Нужного человека нет в списке? Создайте его в разделе «Пользователи».
        </p>
        <Result state={state} />
      </div>
    </details>
  );
}
