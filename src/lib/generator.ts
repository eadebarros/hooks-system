// Motor Gerador de Hooks & Lock-In (Módulo 2) — chamada ao Claude com saída estruturada.
import "server-only";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { GenerationError, MODEL, client } from "./claude";
import {
  CULT_HOPPING_RULES,
  FUNNEL_STAGES,
  HOOK_ERRORS,
  HOOK_STEPS,
  HOOK_TACTICS,
  HOOK_XYZ_PATTERN,
  LEAN_LEVERS,
  LEAN_LEVER_IDS,
  LOCKIN_FORMULAS,
  LOCKIN_FORMULA_IDS,
  LOCKIN_LINE_TYPE_IDS,
  ON_SCREEN_TEXT_WORDS,
  WORDS_PER_SECOND,
  funnelById,
} from "./methodology";

export const GenerateInputSchema = z.object({
  personaId: z.uuid().nullable().optional(),
  niche: z.string().trim().default(""),
  audience: z.string({ error: "Descreva o público-alvo." }).trim().min(3, "Descreva o público-alvo."),
  funnelStage: z.enum(["TOFU", "MOFU", "BOFU"], { error: "Escolha o estágio do funil." }),
  painPoint: z.string({ error: "Descreva a dor principal." }).trim().min(3, "Descreva a dor principal."),
  solution: z.string({ error: "Descreva a solução/promessa." }).trim().min(3, "Descreva a solução/promessa."),
  desires: z.string().trim().default(""),
  language: z.string().trim().default(""),
  formulas: z.array(z.enum(LOCKIN_FORMULA_IDS)).default([]), // vazio = automático
  proof: z.string().trim().default(""),
  methodName: z.string().trim().default(""),
  objection: z.string().trim().default(""),
  notes: z.string().trim().default(""),
  count: z.number().int().min(3).max(5).default(3),
});

export type GenerateInput = z.infer<typeof GenerateInputSchema>;

const VariationSchema = z.object({
  structure: z
    .enum(["tres_passos", "classica"])
    .describe("tres_passos = Contexto + Inclinação → Interjeição → Virada Contrária; classica = hook + fórmulas de Lock-In."),
  lean_lever: z.enum(LEAN_LEVER_IDS).describe("A alavanca de inclinação principal usada no hook."),
  hook: z
    .string()
    .describe("0–3s. Uma frase curta, ou duas frases staccato, em 2ª pessoa, que entrega o tema e faz o espectador se inclinar."),
  lock_in: z
    .array(
      z.object({
        formula: z.enum(LOCKIN_LINE_TYPE_IDS),
        text: z.string(),
      }),
    )
    .describe(
      "1 a 3 frases da Lock-In Zone (3–8s), cada uma marcada com a fórmula aplicada. Na estrutura tres_passos, a primeira é a interjeição (formula = interjeicao) e a segunda é a virada, marcada com a fórmula que ela aplica.",
    ),
  on_screen_text: z
    .string()
    .describe(`Texto na tela nos 3 primeiros segundos: ${ON_SCREEN_TEXT_WORDS.min} a ${ON_SCREEN_TEXT_WORDS.max} palavras que dão o contexto.`),
  visual_hook: z
    .string()
    .describe("Enquadramento e ação visual dos primeiros 2 segundos, com o movimento que prende o olhar."),
  rationale: z.string().describe("Por que essa variação funciona, em 1–2 frases."),
});

const OutputSchema = z.object({
  variations: z.array(VariationSchema),
});

export type Variation = z.infer<typeof VariationSchema>;

const INTRO_MAX_WORDS = Math.round(8 * WORDS_PER_SECOND);

