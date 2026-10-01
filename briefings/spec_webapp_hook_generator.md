# Software Requirement Specification (SRS)
## WebApp: Hook & Lock-In Generator Engine for Video Ads

**Versão:** 1.0  
**Status:** Especificação Técnica de Desenvolvimento  
**Aplicações:** Anúncios em Vídeo, Vídeos Curtos (Reels, TikTok, Shorts), Treinamento de Copywriters e Criadores de Conteúdo  
**Foco Inicial de Mercado:** Nicho Odontológico e Gestão Fiscal de Clínicas no Brasil  

---

## 1. Visão Geral do Produto

O **Hook & Lock-In Generator WebApp** é uma ferramenta interna desenvolvida para sistematizar, padronizar e otimizar a criação de roteiros de vídeos de alta conversão. O sistema combina uma **central de treinamento educacional integrada** com um **motor de geração auxiliado por IA** e um **auditor de qualidade em tempo real**.

### Objetivos do Sistema:
* **Garantir a Retenção Inicial (0–3s):** Eliminar falhas comuns de roteiro (atrasos, saudações, linguagem complexa e falta de direcionamento).
* **Consolidar a Lock-In Zone (3–8s):** Aplicar as 6 fórmulas táticas de retenção para elevar a curiosidade do espectador de 1 a 10 antes da entrega do conteúdo principal.
* **Aumentar a Produtividade da Equipe:** Permitir que copywriters e especialistas criem dezenas de variações de hooks validados em minutos.

---

## 2. Central Educacional Integrada (*The Hook & Lock-In Academy Hub*)

Esta seção da aplicação serve como um ambiente de aprendizado contínuo dentro do próprio WebApp, garantindo que todos os colaboradores compreendam os fundamentos metodológicos antes de gerar os roteiros.

### 2.1. O Sistema de Hooks (0 a 3 Segundos)

O objetivo exclusivo do Hook é parar a rolagem do feed (*stop the scroll*) e estabelecer clareza imediata sobre o tema do vídeo.

#### Os 4 Erros Fatais do Hook e Como Corrigi-los:
1. **Atraso (*Delay*):**
   * *O Erro:* Incluir vinhetas, introduções longas ou saudações ("Olá doutor, tudo bem? Meu nome é...").
   * *A Solução (Speed to Value):* Entrar no tema principal dentro dos primeiros 1 a 2 segundos.
2. **Confusão (*Confusion*):**
   * *O Erro:* Usar jargões técnicos complexos, frases longas ou conceitos abstratos.
   * *A Solução (Linguagem do 6º Ano):* Escrever com termos simples, diretos e ativos que qualquer pessoa compreenda instantaneamente.
3. **Irrelevância (*Irrelevance*):**
   * *O Erro:* Focar no criador ("Eu ajudei mais de 100 clínicas...") em vez de focar no espectador.
   * *A Solução (Foco na 2ª Pessoa - "Você/Sua"):* Usar pronomes de segunda pessoa e agitar uma dor familiar imediata ("Se você é dono de clínica e sofre com...").
4. **Desinteresse (*Disinterest*):**
   * *O Erro:* Fazer uma declaração genérica sem criar uma alça de curiosidade.
   * *A Solução (Loop de Curiosidade via Contraste):* Confrontar uma crença comum com um ponto de vista alternativo instigante.

---

### 2.2. A Lock-In Zone (3 a 8 Segundos / Frases 2 a 4)

A Lock-In Zone consiste em 1 a 3 frases posicionadas imediatamente após o Hook. Sua função é atuar como uma catraca psicológica, amplificando a curiosidade do espectador para garantir que ele permaneça assistindo ao vídeo.

#### As 6 Fórmulas Táticas de Lock-In:
| # | Fórmula Tática | Função Psicológica | Exemplo Prático (Mercado Odonto-Fiscal) |
|---|---|---|---|
| **1** | **Prova Concreta** | Apresenta dado numérico ou estatística imediata | *"Reduzimos a carga tributária de uma clínica parceira em 28% nos primeiros 60 dias."* |
| **2** | **Transformação Favorável** | Pinta a imagem do resultado final desejado | *"Isso transforma o faturamento bruto da sua clínica em lucro real e disponível na sua conta."* |
| **3** | **Contraste Rápido (A vs. B)** | Compara o método antigo/tradicional com o novo | *"A contabilidade tradicional trata sua clínica como uma loja comum, enquanto a gestão estratégica gera economia real."* |
| **4** | **Magic Box (Termo Proprietário)** | Nomeia o método com uma marca forte | *"Chamamos essa estrutura de Método de Equiparação Fiscal Odonto."* |
| **5** | **Quebra de Objeção Proativa** | Elimina a principal dúvida/obstáculo de imediato | *"E não, você não precisa entender de contabilidade avançada nem gastar horas com planilhas."* |
| **6** | **Afirmação Dupla (Bold Claim)** | Reafirma a promessa principal com máxima clareza | *"Estou falando de pagar apenas o imposto estritamente necessário e parar de rasgar dinheiro todo mês."* |

