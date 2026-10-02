import { PageHeader } from "@/components/ui";
import { IcpClient } from "./IcpClient";

export const metadata = { title: "ICP · Hook & Lock-In Engine" };

export default function IcpPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Definição de ICP"
        subtitle="Converse com a IA para definir o cliente ideal de cada nicho. A ficha vai se preenchendo durante a conversa e, depois de salva, aparece no seletor do Gerador."
      />
      <IcpClient />
    </div>
  );
}