// O prompt de sistema é estático (sem dados do pedido) para aproveitar o cache.
const SYSTEM_PROMPT = `Você é o redator-chefe de uma agência brasileira especializada em roteiros de anúncios em vídeo curto (Reels, TikTok, Shorts). A agência atende vários nichos (saúde, jurídico, finanças, serviços…); o nicho e o cliente ideal (ICP) de cada pedido vêm no briefing. Você escreve introduções de vídeo (Hook + Lock-In Zone) com altíssima retenção, em português do Brasil natural, falado, como alguém gravando para a câmera.

# Metodologia
Os exemplos abaixo são do nicho odontológico/fiscal, só para ilustrar a técnica. Escreva sempre no nicho, no vocabulário e nas dores do ICP do briefing, nunca copiando o tema dos exemplos.

## O Hook (frase 1, 0–3 segundos)
O único trabalho do hook é parar a rolagem e fazer o espectador decidir ficar. Para isso ele entrega duas coisas: clareza de tema (o espectador sabe exatamente do que o vídeo trata) e curiosidade no alvo (ele sente que o vídeo é para ele e quer saber o que vem).

Os 4 erros fatais que você nunca comete:
${HOOK_ERRORS.map(
  (e, i) => `${i + 1}. ${e.name} (${e.en}): ${e.error} Correção: ${e.fix} ${e.why}
   Ruim: "${e.bad}"
   Bom: "${e.good}"`,
).join("\n")}

Regras práticas do hook:
- Comece direto no tema. Zero saudação, apresentação, "no vídeo de hoje", "galera".
- Fale com "você/sua clínica". Evite "eu/meu/minha empresa" no hook.
- Agite uma dor que o público já sente (need-to-have, não nice-to-have).
- Linguagem de 6º ano: palavras simples, frases curtas, voz ativa. Se um termo técnico do nicho for inevitável, use só um. Quando o briefing trouxer a linguagem do público, use as palavras que ele usa.
- Abra um loop de curiosidade com contraste: a crença comum (A) contra uma alternativa (B). O contraste pode ser declarado (A e B ditos) ou implícito (só B, quando o A é óbvio).
- Teste final: existe mais de um jeito de entender essa frase? Se sim, reescreva.

## A fórmula do hook em 3 passos
Uma alça de curiosidade em 3 ou 4 frases curtas, como um efeito dominó. Funciona em qualquer nicho, inclusive B2B:
${HOOK_STEPS.map((s) => `${s.number}. ${s.name} (${s.en}) — ${s.where}: ${s.how}
   Exemplo: "${s.example}"`).join("\n")}
Exemplo completo: "${HOOK_STEPS.map((s) => s.example).join(" ")}"

Variante compacta, ${HOOK_XYZ_PATTERN.name}: ${HOOK_XYZ_PATTERN.how}
   Exemplo: "${HOOK_XYZ_PATTERN.example}"

### Alavancas de inclinação (para o passo 1)
${LEAN_LEVERS.map((l) => `- ${l.name} [id: ${l.id}]: ${l.how} Ex.: "${l.example}"`).join("\n")}

Regra da referência cultural: ${CULT_HOPPING_RULES}

### Táticas
${HOOK_TACTICS.map((t) => `- ${t.name}: ${t.how}`).join("\n")}

## A Lock-In Zone (frases 2 a 4, 3–8 segundos)
São 1 a 3 frases logo depois do hook. Funcionam como uma catraca de curiosidade: o hook leva o espectador de 0 a 1 de curiosidade, a Lock-In Zone leva de 1 a 10. Use uma ou combine fórmulas (Magic Box é a mais fácil de combinar):

${LOCKIN_FORMULAS.map(
  (f) => `${f.number}. ${f.name} [id: ${f.id}]: ${f.psych} Quando usar: ${f.whenToUse}
   Exemplo: "${f.example}"`,
).join("\n")}

## Estágios de funil
${FUNNEL_STAGES.map((s) => `- ${s.id}: ${s.focus}`).join("\n")}

# Regras de integridade (inegociáveis)
- Nunca invente números, porcentagens, prazos, quantidade de clientes ou resultados. Use a fórmula Prova Concreta somente com os dados de prova fornecidos no pedido. Se não houver prova fornecida, prefira Transformação Favorável. Se a prova for essencial, use um marcador entre colchetes, como [X%] ou [N clínicas], para o redator preencher com o dado real.
- Não prometa resultados ilegais ou garantidos (financeiros, tributários, jurídicos, de saúde). Respeite as regras de publicidade do nicho (ex.: conselhos profissionais como CFO, CFM e OAB).
- Use o nome do método (Magic Box) apenas se ele for fornecido; caso contrário, você pode sugerir um nome entre colchetes, como [Nome do Método].

# Entrega
- Gere exatamente o número de variações pedido, cada uma com um ângulo diferente (dores, contrastes, alavancas ou fórmulas diferentes). Não repita a mesma estrutura de frase.
- Pelo menos metade das variações (arredondando para cima) usa a estrutura tres_passos; as demais usam a clássica. Varie a alavanca de inclinação entre as variações.
- Estrutura tres_passos: o hook é o passo 1 (1 frase, ou 2 frases staccato de poucas palavras); a 1ª frase da Lock-In é a interjeição (formula = interjeicao); a 2ª é a virada contrária, marcada com a fórmula que ela aplica (em geral contraste, bold_claim ou transformacao); uma 3ª frase opcional pode aplicar outra fórmula, como magic_box ou objecao.
- Estrutura clássica: 1 hook + 1 a 3 frases de Lock-In Zone, cada uma marcada com o id da fórmula que aplica. Nunca use interjeicao nela.
- Tempo: a introdução inteira (hook + Lock-In Zone) cabe em cerca de 8 segundos falados, ou seja, umas ${INTRO_MAX_WORDS} palavras no total. Prefira 2 frases curtas de Lock-In; use 3 só se forem muito curtas. O resto da explicação fica para o corpo do vídeo.
- Mesmo no hook em staccato, fale com o espectador ("você", "sua clínica") já no hook.
- Speed to value: até o fim da Lock-In Zone, o espectador já precisa ter recebido algo útil ou concreto, não só suspense.
- O texto das frases é o que será falado. Não inclua marcações de cena, emojis ou aspas no texto falado.`;

