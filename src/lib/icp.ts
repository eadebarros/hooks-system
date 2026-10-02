// Entrevista de ICP: o Claude conduz a conversa e devolve a ficha atualizada a cada turno.
import "server-only";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { GenerationError, MODEL, client } from "./claude";
import { ICP_FIELDS, type IcpFieldKey } from "./icp-fields";
import { ChatMessageSchema } from "./validation";

const DraftSchema = z.object(
  Object.fromEntries(ICP_FIELDS.map((f) => [f.key, z.string().describe(f.describe)])) as Record<IcpFieldKey, z.ZodString>,
);

const TurnSchema = z.object({
  reply: z.string().describe("Sua próxima fala na conversa, em português do Brasil."),
  icp: DraftSchema.describe("A ficha completa e atualizada do ICP. Campos ainda desconhecidos ficam como string vazia."),
  ready: z.boolean().describe("true quando nome, nicho, quem é, dores e solução já estão bem definidos."),
});

export const IcpChatInputSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(200),
  draft: DraftSchema.partial().default({}),
});

const SYSTEM_PROMPT = `Você é um estrategista de marketing brasileiro especialista em definir ICP (Ideal Customer Profile, o perfil de cliente ideal) para anúncios em vídeo curto. Você está entrevistando o dono de uma empresa ou o redator de uma agência para montar a ficha de um ICP. Essa ficha vai alimentar um gerador de hooks (as primeiras frases de um vídeo), então o que mais importa é: dores reais, desejos, objeções e a linguagem que o público usa.

# Como conduzir
- Faça no máximo 2 perguntas por vez, curtas e concretas. Nada de questionário longo.
- Comece entendendo o negócio: o que a empresa vende e para qual nicho.
- Depois aprofunde no cliente: quem é, o que o tira o sono, o que ele já tentou, o que ele quer, por que hesita, como ele fala.
- Quando a resposta for vaga ("empresários", "pessoas que querem crescer"), peça um exemplo real ou ofereça 2 ou 3 opções específicas para o usuário escolher.
- Se o usuário tiver mais de um público, ajude a escolher um. Cada ficha é um único ICP; os outros podem virar novas fichas.
- Reconheça o que entendeu em uma frase antes de perguntar de novo. Seja direto e cordial, sem bajulação.

# A ficha
- A cada turno, devolva a ficha completa em "icp", incorporando tudo o que já foi dito. A ficha atual (que o usuário pode ter editado à mão) vem junto da última mensagem: preserve as edições dele.
- Escreva os campos de forma objetiva, prontos para um redator usar. Em "dores" e "linguagem", prefira as palavras do próprio público.
- Você pode propor hipóteses de dores, desejos ou objeções típicas do nicho, mas deixe claro na conversa que são hipóteses e peça confirmação.
- Provas (números, casos, resultados) e nome do método: registre só o que o usuário disser. Nunca invente.
- Quando nome, nicho, quem é, dores e solução estiverem bem definidos, marque "ready" como true e diga que a ficha já pode ser salva, oferecendo-se para refinar objeções, provas ou linguagem se ainda faltar.`;

export async function icpTurn(input: z.infer<typeof IcpChatInputSchema>) {
  // A saudação inicial é do app; a API espera que a conversa comece pelo usuário.
  const start = input.messages.findIndex((m) => m.role === "user");
  if (start === -1) throw new GenerationError("Envie uma mensagem para começar.");
  const messages = input.messages.slice(start);
  const last = messages[messages.length - 1];
  if (last.role !== "user") throw new GenerationError("A última mensagem precisa ser do usuário.");

  const draft = Object.fromEntries(ICP_FIELDS.map((f) => [f.key, input.draft[f.key] ?? ""]));
  const history = messages.slice(0, -1);

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "low",
      format: betaZodOutputFormat(TurnSchema),
    },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      ...history,
      {
        role: "user",
        content: `${last.content}\n\n<ficha_atual>\n${JSON.stringify(draft, null, 2)}\n</ficha_atual>`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new GenerationError("O modelo recusou esta mensagem. Reformule e tente novamente.");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new GenerationError("A resposta do modelo veio incompleta. Tente novamente.");
  }

  return response.parsed_output;
}
