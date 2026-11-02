import type { Metadata } from "next";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { FormGate } from "@/components/forms/FormGate";
import { gateOpen } from "@/lib/forms/gate";
import { muniConfig } from "@/lib/forms/muni-config";

export const metadata: Metadata = {
  title: "Заявка участника",
  description:
    "Заявка участника образовательного мероприятия «Межнациональные и межконфессиональные отношения в деятельности муниципалитетов».",
};

export const dynamic = "force-dynamic";

export default async function MuniPage() {
  // Форма закрыта паролем (MUNI_FORM_PASSWORD), пока он не введён
  if (!(await gateOpen("muni"))) return <FormGate form="muni" title={muniConfig.title} />;
  return <ApplicationForm config={muniConfig} />;
}