---

## 3. Arquitetura de Módulos Funcionais do WebApp

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HOOK & LOCK-IN ENGINE                           │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Módulo 1          │ Módulo 2          │ Módulo 3                       │
│ Profiler de       │ Motor Gerador de  │ Auditor de Qualidade           │
│ Público & Funil   │ Hooks & Lock-In   │ em Tempo Real (Score 0-100)    │
├───────────────────┴───────────────────┴────────────────────────────────┤
│ Módulo 4                                                               │
│ Central de Teleprompter & Exportação (TXT / PDF / Library)              │
└────────────────────────────────────────────────────────────────────────┘
```

### Módulo 1: Profiler de Público & Funil (Inputs)
* **Público-Alvo / Persona:** Campo de seleção ou texto livre (ex: *Dono de clínica odontológica no Brasil*).
* **Estágio do Funil:**
  * `TOFU (Topo)`: Foco em dor, atenção e consciência de problema.
  * `MOFU (Meio)`: Foco em quebra de objeções, contraste e apresentação de método.
  * `BOFU (Fim)`: Foco em chamada para ação (CTA), urgência e oferta do workshop/curso.
* **Dor Principal (Pain Point):** Agitação da dor (ex: *impostos altos no Simples Nacional / falta de margem de lucro*).
* **Solução / Promessa:** Resultado oferecido (ex: *reestruturação fiscal legal / planejamento para clínicas*).

---

### Módulo 2: Motor Gerador de Hooks & Lock-In
* **Gerador de Hook (0–3s):** Aplica regras automatizadas para forçar o uso de "Você/Sua", eliminar palavras de atraso e simplificar a estrutura sintática.
* **Seletor de Fórmula Lock-In (3–8s):** Permite ao usuário escolher qual das 6 fórmulas deseja aplicar ou gerar variações automáticas combinando as fórmulas.
* **Matriz de Saída:** Entrega 3 a 5 variações completas de introdução (Hook + Lock-In Zone) prontas para revisão.

---

### Módulo 3: Real-time Hook Quality Auditor (Análise de Qualidade)
Um algoritmo de inspeção que lê o texto inserido ou gerado e exibe um **Score de 0 a 100** baseado nos 4 erros de Hook:

```json
{
  "audit_results": {
    "overall_score": 92,
    "checks": {
      "delay_check": {
        "status": "PASSED",
        "message": "Nenhum atraso ou saudação inicial detectada. Entrada direta no tema."
      },
      "confusion_check": {
        "status": "PASSED",
        "reading_level": "6th_grade",
        "message": "Linguagem simples, direta e de fácil compreensão."
      },
      "irrelevance_check": {
        "status": "PASSED",
        "second_person_density": "High",
        "message": "Uso adequado de pronomes de 2ª pessoa ('você/sua clínica')."
      },
      "disinterest_check": {
        "status": "PASSED",
        "lockin_formula_detected": "Teasing Concrete Proof",
        "message": "Lock-In Zone ativada com dados/prova concreta."
      }
    }
  }
}
```

#### Indicadores Visuais no Editor:
* 🔴 **Alerta Vermelho (Delay Detected):** Detecta palavras como "Olá", "Sejam bem-vindos", "No vídeo de hoje".
* 🟡 **Alerta Amarelo (Low You-Density):** Alerta quando o texto contém excesso de "Eu", "Meu" ou "Minha empresa".
* 🟢 **Sinal Verde (Lock-In Confirmed):** Confirma a presença de uma das 6 fórmulas de retenção entre as frases 2 e 4.

---

### Módulo 4: Central de Teleprompter & Exportação
* **Modo Gravação (Teleprompter Integrador):** Exibe o roteiro aprovado em tela cheia com rolagem de texto ajustável e tamanho de fonte configurável para gravação via celular/câmera.
* **Exportação:** Exportação nos formatos `.txt`, `.pdf` (para impressão) e salvamento na biblioteca interna da empresa para reaproveitamento.

---

## 4. Requisitos Técnicos e Stack Recomendada

* **Frontend:** React / Next.js (TypeScript), TailwindCSS para UI fluida e responsiva.
* **Backend:** Node.js (Express/Fastify) ou Python (FastAPI).
* **Motor de IA / LLM:** API OpenAI / Gemini com *System Prompts* estruturados com poucos exemplos (*few-shot prompting*) focados na metodologia Lock-In Zone.
* **Banco de Dados:** PostgreSQL / Supabase para armazenamento de personas, histórico de roteiros e métricas de desempenho dos anúncios.