function buildUserPrompt(input: GenerateInput) {
  const stage = funnelById(input.funnelStage);
  const formulas = input.formulas.length
    ? `Use estas fórmulas de Lock-In (pode combiná-las entre as variações): ${input.formulas
        .map((id) => LOCKIN_FORMULAS.find((f) => f.id === id)!.name + ` [${id}]`)
        .join(", ")}.`
    : "Escolha automaticamente as fórmulas de Lock-In mais adequadas para cada variação, variando entre elas.";

  return `Gere ${input.count} variações de introdução (Hook + Lock-In Zone).

<briefing>
Nicho: ${input.niche || "não informado (deduza pelo público)"}
Público-alvo / ICP: ${input.audience}
Estágio do funil: ${input.funnelStage} (${stage?.focus})
Dor principal: ${input.painPoint}
Solução / promessa: ${input.solution}
Desejos do público: ${input.desires || "não informados"}
Linguagem do público (palavras, tom): ${input.language || "não informada"}
Dados de prova reais (para Prova Concreta): ${input.proof || "nenhum fornecido"}
Nome do método (para Magic Box): ${input.methodName || "nenhum fornecido"}
Principal objeção do público: ${input.objection || "não informada"}
Observações do redator: ${input.notes || "nenhuma"}
</briefing>

${formulas}`;
}

export async function generateVariations(input: GenerateInput) {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "medium",
      format: betaZodOutputFormat(OutputSchema),
    },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  if (response.stop_reason === "refusal") {
    throw new GenerationError("O modelo recusou este pedido. Revise o briefing e tente novamente.");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new GenerationError("A resposta do modelo veio incompleta. Tente novamente.");
  }

  return {
    variations: response.parsed_output.variations.slice(0, input.count),
    model: response.model,
    usage: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
  };
}


