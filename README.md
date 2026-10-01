# Hook & Lock-In Generator Engine

WebApp interno para criar, auditar e gravar introduções de anúncios em vídeo curto (Reels, TikTok, Shorts) com alta retenção. Foco inicial: nicho odontológico e gestão fiscal de clínicas.

A especificação completa e as bases de conhecimento estão em [`briefings/`](briefings/).

## Módulos

| Rota | Módulo | O que faz |
|---|---|---|
| `/academy` | Central educacional | Os 4 erros fatais do hook, as 6 fórmulas de Lock-In, estágios de funil e checklist. |
| `/studio` | 1 + 2 · Profiler & Gerador | Público, funil, dor, promessa e "munição" (provas reais, nome do método, objeção). O Claude gera de 3 a 5 introduções (Hook + Lock-In Zone), cada uma já auditada. |
| `/auditor` | 3 · Auditor em tempo real | Score de 0 a 100 recalculado a cada tecla, com os alertas 🔴 Delay, 🟡 Low You-Density e 🟢 Lock-In Confirmed e as palavras destacadas no texto. |
| `/library` | 4 · Biblioteca | Roteiros salvos, com filtro por funil e status, edição, aprovação e exportação em TXT/PDF. |
| `/teleprompter/[id]` | 4 · Teleprompter | Tela cheia, rolagem com velocidade ajustável, tamanho de fonte, modo espelhado e atalhos de teclado. |

### Como o Auditor pontua

O Auditor é determinístico, não usa IA e roda no navegador ([`src/lib/auditor.ts`](src/lib/auditor.ts)). A primeira frase é tratada como hook e as frases 2 a 4 como Lock-In Zone. São 4 checks de 25 pontos cada:

- **Atraso:** saudações e apresentações ("olá", "no vídeo de hoje", "meu nome é"…) e hooks vagos, sem contexto.
- **Confusão:** tamanho do hook, legibilidade (Flesch adaptado ao português), jargão e voz passiva.
- **Irrelevância:** "você/sua" contra "eu/meu" e se o hook agita alguma dor.
- **Desinteresse:** detecta as 6 fórmulas nas frases 2 a 4 e se o hook tem contraste.

A saída segue o JSON da especificação (`audit_results.overall_score`, `checks.*`).

## Stack

- Next.js 16 (App Router, TypeScript) + Tailwind CSS 4
- Claude (`claude-opus-5-5`) via `@anthropic-ai/sdk`, com saída estruturada (Zod) e fallback automático do servidor em caso de recusa
- PostgreSQL + Drizzle ORM

O prompt de sistema do gerador ([`src/lib/generator.ts`](src/lib/generator.ts)) é montado a partir de [`src/lib/methodology.ts`](src/lib/methodology.ts), a mesma fonte usada pela Academy e pelo Auditor. Para mudar a metodologia, edite só esse arquivo. O prompt proíbe inventar números: sem dados de prova reais, a IA usa outra fórmula ou deixa marcadores como `[X%]`.

## Rodando localmente

```bash
cp .env.example .env.local   # preencha ANTHROPIC_API_KEY e DATABASE_URL
npm install
npm run db:migrate           # cria as tabelas
npm run dev                  # http://localhost:3000
```

O `.env.local` é lido pelo Next. Para rodar `db:migrate` com o `DATABASE_URL` dele, exporte a variável no shell antes.

## Deploy no Railway

1. Crie um projeto no Railway e adicione um serviço **PostgreSQL**.
2. Adicione um serviço a partir deste repositório do GitHub.
3. Nas variáveis do serviço do app, defina:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `ANTHROPIC_API_KEY` = sua chave
   - `APP_PASSWORD` (opcional, mas recomendado): protege o app com HTTP Basic Auth (qualquer usuário + essa senha)
4. O [`railway.json`](railway.json) já configura o build, as migrações no pre-deploy (`npm run db:migrate`), o start e o healthcheck em `/api/health`.

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run typecheck` | Gera os tipos de rota e roda o `tsc` |
| `npm run db:generate` | Gera uma nova migração após alterar `src/lib/db/schema.ts` |
| `npm run db:migrate` | Aplica as migrações (só usa dependências de produção) |

## Observação

`package.json` fixa `baseline-browser-mapping@2.11.26` em `overrides` porque o tarball da 2.11.27 está indisponível no registro do npm. Quando ele voltar, o override pode ser removido.
