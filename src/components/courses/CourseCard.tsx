import Image from "next/image";
import {
  Compass,
  Cpu,
  Film,
  Flag,
  Flower2,
  GraduationCap,
  Route,
  ShieldCheck,
  Snowflake,
  Sun,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SEASONS } from "@/lib/brand";
import type { Course } from "@/lib/courses";

const ICONS: Record<string, LucideIcon> = {
  film: Film,
  shield: ShieldCheck,
  route: Route,
  cpu: Cpu,
  compass: Compass,
  flag: Flag,
  wrench: Wrench,
  users: Users,
  sun: Sun,
  flower: Flower2,
  snow: Snowflake,
  cap: GraduationCap,
};

export function CourseCard({ course }: { course: Course }) {
  const season = SEASONS[course.season];
  const Icon = ICONS[course.icon] ?? GraduationCap;

  return (
    <article className="card card--hover overflow-hidden">
      <div className="relative h-44 overflow-hidden">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${season.accent}, ${season.strong})` }}
          >
            <Icon size={58} strokeWidth={1.3} className="text-white/90" aria-hidden="true" />
          </div>
        )}
        <span className="absolute top-4 left-4 rounded-full bg-white/85 px-3 py-1 text-micro font-semibold tracking-wide text-navy uppercase">
          {course.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="m-0 mb-3 font-display text-title-sm leading-snug font-semibold tracking-[-0.02em] text-navy">
          {course.title}
        </h3>
        <p className="m-0 mb-5 text-meta font-light leading-relaxed text-ink-soft">
          {course.description}
        </p>
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-2 font-semibold text-navy no-underline hover:underline"
        >
          Регистрация
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}
