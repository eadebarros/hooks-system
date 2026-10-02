// Fonte única da metodologia Hook & Lock-In.
// Usada pela Academy (conteúdo), pelo Gerador (prompt) e pelo Auditor (rótulos).

export const FUNNEL_STAGES = [
  {
    id: "TOFU",
    label: "TOFU · Topo",
    focus: "Dor, atenção e consciência do problema.",
  },
  {
    id: "MOFU",
    label: "MOFU · Meio",
    focus: "Quebra de objeções, contraste e apresentação do método.",
  },
  {
    id: "BOFU",
    label: "BOFU · Fundo",
    focus: "Chamada para ação (CTA), urgência e oferta do workshop/curso.",
  },
] as const;

export type FunnelStage = (typeof FUNNEL_STAGES)[number]["id"];

export const HOOK_ERRORS = [
  {
    id: "delay",
    name: "Atraso",
    en: "Delay",
    error:
      'Vinhetas, introduções longas ou saudações ("Olá doutor, tudo bem? Meu nome é...").',
    fix: "Speed to Value: entrar no tema principal nos primeiros 1 a 2 segundos.",
    why: "A retenção em vídeo curto cai como um penhasco nos 2 primeiros segundos. Cada segundo sem contexto sobre o tema faz uma parte grande do público sair, porque ele não tem informação para decidir ficar.",
    bad: "Gente, essa é uma das coisas mais loucas que eu já vi, e quando você ver, não vai acreditar.",
    good: "Se você é dono de clínica no Simples Nacional, pode estar pagando imposto demais todo mês.",
  },
  {
    id: "confusion",
    name: "Confusão",
    en: "Confusion",
    error: "Jargões técnicos, frases longas ou conceitos abstratos.",
    fix: "Linguagem do 6º ano: termos simples, diretos e em voz ativa.",
    why: "Se o espectador entende só metade das palavras, ele não consegue avaliar se o vídeo é para ele. Use menos palavras (mas o suficiente para não haver dupla interpretação), palavras simples e voz ativa.",
    bad: "A otimização da carga tributária mediante a equiparação hospitalar é negligenciada por clínicas.",
    good: "A maioria das clínicas paga mais imposto do que precisa, e a lei permite pagar menos.",
  },
  {
    id: "irrelevance",
    name: "Irrelevância",
    en: "Irrelevance",
    error: 'Foco no criador ("Eu ajudei mais de 100 clínicas...") em vez do espectador.',
    fix: 'Foco na 2ª pessoa ("você/sua") e agitação de uma dor familiar imediata.',
    why: 'Falar de si abre a dúvida "isso também vale para mim?". Falar "você" e tocar numa dor que ele já sente transforma o vídeo de "bom de saber" em "preciso ver".',
    bad: "Eu ajudei mais de 100 clínicas a organizar a contabilidade.",
    good: "Se você sente que sua clínica fatura bem mas o dinheiro some no fim do mês, presta atenção.",
  },
  {
    id: "disinterest",
    name: "Desinteresse",
    en: "Disinterest",
    error: "Declaração genérica, sem abrir uma alça de curiosidade.",
    fix: "Loop de curiosidade via contraste: confrontar uma crença comum (A) com uma alternativa instigante (B).",
    why: "Toda curiosidade nasce de contraste, A vs. B. O contraste pode ser declarado (A e B ditos explicitamente) ou implícito (só B é dito, porque o A já é conhecido do público).",
    bad: "Hoje vou falar sobre impostos para clínicas.",
    good: "Seu contador diz que o Simples é a melhor opção, mas para muitas clínicas ele é o regime mais caro.",
  },
] as const;

export type HookErrorId = (typeof HOOK_ERRORS)[number]["id"];

