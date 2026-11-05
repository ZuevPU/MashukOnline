/**
 * Короткие адреса авторских сборок программ: mashuk.online/<адрес>/ открывает
 * сборку программы (next.config.ts → rewrites). Ключ — slug программы.
 * Файл без зависимостей: его подключает и next.config.ts.
 */
export const BUILD_SHORT_LINKS: Record<string, string> = {
  rnd26: "/rnd26",
  muni26: "/muni26",
  interethnic_3: "/interethnic_3",
};

/** Публичный адрес файла сборки: короткий, если он задан. */
export function buildUrl(slug: string, file = "index.html"): string {
  const short = BUILD_SHORT_LINKS[slug];
  if (short) return file === "index.html" ? short : `${short}/${file}`;
  return `/programs/${slug}/build/${file}`;
}
