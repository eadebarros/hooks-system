// Campos da ficha de ICP: usados pela tela /icp, pela entrevista e pelo seletor do Gerador.
export const ICP_FIELDS = [
  { key: "name", label: "Nome do ICP", describe: 'Nome curto para identificar o ICP no seletor, ex.: "Dentista dono de clínica".' },
  { key: "niche", label: "Nicho", describe: "Nicho de mercado do cliente (não o da empresa que vende), ex.: odontologia, advocacia trabalhista." },
  { key: "audience", label: "Quem é", describe: "Descrição do cliente ideal: cargo, porte do negócio, momento, região, perfil." },
  { key: "painPoint", label: "Dores", describe: "As dores que ele já sente e que o fazem buscar uma solução, nas palavras dele." },
  { key: "desires", label: "Desejos", describe: "O resultado que ele quer: como seria a vida/negócio dele depois do problema resolvido." },
  { key: "solution", label: "Solução / promessa", describe: "O que a empresa oferece a esse ICP e qual a promessa principal." },
  { key: "objection", label: "Objeções", describe: "O que faz ele hesitar ou não comprar (preço, tempo, desconfiança…)." },
  { key: "proof", label: "Provas reais", describe: "Números, casos ou resultados verificáveis informados pelo usuário. Nunca invente." },
  { key: "methodName", label: "Nome do método", describe: "Nome do método/framework da empresa, se existir. Não invente." },
  { key: "language", label: "Linguagem do público", describe: "Palavras, expressões e tom que esse público usa (e termos a evitar)." },
] as const;

export type IcpFieldKey = (typeof ICP_FIELDS)[number]["key"];
export type IcpDraft = Record<IcpFieldKey, string>;
