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

export function formulaById(id: string) {
  return LOCKIN_FORMULAS.find((f) => f.id === id);
}

export function funnelById(id: string) {
  return FUNNEL_STAGES.find((s) => s.id === id);
}
