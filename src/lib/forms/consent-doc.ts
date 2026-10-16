import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Согласие на обработку персональных данных для семинара «Образование на
 * высоте». Готовим Word-документ (HTML с MIME application/msword — его
 * открывает Word и LibreOffice), подставляя данные из анкеты. Пустые поля
 * остаются прочерками, чтобы документ можно было заполнить от руки.
 */

const CONSENT_TEXT = path.join(
  process.cwd(),
  "src",
  "lib",
  "forms",
  "consent",
  "consent-text.txt",
);

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function text(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export async function buildApplyConsentDoc(data: Record<string, unknown>): Promise<string> {
  const raw = await readFile(CONSENT_TEXT, "utf-8");

  // Тело согласия начинается со слов «свободно, своей волей…»; ниже подписи отрезаем.
  const markerIndex = raw.indexOf("свободно, своей");
  let body = markerIndex >= 0 ? raw.slice(markerIndex) : raw;
  const signCut = body.indexOf("____________________");
  if (signCut >= 0) body = body.slice(0, signCut).replace(/\s+$/, "");

  const fioRu = text(data, "fio_ru");
  const fio = fioRu && fioRu.toLowerCase() !== "нет" ? fioRu : text(data, "fio_latin");
  const addr = text(data, "address") || "____________________";
  const ser = text(data, "passport_series") || "______";
  const num = text(data, "passport_number") || "__________";
  const pdt = text(data, "passport_date") || "__________";
  const pby = text(data, "passport_issued") || "____________________";
  const phone = text(data, "phone") || "____________________";
  const pass = `${ser} ${num}, ${pdt}, ${pby}`;

  const header =
    `Я, ${fio || "____________________"}, зарегистрированный(-ая) по адресу: ${addr}, ` +
    `основной документ, удостоверяющий личность (паспорт) ${pass}, номер телефона: ${phone}`;

  const paragraphs = body
    .split(/\n+/)
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 10pt;font-size:12pt;line-height:1.35;text-align:justify;font-family:Times New Roman,serif">${esc(p)}</p>`,
    )
    .join("");

  const title = "Согласие на обработку персональных данных";
  const html =
    "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>" +
    `<head><meta charset="utf-8"><title>${esc(title)}</title></head>` +
    "<body style='font-family:Times New Roman,serif'>" +
    "<p style='text-align:right;font-size:12pt'>Приложение № 2</p>" +
    `<p style='text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0'>${esc(title)}</p>` +
    `<p style='margin:0 0 10pt;font-size:12pt;line-height:1.35;text-align:justify;font-family:Times New Roman,serif'>${esc(header)}</p>` +
    paragraphs +
    `<p style='margin-top:28pt'>____________________ / ${esc(fio)} / &nbsp;&nbsp;&nbsp;«____» ________ 20__ г.</p>` +
    "<p style='font-size:10pt'>подпись &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; расшифровка</p>" +
    "</body></html>";

  return "\ufeff" + html;
}
