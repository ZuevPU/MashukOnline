import type { Metadata } from "next";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { mediaConfig } from "@/lib/forms/media-config";

export const metadata: Metadata = {
  title: "Регистрация — Медиакомпетенции",
  description:
    "Регистрация на образовательное мероприятие «Медиакомпетенции в сфере межнациональных отношений: этика, инструменты, практики».",
};

export const dynamic = "force-dynamic";

export default function MediaApplyPage() {
  return <ApplicationForm config={mediaConfig} />;
}