export const LOCKIN_FORMULAS = [
  {
    id: "prova_concreta",
    number: 1,
    name: "Prova Concreta",
    en: "Teasing Concrete Proof",
    psych: "Apresenta um dado numérico ou estatística imediata.",
    whenToUse:
      "Quando você tem prova real, numérica ou estatística, que defende a promessa do hook. Ótima para canais educacionais que constroem autoridade. Nunca invente números.",
    example:
      "Reduzimos a carga tributária de uma clínica parceira em 28% nos primeiros 60 dias.",
  },
  {
    id: "transformacao",
    number: 2,
    name: "Transformação Favorável",
    en: "Teasing a Favorable Transformation",
    psych: "Pinta a imagem do resultado final desejado.",
    whenToUse:
      "Quando não há prova numérica, mas a transformação que o espectador quer é fácil de identificar (mais lucro, tranquilidade, tempo).",
    example:
      "Isso transforma o faturamento bruto da sua clínica em lucro real e disponível na sua conta.",
  },
  {
    id: "contraste",
    number: 3,
    name: "Contraste Rápido (A vs. B)",
    en: "Rapidly Introducing Contrast",
    psych: "Compara o método antigo ou tradicional com o novo.",
    whenToUse:
      "Quando o tema do hook não é tão interessante por si só. O contraste força a curiosidade: o espectador quer saber o que há de errado no A que o B resolve.",
    example:
      "A contabilidade tradicional trata sua clínica como uma loja comum, enquanto a gestão estratégica gera economia real.",
  },
  {
    id: "magic_box",
    number: 4,
    name: "Magic Box (Termo Proprietário)",
    en: "Framing the Magic Box",
    psych: "Dá ao método um nome forte, que será explicado depois no vídeo.",
    whenToUse:
      "Quando existe um método, framework ou estrutura que pode ganhar um nome. É a fórmula mais fácil de combinar com as outras.",
    example: "Chamamos essa estrutura de Método de Equiparação Fiscal Odonto.",
  },
  {
    id: "objecao",
    number: 5,
    name: "Quebra de Objeção Proativa",
    en: "Objection Handling",
    psych: "Elimina de imediato a principal dúvida ou obstáculo.",
    whenToUse:
      "Quando o tema é ousado ou contrário ao senso comum e existe uma objeção óbvia que faria a pessoa rolar o feed. Se não há objeção clara, use outra fórmula.",
    example:
      "E não, você não precisa entender de contabilidade avançada nem gastar horas com planilhas.",
  },
  {
    id: "bold_claim",
    number: 6,
    name: "Afirmação Dupla (Bold Claim)",
    en: "Bold Claim Double Down",
    psych: "Reafirma a promessa principal com máxima clareza.",
    whenToUse:
      "Quando a promessa do hook é chamativa mas pouco clara, ou o conceito é novo para o público. Repetir a palavra que sustenta o vídeo dá ao espectador uma segunda chance de entender.",
    example:
      "Estou falando de pagar apenas o imposto estritamente necessário e parar de rasgar dinheiro todo mês.",
  },
] as const;

export type LockInFormulaId = (typeof LOCKIN_FORMULAS)[number]["id"];

export const LOCKIN_FORMULA_IDS = LOCKIN_FORMULAS.map((f) => f.id) as [
  LockInFormulaId,
  ...LockInFormulaId[],
];

// Frase de Lock-In que não aplica uma das 6 fórmulas: a interjeição dos 3 passos.
export const INTERJECTION = {
  id: "interjeicao",
  name: "Interjeição (stop)",
} as const;

/** Tipos possíveis de uma frase da Lock-In Zone: as 6 fórmulas + a interjeição. */
export const LOCKIN_LINE_TYPES = [...LOCKIN_FORMULAS, INTERJECTION] as const;

export const LOCKIN_LINE_TYPE_IDS = LOCKIN_LINE_TYPES.map((f) => f.id) as [
  LockInFormulaId | typeof INTERJECTION.id,
  ...(LockInFormulaId | typeof INTERJECTION.id)[],
];

export function formulaById(id: string) {
  return LOCKIN_LINE_TYPES.find((f) => f.id === id);
}

// ---------------------------------------------------------------------------
// Fórmula do hook em 3 passos (knowledge_source_3).

export const HOOK_STEPS = [
  {
    id: "context_lean",
    number: 1,
    name: "Contexto + Inclinação",
    en: "Context Lean",
    where: "Hook (0–3s)",
    how: "Em 1 ou 2 frases curtas, deixe claro do que o vídeo trata (para o público certo se identificar e o errado sair) e faça o espectador se inclinar para frente com uma das alavancas de inclinação.",
    example: "Sua clínica fatura bem. A agenda está cheia.",
  },
  {
    id: "interjection",
    number: 2,
    name: "Interjeição (Scroll-Stop)",
    en: "Scroll-Stop Interjection",
    where: "Lock-In, frase de transição",
    how: 'Uma frase curta com palavra de contraste ("mas", "só que", "porém", "acontece que") que funciona como um choque: trava a pessoa e prepara a virada. Sozinha ela não entrega nada; só existe para a próxima frase.',
    example: "Mas o lucro não aparece no fim do mês.",
  },
  {
    id: "snapback",
    number: 3,
    name: "Virada Contrária (Snapback)",
    en: "Contrarian Snapback",
    where: "Lock-In, logo após a interjeição",
    how: "A frase vai na direção oposta à inclinação inicial, sem sair do tema. Quanto maior a surpresa, mais forte o efeito. A virada precisa ser verdadeira e cumprida no vídeo: se não houver nada de valor depois, o público sai e você perde credibilidade.",
    example: "E o problema não é o imposto. É como a sua clínica está enquadrada.",
  },
] as const;

