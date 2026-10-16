import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import type { PDFFont, PDFPage, RGB } from "pdf-lib";

/**
 * Заполнение PDF-бланка согласия муниципалитетов данными из анкеты.
 *
 * Координаты перенесены один в один из старой формы (reportlab): текст
 * наносится поверх бланка в тех же точках. Шрифт с кириллицей — Noto Serif.
 * Если что-то не сходится (нет шрифта, нет данных) — отдаём пустой бланк.
 */

const CONSENT_DIR = path.join(process.cwd(), "src", "lib", "forms", "consent");
const BLANK = path.join(CONSENT_DIR, "municipal-consent.pdf");
const FONT = path.join(
  process.cwd(),
  "src",
  "assets",
  "fonts",
  "noto-serif",
  "NotoSerif-Regular.ttf",
);

const INK: RGB = rgb(0.1, 0.08, 0.07);
const WHITE: RGB = rgb(1, 1, 1);

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

function text(data: Record<string, unknown>, key: string): string {
  return String(data[key] ?? "").replace(/\s+/g, " ").trim();
}

function hasFill(data: Record<string, unknown>): boolean {
  return ["fio", "address", "phone", "email", "passport_series", "passport_number", "passport_issued"].some(
    (key) => text(data, key),
  );
}

function passport(data: Record<string, unknown>): string {
  return [text(data, "passport_series"), text(data, "passport_number")].filter(Boolean).join(" ");
}

function dateParts(data: Record<string, unknown>): [string, string, string] {
  const raw = text(data, "fill_date");
  let dt = new Date();
  if (raw) {
    const parts = raw.replace(/[/.]/g, "-").split("-");
    if (parts.length === 3) {
      const [a, b, c] = parts;
      const parsed =
        a.length === 4
          ? new Date(Number(a), Number(b) - 1, Number(c))
          : new Date(Number(c), Number(b) - 1, Number(a));
      if (!Number.isNaN(parsed.getTime())) dt = parsed;
    }
  }
  const day = String(dt.getDate()).padStart(2, "0");
  return [day, MONTHS[dt.getMonth()], String(dt.getFullYear())];
}

function drawText(
  page: PDFPage,
  font: PDFFont,
  value: string,
  x: number,
  y: number,
  size = 10.5,
  width = 430,
): void {
  if (!value) return;
  let text = value;
  while (text && font.widthOfTextAtSize(text, size) > width) text = text.slice(0, -1);
  if (!text) return;
  page.drawText(text, { x, y, size, font, color: INK });
}

function drawWrap(
  page: PDFPage,
  font: PDFFont,
  value: string,
  x: number,
  y: number,
  size: number,
  width: number,
  extraX: number,
  extraY: number,
  extraWidth = 500,
): void {
  if (!value) return;
  if (font.widthOfTextAtSize(value, size) <= width) {
    drawText(page, font, value, x, y, size, width);
    return;
  }
  const words = value.split(" ");
  const first: string[] = [];
  let rest: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const trial = [...first, words[i]].join(" ");
    if (font.widthOfTextAtSize(trial, size) <= width) {
      first.push(words[i]);
    } else {
      rest = words.slice(i);
      break;
    }
  }
  drawText(page, font, first.join(" ") || value, x, y, size, width);
  if (rest.length) drawText(page, font, rest.join(" "), extraX, extraY, size, extraWidth);
}

function drawDate(page: PDFPage, font: PDFFont, parts: [string, string, string], x: number, y: number, size = 10): void {
  const value = `«${parts[0]}» ${parts[1]} ${parts[2]} г.`;
  page.drawRectangle({ x: x - 2, y: y - 5, width: 585 - x, height: size + 8, color: WHITE });
  page.drawText(value, { x, y, size, font, color: INK });
}

export async function blankMunicipalConsent(): Promise<Uint8Array> {
  return new Uint8Array(await readFile(BLANK));
}

export async function filledMunicipalConsent(data: Record<string, unknown>): Promise<Uint8Array> {
  if (!hasFill(data)) return blankMunicipalConsent();

  let fontBytes: Uint8Array;
  try {
    fontBytes = new Uint8Array(await readFile(FONT));
  } catch {
    return blankMunicipalConsent();
  }

  const doc = await PDFDocument.load(await readFile(BLANK), { ignoreEncryption: true });
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fontBytes, { subset: true });

  const fio = text(data, "fio");
  const address = text(data, "address");
  const phone = text(data, "phone");
  const email = text(data, "email");
  const pass = passport(data);
  const issued = text(data, "passport_issued");
  const dated = dateParts(data);
  const pages = doc.getPages();

  if (pages[0]) {
    const p = pages[0];
    drawText(p, font, fio, 68, 748, 11, 470);
    drawWrap(p, font, address, 204, 716, 10, 340, 48, 701);
    drawText(p, font, pass, 368, 685, 10, 170);
    drawText(p, font, issued, 50, 656, 10, 490);
    drawText(p, font, phone, 136, 627, 10.5, 360);
  }
  if (pages[1]) {
    const p = pages[1];
    drawText(p, font, email, 48, 136, 10, 250);
    drawText(p, font, fio, 172, 94, 10, 150);
    drawDate(p, font, dated, 397, 92.9, 10);
  }
  if (pages[2]) {
    const p = pages[2];
    drawText(p, font, fio, 100, 774, 10.5, 430);
    drawWrap(p, font, address, 246, 750, 9.5, 300, 88, 737);
    drawText(p, font, pass, 368, 724, 9.5, 160);
    drawText(p, font, issued, 88, 697, 9.5, 450);
    drawText(p, font, phone, 160, 660, 10, 340);
    drawText(p, font, email, 312, 569, 9.5, 220);
    drawText(p, font, fio, 198, 42, 9.5, 200);
    drawDate(p, font, dated, 425, 40.4, 9);
  }
  if (pages[3]) {
    const p = pages[3];
    drawText(p, font, fio, 100, 796, 10.5, 450);
    drawText(p, font, fio, 230, 87, 9.5, 220);
    drawDate(p, font, dated, 444, 85.8, 9);
  }
  if (pages[4]) {
    const p = pages[4];
    drawText(p, font, fio, 62, 791, 11, 470);
    drawWrap(p, font, address, 232, 765, 10, 300, 50, 751);
    drawText(p, font, pass, 368, 738, 10, 170);
    drawText(p, font, issued, 50, 712, 10, 490);
    drawText(p, font, phone, 134, 673, 10.5, 360);
    drawText(p, font, email, 308, 581, 10, 230);
  }
  if (pages[5]) {
    const p = pages[5];
    drawText(p, font, fio, 175, 68, 10, 200);
    drawDate(p, font, dated, 428, 66, 10);
  }

  return new Uint8Array(await doc.save());
}
