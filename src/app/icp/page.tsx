import { PageHeader } from "@/components/ui";
import { IcpClient } from "./IcpClient";

export const metadata = { title: "ICP · Hook & Lock-In Engine" };

export default async function IcpPage({ searchParams }: PageProps<"/icp">) {
  const { id } = await searchParams;
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Definição de ICP"
        subtitle="Crie um ICP conversando com a IA ou escolha um ICP salvo para editar. A ficha vai se preenchendo durante a conversa e, depois de salva, aparece no seletor do Gerador."
      />
      <IcpClient initialId={typeof id === "string" ? id : undefined} />
    </div>
  );
}
