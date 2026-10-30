"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { BestPractice } from "@/lib/best-practices";

/** Карточки практик с поиском по названию и организации. */
export function PracticeList({ practices }: { practices: BestPractice[] }) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return practices;
    return practices.filter((p) => `${p.title} ${p.org}`.toLowerCase().includes(q));
  }, [practices, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="m-0 font-display text-title font-semibold tracking-[-0.03em] text-navy">Лучшие практики</h2>
        <label className="relative w-full max-w-90">
          <span className="sr-only">Поиск по практикам</span>
          <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по названию или организации"
            className="min-h-11 w-full rounded-full border border-[var(--line)] bg-white pr-4 pl-10 text-ui outline-none focus:border-navy"
          />
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="m-0 text-ui text-ink-soft">Ничего не найдено.</p>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((practice, index) => (
            <li key={`${practice.url}-${index}`}>
              <a
                href={practice.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex h-full flex-col gap-3 p-6 no-underline"
              >
                <span className="font-display text-lead font-semibold tracking-[-0.02em] text-navy group-hover:underline">
                  {practice.title}
                </span>
                {practice.org && (
                  <span className="text-meta font-light leading-relaxed text-ink-soft">{practice.org}</span>
                )}
                <span className="mt-auto inline-flex items-center gap-1.5 text-meta font-semibold text-navy">
                  Изучить <span aria-hidden="true">↗</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
