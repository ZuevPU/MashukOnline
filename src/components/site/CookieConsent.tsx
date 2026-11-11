"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "mashuk-cookie-consent";
const YEAR = 60 * 60 * 24 * 365;
const YM_ID = 104001534;

type Choice = "accepted" | "declined";

/** Загружает Яндекс.Метрику только после согласия пользователя. */
function loadMetrika(): void {
  if (typeof window === "undefined" || (window as unknown as { ym?: unknown }).ym) return;
  const code =
    "(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(" +
    YM_ID +
    ",'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});";
  const script = document.createElement("script");
  script.textContent = code;
  document.head.appendChild(script);
}

/** Запоминает выбор и в localStorage, и в cookie: cookie читает сервер. */
function remember(choice: Choice): void {
  window.localStorage.setItem(KEY, choice);
  document.cookie = `${KEY}=${choice}; path=/; max-age=${YEAR}; samesite=lax`;
}

/**
 * Согласие на использование cookie и аналитики (152-ФЗ).
 * Аналитика подключается только при явном согласии.
 *
 * Ответ приходит из layout (cookie), поэтому полоса рендерится сразу и не
 * сдвигает страницу после гидратации. Это не всплывающее окно: пока решение
 * не принято, полоса занимает своё место в потоке и не закрывает форму.
 */
export function CookieConsent({ initial = null }: { initial?: Choice | null }) {
  const [choice, setChoice] = useState<Choice | null>(initial);

  useEffect(() => {
    if (initial === "accepted") loadMetrika();
    if (initial) return;
    // Переносим выбор, сделанный до появления cookie (старые визиты).
    const saved = window.localStorage.getItem(KEY);
    if (saved === "accepted" || saved === "declined") {
      if (saved === "accepted") loadMetrika();
      setChoice(saved);
      document.cookie = `${KEY}=${saved}; path=/; max-age=${YEAR}; samesite=lax`;
    }
  }, [initial]);

  function accept() {
    remember("accepted");
    loadMetrika();
    setChoice("accepted");
  }

  function decline() {
    remember("declined");
    setChoice("declined");
  }

  if (choice) return null;

  return (
    <div className="bg-[var(--color-sky-tint)]" role="region" aria-label="Согласие на использование cookie">
      <div className="wrap flex flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:gap-6">
        <p className="m-0 max-w-[80ch] text-[13px] leading-[1.45] text-ink">
          Мы используем cookie и аналитику, чтобы сайт работал корректно. Подробнее — в{" "}
          <Link href="/privacy" className="font-medium text-navy underline underline-offset-2">
            Политике конфиденциальности
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={decline}
            className="min-h-9 rounded-full border border-[var(--field-line)] px-4 text-[13px] font-medium text-navy transition-colors hover:bg-white"
          >
            Только необходимые
          </button>
          <button
            type="button"
            onClick={accept}
            className="min-h-9 rounded-full bg-navy px-5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-deep"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
