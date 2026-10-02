import Link from "next/link";
import { PageHeader } from "@/components/ui";

const MODULES = [
  {
    href: "/academy",
    tag: "Central educacional",
    title: "Hook & Lock-In Academy",
    text: "Os 4 erros fatais do hook e as 6 fórmulas da Lock-In Zone, com exemplos do mercado odonto-fiscal.",
  },
  {
    href: "/icp",
    tag: "Etapa 0",
    title: "Definição de ICP",
    text: "Defina numa conversa com a IA o cliente ideal de cada nicho (dentistas, jurídico…). As fichas ficam salvas para o Gerador.",
  },
  {
    href: "/studio",
    tag: "Módulos 1 + 2",
    title: "Profiler & Gerador",
    text: "Escolha o ICP, o funil e a promessa. A IA entrega de 3 a 5 introduções completas, já auditadas.",
  },
  {
    href: "/auditor",
    tag: "Módulo 3",
    title: "Auditor em tempo real",
    text: "Cole ou escreva um hook e receba o score de 0 a 100, com alertas de atraso, densidade de “você” e Lock-In.",
  },
  {
    href: "/library",
    tag: "Módulo 4",
    title: "Biblioteca, Teleprompter & Exportação",
    text: "Roteiros aprovados prontos para gravar em tela cheia ou exportar em TXT e PDF.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Hook & Lock-In Generator Engine"
        subtitle="Introduções de vídeo que param a rolagem em 0–3s e prendem a atenção até 8s. Do treinamento à gravação, num só lugar."
      />

      <div className="mb-10 grid gap-4 rounded-2xl bg-stone-900 p-6 text-stone-100 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">0–3s · Frase 1</p>
          <p className="mt-1 text-lg font-semibold">Hook</p>
          <p className="text-sm text-stone-400">Para a rolagem e dá clareza imediata do tema. Leva a curiosidade de 0 a 1.</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-400">3–8s · Frases 2 a 4</p>
          <p className="mt-1 text-lg font-semibold">Lock-In Zone</p>
          <p className="text-sm text-stone-400">A catraca da curiosidade. Leva de 1 a 10 antes da entrega do conteúdo.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{m.tag}</p>
            <p className="mt-1 text-lg font-semibold group-hover:text-brand-700">{m.title}</p>
            <p className="mt-1 text-sm text-stone-600">{m.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
