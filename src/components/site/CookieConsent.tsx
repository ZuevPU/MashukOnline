"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "mashuk-cookie-consent";
const YM_ID = 104001534;

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

/**
 * Согласие на использование cookie и аналитики (152-ФЗ).
 * Аналитика подключается только при явном согласии; выбор запоминается.
 */
export function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "accepted") {
      loadMetrika();
      setChoice("accepted");
    } else if (saved === "declined") {
      setChoice("declined");
    }
    setReady(true);
  }, []);

  function accept() {
    window.localStorage.setItem(KEY, "accepted");
    loadMetrika();
    setChoice("accepted");
  }

  function decline() {
    window.localStorage.setItem(KEY, "declined");
    setChoice("declined");
  }

  if (!ready || choice) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-140 rounded-[18px] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-brand)] sm:inset-x-auto sm:left-4 sm:right-4">
      <p className="m-0 mb-3 text-meta leading-relaxed text-ink">
        Мы используем файлы cookie и системы аналитики, чтобы сайт работал корректно и мы понимали,
        что улучшить. Подробнее — в{" "}
        <Link href="/privacy" className="font-semibold text-navy underline">
          Политике конфиденциальности
        </Link>
        .
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={accept}
          className="min-h-10 rounded-full bg-navy px-4 text-meta font-semibold text-white hover:bg-navy-deep"
        >
          Принять
        </button>
        <button
          type="button"
          onClick={decline}
          className="min-h-10 rounded-full border border-[var(--line)] px-4 text-meta font-semibold text-navy hover:bg-sky-tint"
        >
          Только необходимые
        </button>
      </div>
    </div>
  );
}
