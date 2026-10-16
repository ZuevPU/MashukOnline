"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section">
      <div className="wrap max-w-155 text-center">
        <p className="eyebrow">Ошибка</p>
        <h1 className="section-title mx-auto text-center">Что-то пошло не так</h1>
        <p className="lead mx-auto mb-7 text-center">
          Попробуйте обновить страницу. Если ошибка повторяется — напишите нам на
          online@czmashuk.ru.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition hover:bg-navy-deep"
          >
            Попробовать снова
          </button>
          <ButtonLink href="/" variant="outline">
            На главную
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
