import { PageHeader } from "@/components/ui";
import { StudioClient } from "./StudioClient";

export const metadata = { title: "Gerador · Hook & Lock-In Engine" };

export default function StudioPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Profiler & Gerador"
        subtitle="Defina quem vai assistir e o que o vídeo promete. A IA aplica a metodologia e entrega introduções completas, prontas para revisão."
      />
      <StudioClient />
    </div>
  );
}
