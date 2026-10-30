"use client";

import Link from "next/link";
import { useState } from "react";

const FIELD =
  "w-full rounded-field border border-ink/70 bg-white px-4 py-3 text-ui text-ink outline-none transition-colors duration-150 focus:border-navy focus:shadow-[0_0_0_3px_rgba(34,63,154,0.18)]";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

/**
 * Форма технической поддержки: фото здания Центра на фоне, рамка и поля слева.
 * Обращения попадают в админку (раздел «Поддержка»).
 */
export function SupportForm() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [consent, setConsent] = useState(true);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website"),
          consent,
          page: window.location.pathname,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setState({ kind: "error", message: result.error ?? "Не удалось отправить сообщение" });
        return;
      }
      form.reset();
      setState({ kind: "done" });
    } catch {
      setState({ kind: "error", message: "Нет связи с сервером. Попробуйте ещё раз." });
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-sky-pale bg-cover bg-[position:70%_center] p-4 md:p-10"
      style={{ backgroundImage: "url(/site/support-bg.jpg)" }}
    >
      <div className="relative rounded-[var(--radius-panel)] border-[3px] border-navy p-5 md:p-8">
        <h2 className="m-0 mb-6 font-display text-[clamp(32px,5.4vw,64px)] leading-[1.05] font-light tracking-[-0.03em] text-black-ink">
          Техническая поддержка
        </h2>

        {state.kind === "done" ? (
          <div className="max-w-115 rounded-field bg-white/90 px-5 py-4 text-ui text-ink" role="status">
            Спасибо! Сообщение отправлено — мы ответим на указанную почту.
            <button
              type="button"
              onClick={() => setState({ kind: "idle" })}
              className="mt-3 block cursor-pointer border-0 bg-transparent p-0 font-semibold text-navy underline"
            >
              Написать ещё
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex max-w-115 flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-meta text-black-ink">
              Имя
              <input name="name" required maxLength={200} autoComplete="name" className={FIELD} />
            </label>
            <label className="flex flex-col gap-1.5 text-meta text-black-ink">
              Электронная почта
              <input name="email" type="email" required maxLength={254} autoComplete="email" className={FIELD} />
            </label>
            <label className="flex flex-col gap-1.5 text-meta text-black-ink">
              Сообщение
              <textarea name="message" required minLength={5} maxLength={5000} rows={3} className={`${FIELD} resize-y`} />
            </label>
            {/* Ловушка для ботов */}
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            <label className="flex items-start gap-2.5 text-caption leading-snug text-black-ink">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                required
                className="mt-0.5 h-5 w-5 shrink-0 accent-navy"
              />
              <span>
                Я даю свое согласие АНО «Центр знаний «Машук» на обработку предоставленных мной данных
                в соответствии с{" "}
                <Link href="/privacy" className="text-navy">
                  Правилами обработки персональных данных
                </Link>
              </span>
            </label>

            {state.kind === "error" && (
              <p className="m-0 text-meta text-danger" role="alert">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={state.kind === "sending" || !consent}
              className="mx-auto mt-1 min-h-12 min-w-40 cursor-pointer rounded-field border-0 bg-navy px-8 text-ui text-white transition-colors duration-150 hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              {state.kind === "sending" ? "Отправляем…" : "Отправить"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
