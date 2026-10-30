import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listSupportRequests } from "@/lib/support";
import { toggleSupportResolvedAction } from "@/lib/support-actions";

export const metadata = { title: "Поддержка" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SupportAdminPage({ searchParams }: PageProps) {
  const user = (await getSessionUser())!;
  if (!user.isCenterAdmin) redirect("/admin/programs");

  const sp = await searchParams;
  const resolved = sp.view === "resolved";
  const rows = await listSupportRequests(resolved);

  const tab = (active: boolean) =>
    `rounded-full px-4 py-2 font-semibold no-underline ${active ? "bg-navy text-white" : "bg-white text-navy hover:bg-sky-tint"}`;

  return (
    <div className="wrap flex flex-col gap-6">
      <h1 className="m-0 font-display text-[clamp(28px,3.4vw,40px)] leading-tight font-semibold tracking-[-0.045em] text-navy">
        Техническая поддержка
      </h1>

      <nav className="flex flex-wrap gap-2 text-meta">
        <Link href="/admin/support" className={tab(!resolved)}>
          Новые
        </Link>
        <Link href="/admin/support?view=resolved" className={tab(resolved)}>
          Разобранные
        </Link>
      </nav>

      {rows.length === 0 ? (
        <p className="m-0 rounded-soft border border-[var(--line)] bg-white px-6 py-5 text-ui text-ink-soft">
          {resolved ? "Разобранных обращений пока нет." : "Новых обращений нет."}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-col gap-3 rounded-panel border border-[var(--line)] bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="font-semibold text-ink">
                  {row.name} ·{" "}
                  <a href={`mailto:${row.email}?subject=${encodeURIComponent("Техническая поддержка «Машук»")}`} className="text-navy">
                    {row.email}
                  </a>
                </span>
                <span className="text-caption text-ink-faint">
                  {row.createdAt.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}
                  {row.page ? ` · ${row.page}` : ""}
                </span>
              </div>
              <p className="m-0 text-ui whitespace-pre-wrap text-ink">{row.message}</p>
              <form action={toggleSupportResolvedAction}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="resolved" value={resolved ? "0" : "1"} />
                <button
                  type="submit"
                  className="inline-flex min-h-9 cursor-pointer items-center rounded-full border-0 bg-sky-tint px-4 text-meta font-semibold text-navy hover:bg-sky-pale"
                >
                  {resolved ? "Вернуть в новые" : "Отметить разобранным"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
