import { randomUUID } from "node:crypto";
import { blobStore } from "../blob-store";

/**
 * Файлы заявок: портфолио, согласия, сканы паспорта.
 *
 * Хранятся в общем хранилище платформы (blob-store: локальный каталог или S3)
 * под ключом `applications/<uuid>_<kind><ext>`. Тип определяется по содержимому,
 * а не по расширению: под видом PDF нельзя загрузить произвольный файл.
 * Публичных ссылок нет — файл отдаётся только через админку.
 */

const MAX_BYTES = 20 * 1024 * 1024;

export class FormFileError extends Error {}

const SIGNATURES: { ext: string; test: (b: Uint8Array) => boolean }[] = [
  { ext: ".pdf", test: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46, 0x2d]) }, // %PDF-
  { ext: ".jpg", test: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  { ext: ".png", test: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  { ext: ".docx", test: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]) }, // ZIP
  { ext: ".doc", test: (b) => startsWith(b, [0xd0, 0xcf, 0x11, 0xe0]) },
];

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, index) => bytes[index] === byte);
}

/** Определяет формат файла по содержимому; null — если формат не распознан. */
export function detectKind(bytes: Uint8Array, allowedExt: string[]): string | null {
  for (const signature of SIGNATURES) {
    if (allowedExt.includes(signature.ext) && signature.test(bytes)) return signature.ext;
  }
  return null;
}

export interface SaveFileResult {
  /** Ключ в хранилище */
  key: string;
  size: number;
  ext: string;
}

/**
 * Сохраняет загруженный файл. Разрешает только перечисленные расширения,
 * проверяет размер и сигнатуру формата.
 */
export async function saveFormFile(
  kind: string,
  file: File,
  allowedExt: string[],
): Promise<SaveFileResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength === 0) throw new FormFileError("Пустой файл");
  if (bytes.byteLength > MAX_BYTES) throw new FormFileError("Файл больше 20 МБ");
  const ext = detectKind(bytes, allowedExt);
  if (!ext) throw new FormFileError("Недопустимый формат файла");
  const key = `applications/${randomUUID()}_${kind}${ext}`;
  await blobStore().put(key, bytes, contentTypeForExt(ext));
  return { key, size: bytes.byteLength, ext };
}

export async function readFormFile(key: string): Promise<Uint8Array | null> {
  if (!key.startsWith("applications/")) return null;
  const stored = await blobStore().get(key);
  return stored ? stored.bytes : null;
}

export function contentTypeForExt(ext: string): string {
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".doc":
      return "application/msword";
    default:
      return "application/octet-stream";
  }
}
