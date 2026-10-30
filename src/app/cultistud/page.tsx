import type { Metadata } from "next";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { cultistudConfig } from "@/lib/forms/cultistud-config";

export const metadata: Metadata = {
  title: "Заявка участника",
  description:
    "Заявка участника образовательного семинара «Студенческие сообщества как пространство поликультурного взаимодействия».",
};

export const dynamic = "force-dynamic";

export default function CultistudPage() {
  return <ApplicationForm config={cultistudConfig} />;
}
