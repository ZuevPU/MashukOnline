import type { Metadata } from "next";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { infoConfig } from "@/lib/forms/info-config";

export const metadata: Metadata = {
  title: "Сбор информационных данных участников семинара",
  description:
    "Сбор информационных данных участников международного образовательного семинара «Образование на высоте».",
};

export const dynamic = "force-dynamic";

export default function InfoPage() {
  return <ApplicationForm config={infoConfig} />;
}
