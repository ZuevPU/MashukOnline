import type { Metadata } from "next";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { muniConfig } from "@/lib/forms/muni-config";

export const metadata: Metadata = {
  title: "Заявка участника",
  description:
    "Заявка участника образовательного мероприятия «Межнациональные и межконфессиональные отношения в деятельности муниципалитетов».",
};

export const dynamic = "force-dynamic";

export default function MuniPage() {
  return <ApplicationForm config={muniConfig} />;
}