export const HOOK_XYZ_PATTERN = {
  name: "Quer X? Não faça Y, faça Z",
  how: "Variante compacta dos 3 passos: o benefício (X) inclina, a crença comum (Y) é negada e a alternativa (Z) é a virada. Z precisa ser realmente melhor que Y.",
  example: "Se você quer pagar menos imposto, não troque de contador. Revise o enquadramento da sua clínica.",
};

export const LEAN_LEVERS = [
  {
    id: "terreno_comum",
    name: "Terreno comum",
    how: "Começa por algo que o público vive ou já sabe, para ele se reconhecer.",
    example: "Sua clínica fatura bem e a agenda está cheia.",
  },
  {
    id: "beneficio_dor",
    name: "Benefício ou dor primeiro",
    how: "Abre pelo resultado que ele quer ou pela dor que sente, e só depois apresenta o assunto como solução. A vontade de resolver a dor segura até quem é cético sobre o tema.",
    example: "Se você quer pagar menos imposto, precisa olhar o enquadramento da sua clínica.",
  },
  {
    id: "metafora",
    name: "Metáfora",
    how: "Simplifica uma ideia complexa comparando com algo do dia a dia.",
    example: "O Simples Nacional é como um plano de celular: barato para quem usa pouco, caro para quem usa muito.",
  },
  {
    id: "fato_surpreendente",
    name: "Fato surpreendente",
    how: "Mostra ou diz algo tão interessante que surpreende. Só com fatos verdadeiros e verificáveis.",
    example: "Duas clínicas com o mesmo faturamento podem pagar impostos com diferença de dezenas de milhares de reais por ano.",
  },
  {
    id: "referencia_cultural",
    name: "Referência cultural (cult hopping)",
    how: "Embrulha o assunto desconhecido em algo conhecido (um filme, um movimento, uma marca ou situação famosa). O conhecido dá conforto; o desconhecido assusta e faz sair. Use como comparação, nunca sugerindo que a pessoa ou marca endossa o produto.",
    example: "Sabe o Leão do Imposto de Renda? Para muita clínica, ele morde mais forte no Simples.",
  },
] as const;

export type LeanLeverId = (typeof LEAN_LEVERS)[number]["id"];

export const LEAN_LEVER_IDS = LEAN_LEVERS.map((l) => l.id) as [LeanLeverId, ...LeanLeverId[]];

export function leverById(id: string) {
  return LEAN_LEVERS.find((l) => l.id === id);
}

export const CULT_HOPPING_RULES =
  "Referências culturais servem só como comparação. Nunca sugira que uma pessoa ou marca usa, recomenda ou endossa o produto, e não use imagem de terceiros. Em nichos regulados (saúde, jurídico, contábil), prefira referências a situações, filmes, expressões populares ou movimentos a nomes de pessoas reais, e respeite as regras do conselho profissional (CFO, CFM, OAB, CFC).";

// Táticas que valem para qualquer hook.
export const SPEED_TO_VALUE_SECONDS = 4;
export const ON_SCREEN_TEXT_WORDS = { min: 3, max: 5 } as const;
/** Ritmo médio de fala em vídeo curto, para estimar tempos. */
export const WORDS_PER_SECOND = 3;

export const HOOK_TACTICS = [
  {
    id: "visual",
    name: "Hook visual",
    how: `Texto na tela com ${ON_SCREEN_TEXT_WORDS.min} a ${ON_SCREEN_TEXT_WORDS.max} palavras, em fonte grande, reforçando o contexto (as pessoas leem mais rápido do que ouvem). Prefira o tema a um nome que o público ainda não conhece. A imagem precisa de movimento na medida: pouco entedia, demais confunde.`,
  },
  {
    id: "speed_to_value",
    name: "Speed to value",
    how: `Em vídeo curto, a atenção tem um cronômetro de cerca de ${SPEED_TO_VALUE_SECONDS} segundos. Entregue uma primeira dose de valor real (uma informação útil, um dado, uma dica) no hook ou logo depois. Não guarde o melhor para o final.`,
  },
  {
    id: "staccato",
    name: "Frases staccato",
    how: "No hook, frases muito curtas. Elas forçam clareza e aumentam o valor por palavra. As frases podem se alongar depois, no corpo do vídeo.",
  },
] as const;

export function funnelById(id: string) {
  return FUNNEL_STAGES.find((s) => s.id === id);
}
