// Real-time Hook Quality Auditor (Módulo 3).
// Análise determinística, sem IA: roda no navegador a cada tecla.
// Score 0–100 = soma de 4 checks de 25 pontos, um por erro fatal do hook.

import { LOCKIN_FORMULAS, type LockInFormulaId } from "./methodology";

export type CheckStatus = "PASSED" | "WARNING" | "FAILED";
export type HighlightKind =
  | "delay"
  | "first_person"
  | "second_person"
  | "jargon"
  | "lockin";

export interface Highlight {
  start: number;
  end: number;
  kind: HighlightKind;
  label: string;
}

export interface Alert {
  level: "red" | "yellow" | "green";
  title: string;
  detail: string;
}

interface BaseCheck {
  status: CheckStatus;
  score: number;
  message: string;
}

export interface AuditResult {
  audit_results: {
    overall_score: number;
    checks: {
      delay_check: BaseCheck;
      confusion_check: BaseCheck & {
        reading_level: "6th_grade" | "high_school" | "college";
        flesch_pt: number;
        hook_word_count: number;
      };
      irrelevance_check: BaseCheck & {
        second_person_density: "High" | "Medium" | "Low";
        second_person_count: number;
        first_person_count: number;
      };
      disinterest_check: BaseCheck & {
        lockin_formula_detected: string | null;
        lockin_formulas: { id: LockInFormulaId; name: string; sentence: number }[];
      };
    };
  };
  alerts: Alert[];
  highlights: Highlight[];
  sentences: { text: string; start: number; end: number }[];
}

// ---------------------------------------------------------------------------
// Tokenização

interface Token {
  raw: string;
  norm: string;
  start: number;
  end: number;
}

interface Sentence {
  text: string;
  start: number;
  end: number;
  tokens: Token[];
}

