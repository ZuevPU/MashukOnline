"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FieldDef, FormConfig } from "@/lib/forms/types";

/* ==========================================================================
   Универсальная анкета: рисует любое описание формы из src/lib/forms.
   Серверные проверки дублируются на клиенте, чтобы человек сразу видел
   ошибку, а не ждал ответа сервера.

   Два режима:
   — отдельная страница (по умолчанию): заголовок, факты, шаги, карточка;
   — embedded: форма встроена в лендинг. Ни заголовка, ни фактов — только
     поля, разложенные по смысловым блокам, чтобы страница не дублировала
     сама себя.
   ========================================================================== */

type Values = Record<string, string>;
type Checks = Record<string, string[]>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Плавная прокрутка только тем, кто не просил её отключить. */
function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/** Подсказки браузеру: автозаполнение имени, телефона, почты и адреса. */
const AUTOCOMPLETE: Record<string, string> = {
  fio: "name",
  phone: "tel",
  email: "email",
  birth_date: "bday",
  city: "address-level2",
  region: "address-level1",
};

export function ApplicationForm({
  config,
  embedded = false,
  intro,
}: {
  config: FormConfig;
  embedded?: boolean;
  /** Короткая строка над встроенной формой: исчезает вместе с формой после отправки. */
  intro?: string;
}) {
  const [values, setValues] = useState<Values>({});
  const [checks, setChecks] = useState<Checks>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // После отправки форма исчезает и страница становится короче: без прокрутки
  // человек остаётся внизу, у контактов, и не видит подтверждения.
  useEffect(() => {
    if (status !== "done") return;
    successRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  }, [status]);

  const stepCount = config.steps?.length ?? 0;

  const visible = (field: FieldDef): boolean => {
    if (!field.showWhen) return true;
    const dep = values[field.showWhen.field] ?? "";
    return dep === field.showWhen.equals;
  };

  const stepFields = useMemo(() => {
    const byStep = new Map<number, FieldDef[]>();
    for (const section of config.sections) {
      for (const field of section.fields) {
        const s = field.step ?? 1;
        if (!byStep.has(s)) byStep.set(s, []);
        byStep.get(s)!.push(field);
      }
    }
    return byStep;
  }, [config.sections]);

  const sectionTitleByStep = useMemo(() => {
    const map = new Map<number, string>();
    for (const section of config.sections) {
      const s = section.fields[0]?.step ?? 1;
      if (section.title) map.set(s, section.title);
    }
    return map;
  }, [config.sections]);

  function setValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function toggleCheck(name: string, value: string, on: boolean, max?: number) {
    setChecks((prev) => {
      const current = prev[name] ?? [];
      let next: string[];
      if (on) {
        next = current.includes(value) ? current : [...current, value];
        if (max && next.length > max) return prev;
      } else {
        next = current.filter((v) => v !== value);
      }
      return { ...prev, [name]: next };
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  /** Первое незаполненное поле: прокручиваем к нему и ставим курсор. */
  function focusFirstError(next: Record<string, string>) {
    const first = Object.keys(next)[0];
    if (!first) return;
    window.requestAnimationFrame(() => {
      const root = formRef.current;
      if (!root) return;
      const field = root.querySelector<HTMLElement>(`[data-field="${first}"]`);
      if (!field) return;
      field.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      field.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });
    });
  }

  function validateStep(current: number): boolean {
    const next: Record<string, string> = {};
    const fields = stepCount ? (stepFields.get(current) ?? []) : config.sections.flatMap((s) => s.fields);
    for (const field of fields) {
      if (!visible(field)) continue;
      if (field.type === "file") continue;
      if (field.type === "checkboxes") {
        const selected = checks[field.name] ?? [];
        if (field.exactCount && selected.length !== field.exactCount) {
          next[field.name] = `Нужно выбрать ровно ${field.exactCount}`;
        } else if (field.required && selected.length === 0) {
          next[field.name] = "Заполните это поле";
        }
        continue;
      }
      const value = (values[field.name] ?? "").trim();
      if (field.required && !value) {
        next[field.name] = "Заполните это поле";
      } else if (field.minLength && value && value.length < field.minLength) {
        next[field.name] = `Нужно не менее ${field.minLength} символов`;
      } else if (field.type === "email" && value && !EMAIL_RE.test(value)) {
        next[field.name] = "Укажите корректный e-mail";
      }
    }
    // Файлы текущего шага
    for (const file of config.files) {
      if (stepCount && file.step !== current) continue;
      if (file.required && !files[file.name]) next[file.name] = "Прикрепите файл";
    }
    setErrors(next);
    if (Object.keys(next).length) focusFirstError(next);
    return Object.keys(next).length === 0;
  }

  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(values)) {
      if (value !== "") payload[name] = value;
    }
    for (const [name, list] of Object.entries(checks)) {
      if (list.length) payload[name] = list;
    }
    return payload;
  }

  async function submit() {
    if (!validateStep(stepCount)) return;
    setStatus("sending");
    setMessage("");
    const formData = new FormData();
    formData.append("payload", JSON.stringify(buildPayload()));
    formData.append("__hp", honeypot);
    for (const [name, file] of Object.entries(files)) {
      if (file) formData.append(name, file);
    }
    try {
      const response = await fetch(config.endpoint, { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Не удалось отправить заявку. Попробуйте ещё раз.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  }

  async function downloadWithData() {
    if (!config.consents) return;
    try {
      const response = await fetch("/api/forms/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: config.consents.kind, data: buildPayload() }),
      });
      if (!response.ok) {
        setMessage("Не удалось подготовить документ.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        config.consents.kind === "apply-doc"
          ? "Soglasie_Obrazovanie_na_vysote.doc"
          : "Soglasie_uchastnika.pdf";
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {
      setMessage("Не удалось подготовить документ.");
    }
  }

  if (status === "done") {
    if (embedded) {
      return (
        <div ref={successRef} className="mt-8 max-w-[54ch]" role="status">
          <p className="m-0 font-display text-[clamp(22px,2.4vw,26px)] leading-[1.2] font-semibold tracking-[-0.02em] text-navy">
            {config.successTitle}
          </p>
          <p className="mt-3 text-[17px] leading-[1.55] font-light text-ink">{config.successText}</p>
        </div>
      );
    }
    return (
      <section className="section">
        <div ref={successRef} className="wrap max-w-[620px] text-center">
          <h2 className="section-title mx-auto text-center">{config.successTitle}</h2>
          <p className="lead mx-auto text-center">{config.successText}</p>
        </div>
      </section>
    );
  }

  const currentSections = config.sections.filter((section) =>
    stepCount ? (section.fields[0]?.step ?? 1) === step : true,
  );

  const gridClass = "grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2";

  const renderField = (field: FieldDef) => (
    <FieldInput
      key={field.name}
      field={field}
      value={values[field.name] ?? ""}
      checked={checks[field.name] ?? []}
      error={errors[field.name]}
      embedded={embedded}
      onChange={setValue}
      onToggle={toggleCheck}
    />
  );

  const filesBlock = (
    <>
      {config.files.map((file) => {
        if (stepCount && file.step !== step) return null;
        return (
          <FileInput
            key={file.name}
            name={file.name}
            label={file.label}
            hint={file.hint}
            error={errors[file.name]}
            file={files[file.name] ?? null}
            onPick={(chosen) => {
              setFiles((prev) => ({ ...prev, [file.name]: chosen }));
              setErrors((prev) => ({ ...prev, [file.name]: "" }));
            }}
          />
        );
      })}
    </>
  );

  const consentsBlock = config.consents ? (
    <div className="md:col-span-2">
      <div className="rounded-[12px] bg-[var(--color-sky-tint)] p-5">
        <p className="mb-2 text-[15px] font-semibold text-navy">Согласие</p>
        <p className="mb-4 text-[14px] leading-snug font-light text-ink">
          Скачайте шаблон, заполните и подпишите его, затем прикрепите скан.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            className="inline-flex min-h-10 items-center rounded-full border border-[var(--field-line)] px-4 text-[13px] font-semibold text-navy no-underline hover:bg-white"
            href={`/api/forms/consent?kind=${config.consents.kind}`}
          >
            {config.consents.kind === "apply-doc"
              ? "Скачать пустой шаблон (Word)"
              : "Скачать пустой бланк PDF"}
          </a>
          <button
            type="button"
            onClick={() => void downloadWithData()}
            className="inline-flex min-h-10 items-center rounded-full bg-navy px-4 text-[13px] font-semibold text-white hover:bg-navy-deep"
          >
            {config.consents.kind === "apply-doc"
              ? "Скачать Word с данными анкеты"
              : "Скачать PDF с моими данными"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const messageBlock = message ? (
    <p role="alert" className="mt-8 rounded-[12px] bg-[var(--danger-soft)] px-4 py-3 text-[14px] leading-snug text-danger">
      {message}
    </p>
  ) : null;

  const embeddedSubmit = (
    <div className="mt-14 flex flex-col items-start gap-4">
      <p className="m-0 max-w-[46ch] text-[13px] leading-snug font-light text-ink-soft">
        Все поля обязательны, кроме отмеченных «если нужно».
      </p>
      <button
        type="submit"
        disabled={status === "sending"}
        className="min-h-13 w-full shrink-0 rounded-full bg-navy px-8 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Отправляем…" : config.submitLabel}
      </button>
    </div>
  );

  const standaloneSubmit = (
    <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
      {stepCount && step > 1 ? (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="min-h-12 rounded-full border border-[var(--field-line)] px-5 text-lead font-semibold text-navy hover:bg-sky-tint"
        >
          Назад
        </button>
      ) : (
        <span />
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="min-h-12 rounded-full bg-navy px-6 text-lead font-semibold text-white transition hover:-translate-y-px disabled:opacity-60"
      >
        {stepCount && step < stepCount ? "Далее" : status === "sending" ? "Отправка…" : config.submitLabel}
      </button>
    </div>
  );

  const honeypotBlock = (
    <div className="sr-only" aria-hidden="true">
      <label htmlFor="__hp">Не заполняйте это поле</label>
      <input
        id="__hp"
        name="__hp"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
      />
    </div>
  );

  const stepBar =
    stepCount && !embedded ? (
      <>
        <ol className="mb-4 flex gap-2">
          {config.steps!.map((s, index) => (
            <li
              key={s.label}
              className={`h-1 flex-1 rounded-full ${
                index < step ? "bg-navy" : "bg-[var(--line)]"
              }`}
            />
          ))}
        </ol>
        <p className="mb-5 text-caption tracking-[0.16em] text-navy uppercase">
          {step} / {stepCount} — {sectionTitleByStep.get(step) ?? config.steps![step - 1].label}
        </p>
      </>
    ) : null;

  if (!embedded) {
    return (
      <section className="section">
        <div className="wrap max-w-[860px]">
          {config.kicker ? <p className="eyebrow">{config.kicker}</p> : null}
          <h1 className="section-title">{config.title}</h1>
          {config.lead ? <p className="lead mb-6">{config.lead}</p> : null}
          {config.paragraphs?.map((text) => (
            <p key={text} className="mb-4 text-ui font-light leading-relaxed text-ink">
              {text}
            </p>
          ))}

          {config.facts?.length ? (
            <div className="my-6 grid gap-3 sm:grid-cols-2">
              {config.facts.map((fact) => (
                <div
                  key={fact}
                  className="rounded-[var(--radius-field)] border border-[var(--line-soft)] bg-white px-4 py-3 text-meta text-navy"
                >
                  {fact}
                </div>
              ))}
            </div>
          ) : null}

          {config.waves?.length ? (
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {config.waves.map((wave) => (
                <div
                  key={wave.label}
                  className="rounded-[var(--radius-soft)] border border-[var(--line-soft)] bg-white px-4 py-3"
                >
                  <b className="block text-caption tracking-wide text-gold-ink uppercase">
                    {wave.label}
                  </b>
                  <span className="text-meta text-ink">{wave.text}</span>
                </div>
              ))}
            </div>
          ) : null}

          {config.notes?.map((note) => (
            <p
              key={note}
              className="mb-3 rounded-r-[14px] border-l-[3px] border-gold bg-[var(--color-sky-tint)] px-4 py-3 text-meta leading-relaxed text-ink"
            >
              {note}
            </p>
          ))}

          {config.finance ? (
            <div className="my-6 rounded-[var(--radius-panel)] border border-[var(--line-soft)] bg-white p-5">
              <h3 className="mb-2 text-lead font-semibold text-navy">{config.finance.title}</h3>
              <p className="text-ui font-light text-ink">{config.finance.lead}</p>
              <ul className="mt-2 list-disc pl-5 text-ui font-light text-ink">
                {config.finance.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {config.closedText ? (
            <p className="mt-6 rounded-[var(--radius-card)] border border-[var(--line-soft)] bg-white p-6 text-ui text-ink sm:p-8">
              {config.closedText}
            </p>
          ) : (
            <form
              ref={formRef}
              className="relative mt-6 rounded-[var(--radius-card)] border border-[var(--line-soft)] bg-white p-6 shadow-[var(--shadow-brand)] sm:p-8"
              onSubmit={(event) => {
                event.preventDefault();
                if (stepCount && step < stepCount) {
                  if (validateStep(step)) setStep(step + 1);
                  return;
                }
                void submit();
              }}
            >
              {honeypotBlock}
              {stepBar}

              <div className={gridClass}>
                {currentSections.map((section, index) => (
                  <div key={section.title ?? index} className="contents">
                    {section.fields.filter(visible).map(renderField)}
                  </div>
                ))}
                {filesBlock}
                {consentsBlock}
              </div>

              {messageBlock}

              <p className="mt-4 text-caption text-ink-soft">
                Отправляя форму, вы подтверждаете согласие с{" "}
                <a href="/privacy" className="font-semibold text-navy underline">
                  Политикой конфиденциальности
                </a>
                .
              </p>

              {standaloneSubmit}
            </form>
          )}
        </div>
      </section>
    );
  }

  return (
    <form
      ref={formRef}
      className="relative mt-5"
      aria-label="Заявка на участие"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {intro ? (
        <p className="m-0 mb-8 max-w-[52ch] text-[17px] leading-[1.6] font-light text-ink">{intro}</p>
      ) : null}
      {honeypotBlock}

      {config.closedText ? (
        <p className="mt-8 max-w-[54ch] text-[17px] leading-[1.55] font-light text-ink">
          {config.closedText}
        </p>
      ) : (
        <>
          {config.sections.map((section, index) => {
            const fields = section.fields.filter(visible);
            if (!fields.length) return null;

            if (section.collapsible) {
              return (
                <details
                  key={section.title ?? index}
                  className="group mt-14"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[19px] font-semibold tracking-[-0.015em] text-navy [&::-webkit-details-marker]:hidden">
                    {section.title}
                    <span
                      aria-hidden="true"
                      className="text-[24px] leading-none font-light text-ink-soft transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className={`${gridClass} mt-6`}>{fields.map(renderField)}</div>
                </details>
              );
            }

            return (
              <fieldset
                key={section.title ?? index}
                className={index === 0 ? "mt-8 border-0 p-0" : "mt-12 border-0 p-0"}
              >
                {section.title ? (
                  <legend className="mb-6 p-0 font-display text-[19px] font-semibold tracking-[-0.015em] text-navy">
                    {section.title}
                  </legend>
                ) : null}
                <div className={gridClass}>{fields.map(renderField)}</div>
              </fieldset>
            );
          })}

          {config.files.length ? <div className={`${gridClass} mt-4`}>{filesBlock}</div> : null}
          {config.consents ? <div className={`${gridClass} mt-4`}>{consentsBlock}</div> : null}

          {messageBlock}
          {embeddedSubmit}
        </>
      )}
    </form>
  );
}

function FieldInput({
  field,
  value,
  checked,
  error,
  embedded,
  onChange,
  onToggle,
}: {
  field: FieldDef;
  value: string;
  checked: string[];
  error?: string;
  embedded: boolean;
  onChange: (name: string, value: string) => void;
  onToggle: (name: string, value: string, on: boolean, max?: number) => void;
}) {
  const wrapClass = field.wide ? "md:col-span-2" : "";
  const listId = `list-${field.name}`;
  const hintId = `${field.name}-hint`;
  const errorId = `${field.name}-error`;
  const describedBy =
    [field.hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

  const labelClass = embedded
    ? "mb-2 block text-[14px] leading-snug font-medium text-ink"
    : "mb-2 block text-ui font-medium text-ink";
  const hintClass = embedded
    ? "mb-2.5 block max-w-[56ch] text-[13px] leading-[1.45] font-light text-ink-soft"
    : "mb-2 block text-caption font-light text-ink-soft";

  const requiredMark = field.required && !embedded ? (
    <>
      <span aria-hidden="true"> *</span>
      <span className="sr-only"> (обязательное поле)</span>
    </>
  ) : null;

  const errorBlock = error ? (
    <p id={errorId} className="mt-2 text-[13px] leading-snug text-danger">
      {error}
    </p>
  ) : null;

  const hintBlock = field.hint ? (
    <p id={hintId} className={hintClass}>
      {field.hint}
    </p>
  ) : null;

  // Одиночная отметка «Да» — это по сути длинное утверждение.
  // Показываем его подписью чекбокса, без лишнего слова «Да».
  if (field.type === "checkboxes" && field.options?.length === 1) {
    const option = field.options[0];
    const on = checked.includes(option.value);
    return (
      <div className={`${wrapClass} pt-1`} data-field={field.name}>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name={field.name}
            value={option.value}
            checked={on}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-required={field.required || undefined}
            onChange={(event) =>
              onToggle(field.name, option.value, event.target.checked, field.exactCount)
            }
            className="mt-[3px] h-[18px] w-[18px] shrink-0 accent-navy"
          />
          <span className="text-[15px] leading-[1.55] font-light text-ink">{field.label}</span>
        </label>
        {errorBlock}
      </div>
    );
  }

  if (field.type === "radio" || field.type === "checkboxes") {
    const isRadio = field.type === "radio";
    return (
      <div
        className={wrapClass}
        data-field={field.name}
        role={isRadio ? "radiogroup" : "group"}
        aria-labelledby={`${field.name}-label`}
        aria-describedby={describedBy}
      >
        <p id={`${field.name}-label`} className={labelClass}>
          {field.label}
          {requiredMark}
        </p>
        {hintBlock}
        <div className="flex flex-col">
          {field.options!.map((option) => {
            const on = isRadio ? value === option.value : checked.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 py-2.5 transition-colors duration-150 ${
                  on ? "text-navy" : "text-ink hover:text-navy"
                }`}
              >
                <input
                  type={isRadio ? "radio" : "checkbox"}
                  name={field.name}
                  value={option.value}
                  checked={on}
                  onChange={(event) =>
                    isRadio
                      ? onChange(field.name, option.value)
                      : onToggle(field.name, option.value, event.target.checked, field.exactCount)
                  }
                  className="mt-[4px] h-[18px] w-[18px] shrink-0 accent-navy"
                />
                <span
                  className={`${embedded ? "text-[16px]" : "text-ui"} leading-[1.45] ${
                    on ? "font-medium" : "font-light"
                  }`}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
        {errorBlock}
      </div>
    );
  }

  return (
    <div className={wrapClass} data-field={field.name}>
      <label className={labelClass} htmlFor={field.name}>
        {field.label}
        {requiredMark}
      </label>
      {hintBlock}

      {field.type === "select" ? (
        <select
          id={field.name}
          name={field.name}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={field.required || undefined}
          onChange={(event) => onChange(field.name, event.target.value)}
          className="form-field form-select"
        >
          <option value="">— выберите —</option>
          {field.options!.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <>
          <textarea
            id={field.name}
            name={field.name}
            rows={5}
            value={value}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-required={field.required || undefined}
            onChange={(event) => onChange(field.name, event.target.value)}
            className="form-field resize-y"
          />
          {field.maxLength && field.maxLength <= 600 ? (
            <p
              className={`mt-2 text-right text-[13px] tabular-nums ${
                value.length >= field.maxLength ? "text-danger" : "text-ink-soft"
              }`}
            >
              {value.length} / {field.maxLength}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={value}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            list={field.datalist ? listId : undefined}
            autoComplete={AUTOCOMPLETE[field.name]}
            inputMode={field.name === "snils" || field.name === "inn" ? "numeric" : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-required={field.required || undefined}
            onChange={(event) => onChange(field.name, event.target.value)}
            className="form-field"
          />
          {field.datalist ? (
            <datalist id={listId}>
              {field.datalist.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          ) : null}
        </>
      )}

      {errorBlock}
    </div>
  );
}

function FileInput({
  name,
  label,
  hint,
  error,
  file,
  onPick,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  file: File | null;
  onPick: (file: File | null) => void;
}) {
  return (
    <div className="md:col-span-2" data-field={name}>
      <p className="mb-2 text-ui font-medium text-ink">
        {label}
        {" *"}
      </p>
      {hint ? <p className="mb-2 text-caption font-light text-ink-soft">{hint}</p> : null}
      <label className="relative flex cursor-pointer items-center gap-3.5 rounded-[16px] border border-dashed border-[var(--field-line-hover)] bg-[var(--color-sky-tint)] p-4">
        <input
          type="file"
          name={name}
          onChange={(event) => {
            const chosen = event.target.files?.[0] ?? null;
            if (chosen && chosen.size > 20 * 1024 * 1024) {
              alert("Файл слишком большой: максимум 20 МБ");
              event.target.value = "";
              onPick(null);
              return;
            }
            onPick(chosen);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className="inline-flex min-h-10 items-center rounded-full bg-navy px-4 text-meta text-white">
          Загрузить
        </span>
        <span className="text-caption text-ink-soft">
          {file ? `${file.name} · файл выбран` : "PDF, JPG, PNG или DOC/DOCX, до 20 МБ"}
        </span>
      </label>
      {error ? <p className="mt-1.5 text-caption text-danger">{error}</p> : null}
    </div>
  );
}
