/**
 * Минимальные типы для archiver 8 (ESM): описываем только используемый
 * класс ZipArchive — у пакета нет типа-callable фабрики.
 */
declare module "archiver" {
  import type { Transform } from "node:stream";

  export class ZipArchive extends Transform {
    constructor(options?: { zlib?: { level?: number } });
    append(source: Buffer, data: { name: string }): this;
    finalize(): Promise<void>;
    on(event: "data", listener: (chunk: Buffer) => void): this;
    on(event: "warning" | "error", listener: (error: Error) => void): this;
    on(event: "end", listener: () => void): this;
  }
}
