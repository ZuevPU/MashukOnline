import type { Metadata } from "next";
import { EducationHeight } from "@/components/results/EducationHeight";

export const metadata: Metadata = {
  title: "Образование на высоте — база знаний",
  description:
    "База знаний международного образовательного семинара «Образование на высоте»: программа, ключевые идеи и материалы по дням.",
  robots: { index: false, follow: false },
};

export default function EducationHeightResultsPage() {
  return <EducationHeight />;
}
