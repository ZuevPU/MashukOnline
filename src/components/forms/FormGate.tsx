"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { unlockFormAction } from "@/lib/forms/gate-actions";

/** Поле пароля вместо анкеты. После верного пароля страница перерисовывается с формой. */
export function FormGate({ form, title }: { form: string; title: string }) {
  const [state, action, pending] = useActionState(unlockFormAction, {});
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <section className="section">
      <div className="wrap max-w-[620px]">
        <p className="eyebrow">Заявка</p>
        <h1 className="section-title section-title--tight">{title}</h1>
        <form
          action={action}
          className="mt-6 flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--line-soft)] bg-white p-6 shadow-[var(--shadow-brand)] sm:p-8"
        >
          <input type="hidden" name="form" value={form} />
          <label className="flex flex-col gap-2 text-meta font-semibold text-ink">
            Пароль для доступа к форме
            <input
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="off"
              className="min-h-12 rounded-field border border-[var(--line)] bg-white px-4 text-ui text-ink outline-none focus:border-navy"
            />
          </label>
          <p className="m-0 text-caption text-ink-soft">Пароль указан в приглашении на мероприятие.</p>
          {state.error && (
            <p className="m-0 rounded-field bg-autumn/10 px-4 py-3 text-meta text-ink" role="alert">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="min-h-12 cursor-pointer rounded-full border-0 bg-navy px-6 text-ui font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
          >
            {pending ? "Проверяем…" : "Открыть форму"}
          </button>
        </form>
      </div>
    </section>
  );
}