const strip = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function tokenize(text: string, offset = 0): Token[] {
  const out: Token[] = [];
  for (const m of text.matchAll(/[\p{L}\p{N}$%]+(?:[-'’][\p{L}\p{N}]+)*/gu)) {
    out.push({
      raw: m[0],
      norm: strip(m[0]),
      start: offset + m.index!,
      end: offset + m.index! + m[0].length,
    });
  }
  return out;
}

function splitSentences(text: string): Sentence[] {
  const out: Sentence[] = [];
  const re = /[^.!?…\n]+[.!?…]*/g;
  for (const m of text.matchAll(re)) {
    const raw = m[0];
    const lead = raw.length - raw.trimStart().length;
    const trimmed = raw.trim();
    if (!trimmed || !/[\p{L}\p{N}]/u.test(trimmed)) continue;
    const start = m.index! + lead;
    out.push({
      text: trimmed,
      start,
      end: start + trimmed.length,
      tokens: tokenize(trimmed, start),
    });
  }
  return out;
}

/** Procura frases (já normalizadas, palavras separadas por espaço) numa lista de tokens. */
function findPhrases(tokens: Token[], phrases: readonly string[]) {
  const hits: { phrase: string; start: number; end: number }[] = [];
  for (const phrase of phrases) {
    const parts = phrase.split(" ");
    for (let i = 0; i + parts.length <= tokens.length; i++) {
      if (parts.every((p, j) => tokens[i + j].norm === p)) {
        hits.push({
          phrase,
          start: tokens[i].start,
          end: tokens[i + parts.length - 1].end,
        });
      }
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Dicionários (normalizados: minúsculas, sem acento)

const DELAY_PHRASES = [
  "ola", "oi", "oie", "e ai", "fala pessoal", "fala galera", "fala doutor",
  "fala doutora", "tudo bem", "tudo bom", "bom dia", "boa tarde", "boa noite",
  "sejam bem vindos", "sejam bem-vindos", "seja bem vindo", "seja bem-vindo",
  "bem vindos", "bem-vindos", "bem vindo", "bem-vindo", "no video de hoje",
  "no video de hj", "neste video", "nesse video", "nesse video de hoje",
  "meu nome e", "eu me chamo", "eu sou o", "eu sou a", "antes de comecar",
  "antes da gente comecar", "hoje eu vou", "hoje vamos falar", "hoje eu quero",
  "hoje a gente vai", "galera", "pessoal", "deixa eu me apresentar",
  "se inscreve", "inscreva se", "inscreva-se",
];

const VAGUE_PHRASES = [
  "voce nao vai acreditar", "nao vai acreditar", "uma das coisas mais",
  "a coisa mais louca", "mais loucas que", "olha isso", "olha so isso",
  "presta atencao nisso", "isso e insano", "isso e surreal",
];

const SECOND_PERSON = new Set([
  "voce", "voces", "vc", "vcs", "seu", "seus", "sua", "suas", "te", "ti",
  "contigo", "teu", "teus", "tua", "tuas",
]);

const FIRST_PERSON = new Set([
  "eu", "meu", "meus", "minha", "minhas", "me", "mim", "comigo",
]);

const JARGON = [
  "outrossim", "destarte", "mediante", "supracitado", "supracitada",
  "concernente", "no que tange", "otimizacao", "paradigma", "sinergia",
  "alavancagem", "elisao", "aliquota efetiva", "base de calculo",
  "regime de apuracao", "lucro presumido", "fator r", "anexo v", "anexo iii",
  "equiparacao hospitalar", "planejamento tributario", "compliance",
  "escalabilidade", "holistico", "holistica", "disruptivo", "disruptiva",
  "portanto", "todavia", "conquanto", "precipuamente",
];

const PAIN_CUES = [
  "sofre", "sofrendo", "problema", "problemas", "paga", "pagando", "pagar",
  "perde", "perdendo", "cansado", "cansada", "dificil", "dor", "medo", "caro",
  "cara", "demais", "some", "sumindo", "prejuizo", "multa", "erro", "errado",
  "nao consegue", "trava", "travado", "apertado", "sem margem", "falta",
  "imposto", "impostos", "rasgando dinheiro", "jogando dinheiro fora",
];

const CONTRAST_CUES = [
  "mas", "porem", "enquanto", "em vez de", "ao inves", "sem", "nunca",
  "pare de", "errado", "errada", "mito", "ninguem", "a maioria", "todo mundo",
  "segredo", "na verdade", "so que", "mais caro", "ao contrario", "diferente",
  "nao e", "deixe de", "pare",
];

const PASSIVE_RE =
  /\b(foi|foram|e|sao|sera|serao|sendo|sido|era|eram)\s+\p{L}+(ado|ados|ada|adas|ido|idos|ida|idas)\b/u;

const FORMULA_CUES: Record<Exclude<LockInFormulaId, "prova_concreta">, string[]> = {
  transformacao: [
    "transforma", "transformar", "transformando", "imagine", "imagina",
    "finalmente", "vai ter", "vai poder", "passa a", "deixa de", "sem dor de cabeca",
    "tranquilidade", "lucro real", "liberdade", "mais tempo", "no seu bolso",
    "na sua conta", "como se", "de verdade", "sobrar", "sobra",
  ],
  contraste: [
    "enquanto", "ao contrario", "em vez de", "ao inves", "diferente", "versus",
    "vs", "tradicional", "tradicionais", "antigo", "antiga", "a maioria",
    "todo mundo", "na verdade", "so que", "porem", "no entanto",
  ],
  objecao: [
    "e nao", "nao precisa", "sem precisar", "mesmo que", "mesmo se",
    "nao importa", "nem precisa", "voce deve estar pensando", "pode parecer",
    "antes que voce pense", "sei que parece", "nao e dificil",
    "nao tem nada a ver", "nao e preciso",
  ],
  magic_box: [
    "chamamos", "chamo", "se chama", "chama se", "chama-se", "chamado",
    "chamada", "conhecido como", "conhecida como", "batizamos", "batizei",
    "apelidamos", "nomeamos",
  ],
  bold_claim: [
    "estou falando de", "to falando de", "tou falando de", "ou seja",
    "em outras palavras", "isso significa", "literalmente", "repito",
    "isso mesmo", "e serio",
  ],
};

const METHOD_WORDS = new Set([
  "metodo", "sistema", "protocolo", "framework", "estrutura", "formula",
  "tecnica", "estrategia", "modelo", "matriz", "ciclo", "regra",
]);

const PROOF_UNITS = new Set([
  "%", "por", "reais", "real", "mil", "milhao", "milhoes", "bilhao", "dias",
  "dia", "meses", "mes", "semanas", "semana", "anos", "ano", "x", "vezes",
  "clinicas", "clinica", "pacientes", "clientes", "horas", "minutos",
  "consultorios", "dentistas", "empresas", "vendas", "leads",
]);

const STOPWORDS = new Set([
  "sobre", "porque", "quando", "voces", "nossa", "nosso", "esses", "essas",
  "aquele", "aquela", "muito", "muita", "mesmo", "ainda", "entao", "depois",
  "antes", "todos", "todas", "sempre", "nunca", "isso", "esse", "essa",
  "pode", "podem", "fazer", "sendo", "estao", "estou", "minha", "clinica",
]);

// ---------------------------------------------------------------------------
// Métricas

function syllables(word: string) {
  const groups = word.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Flesch adaptado ao português (Martins et al., 1996). */
function fleschPT(tokens: Token[], sentenceCount: number) {
  const words = tokens.filter((t) => /\p{L}/u.test(t.norm));
  if (words.length === 0) return 100;
  const syl = words.reduce((n, t) => n + syllables(t.norm), 0);
  const score =
    248.835 -
    1.015 * (words.length / Math.max(1, sentenceCount)) -
    84.6 * (syl / words.length);
  return Math.round(Math.max(0, Math.min(100, score)));
}

function detectFormulas(sentence: Sentence, hook: Sentence | undefined) {
  const found = new Set<LockInFormulaId>();
  const cues: { start: number; end: number; id: LockInFormulaId }[] = [];
  const t = sentence.tokens;

  // 1. Prova concreta: número + unidade, ou "4x", "28%", "R$".
  for (let i = 0; i < t.length; i++) {
    const n = t[i].norm;
    const isNum = /\d/.test(n);
    if (!isNum) continue;
    const next = t[i + 1]?.norm;
    if (
      /\d+(%|x)$/.test(n) ||
      /^\$|r\$/.test(n) ||
      sentence.text.includes("R$") ||
      (next && PROOF_UNITS.has(next))
    ) {
      found.add("prova_concreta");
      const end = next && PROOF_UNITS.has(next) ? t[i + 1].end : t[i].end;
      cues.push({ start: t[i].start, end, id: "prova_concreta" });
    }
  }
  if (/\d+\s?%/.test(sentence.text) && !found.has("prova_concreta")) {
    found.add("prova_concreta");
  }

  for (const id of ["transformacao", "contraste", "objecao", "magic_box", "bold_claim"] as const) {
    for (const hit of findPhrases(t, FORMULA_CUES[id])) {
      found.add(id);
      cues.push({ start: hit.start, end: hit.end, id });
    }
  }

  // 4. Magic box: palavra de método seguida de nome próprio ("Método Equiparação Fiscal").
  for (let i = 0; i < t.length - 1; i++) {
    if (METHOD_WORDS.has(t[i].norm)) {
      const after = t.slice(i + 1, i + 3).find((x) => !["de", "da", "do", "dos", "das"].includes(x.norm));
      if (after && /^\p{Lu}/u.test(after.raw)) {
        found.add("magic_box");
        cues.push({ start: t[i].start, end: after.end, id: "magic_box" });
      }
    }
  }

  // 6. Afirmação dupla: reaproveita as palavras de peso do hook.
  if (hook) {
    const stems = new Set(
      hook.tokens
        .filter((x) => x.norm.length >= 5 && !STOPWORDS.has(x.norm))
        .map((x) => x.norm.slice(0, 5)),
    );
    const shared = t.filter(
      (x) => x.norm.length >= 5 && !STOPWORDS.has(x.norm) && stems.has(x.norm.slice(0, 5)),
    );
    const hasIntensifier = cues.some((c) => c.id === "bold_claim");
    if (shared.length >= 2 || (shared.length >= 1 && hasIntensifier)) {
      found.add("bold_claim");
      for (const s of shared) cues.push({ start: s.start, end: s.end, id: "bold_claim" });
    }
  }

  return { found, cues };
}

const statusFor = (score: number): CheckStatus =>
  score >= 20 ? "PASSED" : score >= 12 ? "WARNING" : "FAILED";

// ---------------------------------------------------------------------------
// Auditoria

export function auditScript(text: string): AuditResult {
  const sentences = splitSentences(text);
  const hook = sentences[0];
  const lockZone = sentences.slice(1, 4);
  const intro = sentences.slice(0, 4);
  const introTokens = intro.flatMap((s) => s.tokens);
  const highlights: Highlight[] = [];
  const alerts: Alert[] = [];

  if (!hook) {
    const empty: BaseCheck = { status: "FAILED", score: 0, message: "Escreva o hook para iniciar a auditoria." };
    return {
      audit_results: {
        overall_score: 0,
        checks: {
          delay_check: empty,
          confusion_check: { ...empty, reading_level: "6th_grade", flesch_pt: 0, hook_word_count: 0 },
          irrelevance_check: { ...empty, second_person_density: "Low", second_person_count: 0, first_person_count: 0 },
          disinterest_check: { ...empty, lockin_formula_detected: null, lockin_formulas: [] },
        },
      },
      alerts: [],
      highlights: [],
      sentences: [],
    };
  }

  // --- 1. Atraso ------------------------------------------------------------
  const delayHook = findPhrases(hook.tokens, DELAY_PHRASES);
  const delayLater = findPhrases(lockZone.slice(0, 2).flatMap((s) => s.tokens), DELAY_PHRASES);
  const vague = findPhrases(hook.tokens, VAGUE_PHRASES);
  for (const h of [...delayHook, ...delayLater]) {
    highlights.push({ start: h.start, end: h.end, kind: "delay", label: "Atraso / saudação" });
  }
  for (const h of vague) {
    highlights.push({ start: h.start, end: h.end, kind: "delay", label: "Hook vago, sem contexto" });
  }

  let delayScore = 25;
  let delayMsg = "Nenhum atraso ou saudação inicial detectada. Entrada direta no tema.";
  if (delayHook.length) {
    delayScore = 0;
    delayMsg = `Atraso no hook: "${text.slice(delayHook[0].start, delayHook[0].end)}". Corte a saudação e comece pelo tema (Speed to Value).`;
  } else if (vague.length) {
    delayScore = 10;
    delayMsg = "Hook vago: gera suspense mas não diz do que o vídeo trata. Dê o contexto na primeira frase.";
  } else if (delayLater.length) {
    delayScore = 14;
    delayMsg = `Saudação/apresentação logo após o hook ("${text.slice(delayLater[0].start, delayLater[0].end)}"). Isso esfria a Lock-In Zone.`;
  }
  if (delayHook.length || delayLater.length) {
    alerts.push({
      level: "red",
      title: "Delay Detected",
      detail: "Saudação, apresentação ou introdução detectada no início do roteiro.",
    });
  }

  // --- 2. Confusão ----------------------------------------------------------
  const hookWords = hook.tokens.filter((t) => /\p{L}/u.test(t.norm));
  const flesch = fleschPT(hook.tokens, 1);
  const jargon = findPhrases(hook.tokens, JARGON);
  for (const j of jargon) {
    highlights.push({ start: j.start, end: j.end, kind: "jargon", label: "Jargão / termo complexo" });
  }
  const passive = PASSIVE_RE.test(hook.tokens.map((t) => t.norm).join(" "));

  let confusionScore = 25;
  const confusionNotes: string[] = [];
  if (hookWords.length > 35) {
    confusionScore -= 12;
    confusionNotes.push(`hook longo (${hookWords.length} palavras)`);
  } else if (hookWords.length > 25) {
    confusionScore -= 6;
    confusionNotes.push(`hook um pouco longo (${hookWords.length} palavras)`);
  }
  if (flesch < 50) {
    confusionScore -= 8;
    confusionNotes.push("palavras longas e difíceis");
  } else if (flesch < 70) {
    confusionScore -= 4;
    confusionNotes.push("leitura de nível médio");
  }
  if (jargon.length) {
    confusionScore -= Math.min(10, jargon.length * 5);
    confusionNotes.push(`jargão: ${jargon.map((j) => text.slice(j.start, j.end)).join(", ")}`);
  }
  if (passive) {
    confusionScore -= 4;
    confusionNotes.push("voz passiva");
  }
  confusionScore = Math.max(0, confusionScore);
  const readingLevel = flesch >= 70 ? "6th_grade" : flesch >= 50 ? "high_school" : "college";
  const confusionMsg = confusionNotes.length
    ? `Simplifique: ${confusionNotes.join("; ")}. Busque linguagem de 6º ano, frases curtas e voz ativa.`
    : "Linguagem simples, direta e de fácil compreensão.";
  if (statusFor(confusionScore) !== "PASSED") {
    alerts.push({ level: "yellow", title: "Clareza baixa", detail: confusionMsg });
  }

  // --- 3. Irrelevância ------------------------------------------------------
  let youHook = 0;
  let youTotal = 0;
  let iTotal = 0;
  for (const s of intro) {
    for (const t of s.tokens) {
      if (SECOND_PERSON.has(t.norm)) {
        youTotal++;
        if (s === hook) youHook++;
        highlights.push({ start: t.start, end: t.end, kind: "second_person", label: "2ª pessoa" });
      } else if (FIRST_PERSON.has(t.norm)) {
        iTotal++;
        highlights.push({ start: t.start, end: t.end, kind: "first_person", label: "1ª pessoa (foco no criador)" });
      }
    }
  }
  for (const h of findPhrases(introTokens, ["minha empresa", "meu escritorio", "minha equipe", "eu ajudei", "eu ajudo"])) {
    highlights.push({ start: h.start, end: h.end, kind: "first_person", label: "Foco no criador" });
  }
  const pain = findPhrases(hook.tokens, PAIN_CUES).length > 0;
  const startsWithI = hook.tokens[0] && FIRST_PERSON.has(hook.tokens[0].norm);

  let irrScore: number;
  let irrMsg: string;
  if (youHook > 0 && youTotal >= iTotal) {
    irrScore = pain ? 25 : 21;
    irrMsg = pain
      ? "Uso adequado de pronomes de 2ª pessoa ('você/sua') e dor do público agitada no hook."
      : "Boa densidade de 'você/sua'. Dica: agite uma dor concreta no hook para torná-lo indispensável.";
  } else if (youTotal > 0 && youTotal >= iTotal) {
    irrScore = 15;
    irrMsg = "O 'você' só aparece depois do hook. Traga o espectador para a primeira frase.";
  } else if (youTotal > 0) {
    irrScore = 12;
    irrMsg = `Mais 'eu/meu' (${iTotal}) do que 'você/sua' (${youTotal}). Reescreva com foco no espectador.`;
  } else {
    irrScore = startsWithI ? 0 : 5;
    irrMsg = "Nenhum 'você/sua' na introdução. O espectador não se vê no vídeo.";
  }
  const density: "High" | "Medium" | "Low" =
    youTotal >= 2 && youTotal >= iTotal * 2 ? "High" : youTotal > iTotal || (youTotal > 0 && youTotal === iTotal) ? "Medium" : "Low";
  if (iTotal > youTotal || youHook === 0) {
    alerts.push({
      level: "yellow",
      title: "Low You-Density",
      detail: `Encontrados ${iTotal}× 'eu/meu/minha' e ${youTotal}× 'você/sua' na introdução.`,
    });
  }

  // --- 4. Desinteresse (Lock-In Zone) ----------------------------------------
  const formulas: { id: LockInFormulaId; name: string; sentence: number }[] = [];
  lockZone.forEach((s, idx) => {
    const { found, cues } = detectFormulas(s, hook);
    for (const id of found) {
      if (!formulas.some((f) => f.id === id)) {
        formulas.push({ id, name: LOCKIN_FORMULAS.find((f) => f.id === id)!.name, sentence: idx + 2 });
      }
    }
    for (const c of cues) {
      highlights.push({
        start: c.start,
        end: c.end,
        kind: "lockin",
        label: `Lock-In: ${LOCKIN_FORMULAS.find((f) => f.id === c.id)!.name}`,
      });
    }
  });
  const hookContrast = findPhrases(hook.tokens, CONTRAST_CUES).length > 0;

  let disScore: number;
  let disMsg: string;
  if (formulas.length) {
    disScore = hookContrast || formulas.length > 1 ? 25 : 22;
    disMsg = `Lock-In Zone ativada com ${formulas.map((f) => f.name).join(" + ")}.`;
    alerts.push({
      level: "green",
      title: "Lock-In Confirmed",
      detail: `${formulas.map((f) => `${f.name} (frase ${f.sentence})`).join(", ")}.`,
    });
  } else if (lockZone.length === 0) {
    disScore = hookContrast ? 12 : 5;
    disMsg = "Só há o hook. Adicione 1 a 3 frases de Lock-In Zone logo depois dele.";
  } else if (hookContrast) {
    disScore = 14;
    disMsg = "O hook abre contraste, mas nenhuma das 6 fórmulas foi detectada nas frases 2 a 4.";
  } else {
    disScore = 5;
    disMsg = "Sem alça de curiosidade: nem contraste no hook nem fórmula de Lock-In nas frases 2 a 4.";
  }

  const overall = delayScore + confusionScore + irrScore + disScore;

  return {
    audit_results: {
      overall_score: overall,
      checks: {
        delay_check: { status: statusFor(delayScore), score: delayScore, message: delayMsg },
        confusion_check: {
          status: statusFor(confusionScore),
          score: confusionScore,
          reading_level: readingLevel,
          flesch_pt: flesch,
          hook_word_count: hookWords.length,
          message: confusionMsg,
        },
        irrelevance_check: {
          status: statusFor(irrScore),
          score: irrScore,
          second_person_density: density,
          second_person_count: youTotal,
          first_person_count: iTotal,
          message: irrMsg,
        },
        disinterest_check: {
          status: statusFor(disScore),
          score: disScore,
          lockin_formula_detected: formulas[0]?.name ?? null,
          lockin_formulas: formulas,
          message: disMsg,
        },
      },
    },
    alerts,
    highlights: mergeHighlights(highlights),
    sentences: sentences.map(({ text, start, end }) => ({ text, start, end })),
  };
}

/** Remove sobreposições, priorizando os alertas mais graves. */
function mergeHighlights(list: Highlight[]) {
  const priority: Record<HighlightKind, number> = {
    delay: 0, jargon: 1, first_person: 2, lockin: 3, second_person: 4,
  };
  const sorted = [...list].sort((a, b) => priority[a.kind] - priority[b.kind] || a.start - b.start);
  const taken: Highlight[] = [];
  for (const h of sorted) {
    if (!taken.some((t) => h.start < t.end && t.start < h.end)) taken.push(h);
  }
  return taken.sort((a, b) => a.start - b.start);
}

export function scoreTone(score: number) {
  return score >= 80 ? "good" : score >= 55 ? "ok" : "bad";
}
