import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Lock, MapPin } from "lucide-react";
import { MountainLine } from "@/components/brand/MountainLine";
import { ProgramGateForm } from "@/components/programs/ProgramGateForm";
import { seasonStyle } from "@/lib/brand";
import { getProgram } from "@/lib/data";
import { formatDateRange } from "@/lib/dates";
import { buildBySlug } from "@/lib/db/queries";
import { canViewBuild } from "@/lib/program-gate";
import { buildUrl } from "@/lib/short-links";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  return { title: program ? program.title : "Вход", robots: { index: false, follow: false } };
}

/** Вход в авторскую сборку программы по паролю программы — без регистрации. */
export default async function UnlockBuildPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { next } = await searchParams;
  const [program, build] = await Promise.all([getProgram(slug), buildBySlug(slug)]);
  if (!program || !build?.version) notFound();
  if (await canViewBuild(slug)) redirect(buildUrl(slug));

  return (
    <div data-season={program.season} style={seasonStyle(program.season) as CSSProperties}>
      <section className="mesh mesh--accent relative pt-18 pb-16">
        <div className="wrap relative">
          <p className="eyebrow eyebrow--light">{program.subtitle}</p>
          <h1 className="m-0 mb-6 max-w-220 font-display text-[clamp(36px,5.4vw,72px)] leading-[0.96] font-semibold tracking-[-0.06em] text-white">
            {program.title}
          </h1>
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-ui text-white/85">
            <li className="flex items-center gap-2">
              <CalendarDays size={15} />
              {formatDateRange(program.startDate, program.endDate)}
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={15} />
              {program.location}
            </li>
          </ul>
        </div>
        <MountainLine className="text-white" />
      </section>

      <section className="section">
        <div className="wrap max-w-[560px]">
          <div className="card p-7 md:p-8">
            <span className="mb-5 grid size-11 place-items-center rounded-full bg-sky-tint text-navy">
              <Lock size={18} />
            </span>
            <h2 className="m-0 mb-1.5 font-display text-title-lg font-semibold tracking-[-0.03em] text-navy">
              Вход для участников
            </h2>
            <p className="m-0 mb-6 text-meta leading-relaxed text-ink-soft">
              Материалы программы открываются по паролю участника — его выдают организаторы.
            </p>
            <ProgramGateForm slug={slug} next={next ?? ""} />
          </div>
        </div>
      </section>
    </div>
  );
}
