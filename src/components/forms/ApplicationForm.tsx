"use client";

import { useMemo, useState } from "react";
import type { FieldDef, FormConfig } from "@/lib/forms/types";

/* ==========================================================================
   Универсальная анкета: рисует любое описание формы из src/lib/forms.
   Серверные проверки дублируются на клиенте, чтобы человек сразу видел
   ошибку, а не ждал ответа сервера.
   ========================================================================== */

type Values = Record<string, string>;
type Checks = Record<string, string[]>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldInputValue(type: string): string {
  return type === "date" ? "" : "";
}

export function ApplicationForm({ config }: { config: FormConfig }) {
  const [values, setValues] = useState<Values>({});
  const [checks, setChecks] = useState<Checks>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

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

  function validateStep(current: number): boolean {
    const next: Record<string, string> = {};
    const fields = stepCount ? stepFields.get(current) ?? [] : config.sections.flatMap((s) => s.fields);
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
    return (
      <section className="section">
        <div className="wrap max-w-[620px] text-center">
          <h2 className="section-title mx-auto text-center">{config.successTitle}</h2>
          <p className="lead mx-auto text-center">{config.successText}</p>
        </div>
      </section>
    );
  }

  const currentSections = config.sections.filter((section) =>
    stepCount ? (section.fields[0]?.step ?? 1) === step : true,
  );

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
                <b className="block text-caption uppercase tracking-wide text-gold-ink">
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
            className="mb-3 rounded-r-[14px] border-l-[3px] border-gold bg-[rgba(162,133,95,0.08)] px-4 py-3 text-meta leading-relaxed text-ink"
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

        <form
          className="mt-6 rounded-[var(--radius-card)] border border-[var(--line-soft)] bg-white p-6 shadow-[var(--shadow-brand)] sm:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            if (stepCount && step < stepCount) {
              if (validateStep(step)) setStep(step + 1);
              return;
            }
            void submit();
          }}
        >
          <div className="pointer-events-none absolute top-0 left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
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
          {stepCount ? (
            <>
              <ol className="mb-4 flex gap-2">
                {config.steps!.map((s, index) => (
                  <li
                    key={s.label}
                    className={`h-1 flex-1 rounded-full ${
                      index < step ? "bg-navy" : "bg-[rgba(34,63,154,0.12)]"
                    }`}
                  />
                ))}
              </ol>
              <p className="mb-5 text-caption uppercase tracking-[0.16em] text-navy">
                {step} / {stepCount} — {sectionTitleByStep.get(step) ?? config.steps![step - 1].label}
              </p>
            </>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {currentSections.map((section, index) => (
              <div key={section.title ?? index} className="contents">
                {section.fields.map((field) =>
                  visible(field) ? (
                    <FieldInput
                      key={field.name}
                      field={field}
                      value={values[field.name] ?? ""}
                      checked={checks[field.name] ?? []}
                      error={errors[field.name]}
                      onChange={setValue}
                      onToggle={toggleCheck}
                    />
                  ) : null,
                )}
              </div>
            ))}

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

            {config.consents && (config.files.some((f) => !stepCount || f.step === step)) ? (
              <div className="md:col-span-2">
                <div className="rounded-[var(--radius-soft)] border border-[var(--line-soft)] bg-[rgba(34,63,154,0.05)] p-4">
                  <p className="mb-3 text-caption uppercase tracking-[0.16em] text-gold-ink">
                    Согласие
                  </p>
                  <p className="mb-3 text-meta text-ink">
                    Скачайте шаблон, заполните и подпишите его, затем прикрепите скан.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      className="inline-flex min-h-10 items-center rounded-full border border-[rgba(34,63,154,0.2)] px-4 text-meta font-semibold text-navy no-underline hover:bg-sky-tint"
                      href={`/api/forms/consent?kind=${config.consents.kind}`}
                    >
                      {config.consents.kind === "apply-doc"
                        ? "Скачать пустой шаблон (Word)"
                        : "Скачать пустой бланк PDF"}
                    </a>
                    <button
                      type="button"
                      onClick={() => void downloadWithData()}
                      className="inline-flex min-h-10 items-center rounded-full bg-gold px-4 text-meta font-semibold text-white hover:-translate-y-px"
                    >
                      {config.consents.kind === "apply-doc"
                        ? "Скачать Word с данными анкеты"
                        : "Скачать PDF с моими данными"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {message ? (
            <p className="mt-4 rounded-[var(--radius-field)] bg-[rgba(193,57,74,0.08)] px-4 py-3 text-meta text-danger">
              {message}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
            {stepCount && step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="min-h-12 rounded-full border border-[rgba(34,63,154,0.2)] px-5 text-lead font-semibold text-navy hover:bg-sky-tint"
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
        </form>
      </div>
    </section>
  );
}

function FieldInput({
  field,
  value,
  checked,
  error,
  onChange,
  onToggle,
}: {
  field: FieldDef;
  value: string;
  checked: string[];
  error?: string;
  onChange: (name: string, value: string) => void;
  onToggle: (name: string, value: string, on: boolean, max?: number) => void;
}) {
  const inputClass =
    "w-full rounded-[14px] border bg-[color:var(--color-paper)] px-3.5 py-3 text-ui text-[color:var(--color-black-ink)] outline-none transition focus:border-navy focus:bg-white focus:ring-4 focus:ring-[rgba(34,63,154,0.12)] " +
    (error ? "border-danger" : "border-[rgba(34,63,154,0.18)]");
  const wrapClass = field.wide ? "md:col-span-2" : "";
  const listId = `list-${field.name}`;

  return (
    <div className={wrapClass} data-field={field.name}>
      <label className="mb-2 block text-ui font-medium text-ink" htmlFor={field.name}>
        {field.label}
        {field.required ? " *" : ""}
      </label>
      {field.hint ? <p className="mb-2 text-caption font-light text-ink-soft">{field.hint}</p> : null}

      {field.type === "radio" ? (
        <div className="flex flex-col gap-2">
          {field.options!.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-[14px] border px-3 py-2.5 text-ui ${
                value === option.value
                  ? "border-navy bg-[rgba(34,63,154,0.06)]"
                  : "border-[rgba(34,63,154,0.1)] hover:border-[rgba(34,63,154,0.28)]"
              }`}
            >
              <input
                type="radio"
                name={field.name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(field.name, option.value)}
                className="mt-1 accent-navy"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ) : field.type === "checkboxes" ? (
        <div className="flex flex-col gap-2">
          {field.options!.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-[14px] border px-3 py-2.5 text-ui ${
                checked.includes(option.value)
                  ? "border-navy bg-[rgba(34,63,154,0.06)]"
                  : "border-[rgba(34,63,154,0.1)] hover:border-[rgba(34,63,154,0.28)]"
              }`}
            >
              <input
                type="checkbox"
                name={field.name}
                value={option.value}
                checked={checked.includes(option.value)}
                onChange={(event) =>
                  onToggle(field.name, option.value, event.target.checked, field.exactCount)
                }
                className="mt-1 accent-navy"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ) : field.type === "select" ? (
        <select
          id={field.name}
          name={field.name}
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={inputClass}
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
            onChange={(event) => onChange(field.name, event.target.value)}
            className={`${inputClass} min-h-[120px] resize-y`}
          />
          {field.minLength ? (
            <p
              className={`mt-1 text-right text-caption ${
                value.trim().length < field.minLength ? "text-danger" : "text-ink-soft"
              }`}
            >
              {value.trim().length} / {field.minLength} символов
            </p>
          ) : null}
        </>
      ) : (
        <>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={value || fieldInputValue(field.type)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            list={field.datalist ? listId : undefined}
            inputMode={field.name === "snils" || field.name === "inn" ? "numeric" : undefined}
            onChange={(event) => onChange(field.name, event.target.value)}
            className={inputClass}
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

      {error ? <p className="mt-1.5 text-caption text-danger">{error}</p> : null}
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
      <label className="relative flex cursor-pointer items-center gap-3.5 rounded-[16px] border border-dashed border-[rgba(34,63,154,0.28)] bg-[rgba(34,63,154,0.03)] p-4">
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
