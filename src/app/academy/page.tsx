import { ButtonLink, PageHeader } from "@/components/ui";
import {
  CULT_HOPPING_RULES,
  FUNNEL_STAGES,
  HOOK_ERRORS,
  HOOK_STEPS,
  HOOK_TACTICS,
  HOOK_XYZ_PATTERN,
  LEAN_LEVERS,
  LOCKIN_FORMULAS,
} from "@/lib/methodology";

export const metadata = { title: "Academy · Hook & Lock-In Engine" };

export default function AcademyPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Hook & Lock-In Academy"
        subtitle="Os fundamentos que todo copywriter da equipe precisa dominar antes de gerar roteiros."
      >
        <ButtonLink href="/auditor" variant="secondary">
          Praticar no Auditor
        </ButtonLink>
      </PageHeader>

      <nav className="mb-10 flex flex-wrap gap-2 text-sm">
        {[
          ["#hook", "1. O Hook (0–3s)"],
          ["#erros", "2. Os 4 erros fatais"],
          ["#tres-passos", "3. A fórmula em 3 passos"],
          ["#lockin", "4. A Lock-In Zone (3–8s)"],
          ["#formulas", "5. As 6 fórmulas"],
          ["#funil", "6. Funil"],
          ["#checklist", "7. Checklist"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="rounded-full border border-stone-200 bg-white px-3 py-1 hover:border-brand-500">
            {label}
          </a>
        ))}
      </nav>

      <section id="hook" className="mb-12 scroll-mt-6">
        <h2 className="mb-3 text-xl font-bold">1. O sistema de Hooks (0 a 3 segundos)</h2>
        <div className="space-y-3 text-stone-700">
          <p>
            O hook é a primeira frase falada (ou duas frases bem curtas) e os 2–3 primeiros segundos de tela: hook falado, hook de texto e hook visual.
            Seu único trabalho é <strong>parar a rolagem</strong> e fazer o espectador decidir continuar assistindo.
          </p>
          <p>Para isso, o hook precisa entregar apenas duas coisas:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="font-semibold">Clareza de tema</p>
              <p className="text-sm">O espectador entende exatamente do que o vídeo vai tratar.</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="font-semibold">Curiosidade no alvo</p>
              <p className="text-sm">Ele sente que o vídeo é para ele, que vai ganhar algo, e quer saber o que vem.</p>
            </div>
          </div>
          <p>
            A retenção em vídeo curto cai de forma exponencial: a queda mais íngreme acontece nos dois primeiros segundos.
            Quem não entende o tema rápido não tem como decidir ficar, e sai.
          </p>
        </div>
      </section>

      <section id="erros" className="mb-12 scroll-mt-6">
        <h2 className="mb-3 text-xl font-bold">2. Os 4 erros fatais do hook</h2>
        <p className="mb-4 text-stone-700">
          Se um hook não funciona, ele está cometendo um (ou mais) destes erros. São exatamente os 4 checks do Auditor.
        </p>
        <div className="space-y-4">
          {HOOK_ERRORS.map((e, i) => (
            <article key={e.id} className="rounded-xl border border-stone-200 bg-white p-5">
              <h3 className="text-lg font-semibold">
                {i + 1}. {e.name} <span className="text-sm font-normal text-stone-400">({e.en})</span>
              </h3>
              <p className="mt-2 text-sm">
                <span className="font-medium text-red-700">O erro:</span> {e.error}
              </p>
              <p className="text-sm">
                <span className="font-medium text-green-700">A solução:</span> {e.fix}
              </p>
              <p className="mt-2 text-sm text-stone-600">{e.why}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-900">✕ “{e.bad}”</p>
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-900">✓ “{e.good}”</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
          <strong>Teste de clareza:</strong> leia só o hook, isolado. É possível entender de mais de um jeito? Se sim,
          reescreva até sobrar uma única interpretação.
        </div>
      </section>

      <section id="tres-passos" className="mb-12 scroll-mt-6">
        <h2 className="mb-3 text-xl font-bold">3. A fórmula do hook em 3 passos</h2>
        <p className="mb-4 text-stone-700">
          Pense no espectador dirigindo a 110 km/h: ele precisa ver algo, frear e fazer o retorno. A fórmula cria uma
          alça de curiosidade em 3 ou 4 frases curtas, em efeito dominó: cada frase obriga a ouvir a próxima. Funciona em
          qualquer nicho, inclusive B2B.
        </p>
        <ol className="space-y-3">
          {HOOK_STEPS.map((s) => (
            <li key={s.id} className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-baseline gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {s.number}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="text-xs text-stone-400">
                    {s.en} · {s.where}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-stone-700">{s.how}</p>
              <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm italic text-green-900">“{s.example}”</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-xl bg-stone-900 p-4 text-sm text-stone-100">
          <span className="font-semibold text-brand-500">Juntos: </span>“{HOOK_STEPS.map((s) => s.example).join(" ")}”
        </p>
        <div className="mt-4 rounded-xl border border-stone-200 bg-white p-5 text-sm">
          <p className="font-semibold">Variante compacta: {HOOK_XYZ_PATTERN.name}</p>
          <p className="mt-1 text-stone-700">{HOOK_XYZ_PATTERN.how}</p>
          <p className="mt-2 italic text-stone-600">“{HOOK_XYZ_PATTERN.example}”</p>
        </div>

        <h3 className="mt-8 mb-3 text-lg font-semibold">Alavancas de inclinação (passo 1)</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {LEAN_LEVERS.map((l) => (
            <article key={l.id} className="rounded-xl border border-stone-200 bg-white p-4 text-sm">
              <p className="font-semibold">{l.name}</p>
              <p className="mt-1 text-stone-700">{l.how}</p>
              <p className="mt-2 italic text-stone-600">“{l.example}”</p>
            </article>
          ))}
        </div>
        <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Atenção com referências culturais:</strong> {CULT_HOPPING_RULES}
        </p>

        <h3 className="mt-8 mb-3 text-lg font-semibold">Táticas para qualquer hook</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {HOOK_TACTICS.map((t) => (
            <article key={t.id} className="rounded-xl border border-stone-200 bg-white p-4 text-sm">
              <p className="font-semibold">{t.name}</p>
              <p className="mt-1 text-stone-700">{t.how}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="lockin" className="mb-12 scroll-mt-6">
        <h2 className="mb-3 text-xl font-bold">4. A Lock-In Zone (3 a 8 segundos, logo após o hook)</h2>
        <div className="space-y-3 text-stone-700">
          <p>
            São as 1 a 3 frases logo depois do hook. O hook conquista a atenção; a Lock-In Zone é o que a{" "}
            <strong>trava</strong>. Funciona como uma catraca psicológica: o hook leva a curiosidade de 0 a 1, a Lock-In
            Zone leva de 1 a 10, sem que o espectador perceba.
          </p>
          <p>
            Nem todo vídeo tem Lock-In Zone (alguns vão direto do hook ao corpo), mas os dados de milhares de vídeos de
            alto desempenho mostram que usar uma das 6 fórmulas aumenta muito a retenção.
          </p>
        </div>
      </section>

      <section id="formulas" className="mb-12 scroll-mt-6">
        <h2 className="mb-4 text-xl font-bold">5. As 6 fórmulas táticas de Lock-In</h2>
        <div className="grid gap-4">
          {LOCKIN_FORMULAS.map((f) => (
            <article key={f.id} className="rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-baseline gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
                  {f.number}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{f.name}</h3>
                  <p className="text-xs text-stone-400">{f.en}</p>
                </div>
              </div>
              <p className="mt-3 text-sm">
                <span className="font-medium">Função psicológica:</span> {f.psych}
              </p>
              <p className="text-sm">
                <span className="font-medium">Quando usar:</span> {f.whenToUse}
              </p>
              <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm italic text-green-900">“{f.example}”</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm text-stone-600">
          A <strong>Magic Box</strong> é a fórmula mais fácil de combinar com as outras. Ex.: Magic Box + Transformação:
          “Chamamos isso de Método de Equiparação Fiscal Odonto, e ele transforma faturamento em lucro na sua conta.”
        </p>
      </section>

      <section id="funil" className="mb-12 scroll-mt-6">
        <h2 className="mb-4 text-xl font-bold">6. Estágio do funil</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {FUNNEL_STAGES.map((s) => (
            <div key={s.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="font-semibold">{s.label}</p>
              <p className="text-sm text-stone-600">{s.focus}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="checklist" className="mb-12 scroll-mt-6">
        <h2 className="mb-4 text-xl font-bold">7. Checklist antes de gravar</h2>
        <ul className="space-y-2 rounded-xl border border-stone-200 bg-white p-5 text-sm">
          {[
            "O tema aparece nos primeiros 1–2 segundos, sem saudação nem apresentação.",
            "Uma pessoa de 12 anos entenderia o hook na primeira leitura.",
            "O hook fala com “você/sua clínica” e toca numa dor que o público já sente.",
            "Existe contraste: a crença comum (A) contra a sua alternativa (B), de preferência com interjeição e virada (3 passos).",
            "As frases logo após o hook aplicam ao menos uma das 6 fórmulas de Lock-In.",
            "Até uns 8 segundos o espectador já recebeu algo útil, não só suspense.",
            "O texto na tela tem de 3 a 5 palavras e a imagem tem movimento.",
            "A virada prometida é cumprida no resto do vídeo.",
            "Todo número citado é real e defensável.",
            "O score do Auditor está em 80 ou mais.",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-green-600">☐</span> {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-3">
          <ButtonLink href="/studio">Gerar introduções</ButtonLink>
          <ButtonLink href="/auditor" variant="secondary">
            Auditar um hook
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
