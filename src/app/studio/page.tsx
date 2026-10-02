import { PageHeader } from "@/components/ui";
import { StudioClient } from "./StudioClient";

export const metadata = { title: "Gerador · Hook & Lock-In Engine" };

export default async function StudioPage({ searchParams }: PageProps<"/studio">) {
  const { icp } = await searchParams;
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Profiler & Gerador"
        subtitle="Escolha o ICP e o que o vídeo promete. A IA aplica a metodologia e entrega introduções completas, prontas para revisão."
      />
      <StudioClient initialIcpId={typeof icp === "string" ? icp : undefined} />
    </div>
  );
}
