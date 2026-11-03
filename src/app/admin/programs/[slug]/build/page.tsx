import { BuildPanel } from "@/components/admin/BuildPanel";
import { Panel } from "@/components/admin/ui";
import { buildBySlug } from "@/lib/db/queries";

export const metadata = { title: "Сборка" };

export default async function AdminBuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const build = await buildBySlug(slug);
  if (!build) return null;

  return (
    <Panel
      title="Авторская сборка"
      description="Своя HTML-страница программы. Открывается участникам в хабе, а гостям — после пароля программы (раздел «Доступ и участники»)."
    >
      <BuildPanel slug={slug} uploadedAt={build.version ? new Date(build.version).toISOString() : null} />
    </Panel>
  );
}
