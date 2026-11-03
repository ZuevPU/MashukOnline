"use client";

import { useActionState } from "react";
import { unlockProgramAction } from "@/lib/program-gate-actions";

export function ProgramGateForm({ slug, next }: { slug: string; next: string }) {
  const [state, action, pending] = useActionState(unlockProgramAction, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-2 text-meta font-semibold text-ink">
        Пароль участника
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="off"
          className="min-h-12 rounded-field border border-[var(--line)] bg-white px-4 text-ui text-ink outline-none focus:border-navy"
        />
      </label>
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
        {pending ? "Проверяем…" : "Войти"}
      </button>
    </form>
  );
}
