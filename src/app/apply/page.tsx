import type { Metadata } from "next";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { applyConfig } from "@/lib/forms/apply-config";

export const metadata: Metadata = {
  title: "Заявка на участие в семинаре «Образование на высоте»",
  description:
    "Заявка на участие в международном образовательном семинаре «Образование на высоте» Центра знаний «Машук».",
};

export const dynamic = "force-dynamic";

export default function ApplyPage() {
  return <ApplicationForm config={applyConfig} />;
}
