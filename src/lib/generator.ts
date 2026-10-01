// Motor Gerador de Hooks & Lock-In (Módulo 2) — chamada ao Claude com saída estruturada.
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import {
  FUNNEL_STAGES,
  HOOK_ERRORS,
  LOCKIN_FORMULAS,
  LOCKIN_FORMULA_IDS,
  funnelById,
} from "./methodology";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

export const GenerateInputSchema = z.object({
  audience: z.string({ error: "Descreva o público-alvo." }).trim().min(3, "Descreva o público-alvo."),
  funnelStage: z.enum(["TOFU", "MOFU", "BOFU"], { error: "Escolha o estágio do funil." }),
  painPoint: z.string({ error: "Descreva a dor principal." }).trim().min(3, "Descreva a dor principal."),
  solution: z.string({ error: "Descreva a solução/promessa." }).trim().min(3, "Descreva a solução/promessa."),
  formulas: z.array(z.enum(LOCKIN_FORMULA_IDS)).default([]), // vazio = automático
  proof: z.string().trim().default(""),
  methodName: z.string().trim().default(""),
  objection: z.string().trim().default(""),
  notes: z.string().trim().default(""),
  count: z.number().int().min(3).max(5).default(3),
});

export type GenerateInput = z.infer<typeof GenerateInputSchema>;

const VariationSchema = z.object({
  hook: z.string().describe("Frase 1 (0–3s). Uma frase curta, em 2ª pessoa, que entrega o tema."),
  lock_in: z
    .array(
      z.object({
        formula: z.enum(LOCKIN_FORMULA_IDS),
        text: z.string(),
      }),
    )
    .describe("1 a 3 frases da Lock-In Zone (3–8s), cada uma marcada com a fórmula aplicada."),
  on_screen_text: z.string().describe("Texto curto para aparecer na tela nos 3 primeiros segundos (até 8 palavras)."),
  visual_hook: z.string().describe("Sugestão de enquadramento/ação visual para os primeiros 2 segundos."),
  rationale: z.string().describe("Por que essa variação funciona, em 1–2 frases."),
});

const OutputSchema = z.object({
  variations: z.array(VariationSchema),
});

export type Variation = z.infer<typeof VariationSchema>;

// O prompt de sistema é estático (sem dados do pedido) para aproveitar o cache.
const SYSTEM_PROMPT = `Você é o redator-chefe de uma agência brasileira especializada em roteiros de anúncios em vídeo curto (Reels, TikTok, Shorts) para o mercado odontológico e de gestão fiscal de clínicas. Você escreve introduções de vídeo (Hook + Lock-In Zone) com altíssima retenção, em português do Brasil natural, falado, como alguém gravando para a câmera.

# Metodologia

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
- Linguagem de 6º ano: palavras simples, frases curtas, voz ativa. Se um termo técnico for inevitável (ex.: Simples Nacional), use só um.
- Abra um loop de curiosidade com contraste: a crença comum (A) contra uma alternativa (B). O contraste pode ser declarado (A e B ditos) ou implícito (só B, quando o A é óbvio).
- Teste final: existe mais de um jeito de entender essa frase? Se sim, reescreva.

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
- Não prometa resultados tributários ilegais ou garantidos. A comunicação é sobre planejamento fiscal legal.
- Use o nome do método (Magic Box) apenas se ele for fornecido; caso contrário, você pode sugerir um nome entre colchetes, como [Nome do Método].

# Entrega
- Gere exatamente o número de variações pedido, cada uma com um ângulo diferente (dores, contrastes ou fórmulas diferentes). Não repita a mesma estrutura de frase.
- Cada variação: 1 hook + 1 a 3 frases de Lock-In Zone, cada frase marcada com o id da fórmula que ela aplica.
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
Público-alvo / persona: ${input.audience}
Estágio do funil: ${input.funnelStage} (${stage?.focus})
Dor principal: ${input.painPoint}
Solução / promessa: ${input.solution}
Dados de prova reais (para Prova Concreta): ${input.proof || "nenhum fornecido"}
Nome do método (para Magic Box): ${input.methodName || "nenhum fornecido"}
Principal objeção do público: ${input.objection || "não informada"}
Observações do redator: ${input.notes || "nenhuma"}
</briefing>

${formulas}`;
}

const client = new Anthropic();

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

export class GenerationError extends Error {}
