/**
 * Уведомления в Telegram через бота.
 *
 * Переменные:
 *   TELEGRAM_BOT_TOKEN  токен бота от @BotFather
 *   TELEGRAM_CHAT_ID    куда писать: id чата, группы или канала
 *                       (несколько — через запятую)
 *
 * Пока переменные не заданы, уведомления молча отключены. Ошибка отправки
 * не мешает сохранению данных: обращение уже записано в базу.
 */

function config(): { token: string; chats: string[] } | null {
  const token = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
  const chats = (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return token && chats.length > 0 ? { token, chats } : null;
}

export function telegramConfigured(): boolean {
  return config() !== null;
}

/** Экранирование для parse_mode=HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Отправить сообщение (HTML-разметка Telegram). Не бросает исключений. */
export async function notifyTelegram(html: string): Promise<void> {
  const cfg = config();
  if (!cfg) return;
  await Promise.all(
    cfg.chats.map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: html.slice(0, 4000),
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) {
          console.error("telegram notify failed", response.status, (await response.text()).slice(0, 200));
        }
      } catch (error) {
        console.error("telegram notify failed", error instanceof Error ? error.message : error);
      }
    }),
  );
}
