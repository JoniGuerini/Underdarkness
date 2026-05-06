# Design System — Underdarkness
> *Referência rápida do sistema visual usado no Underdarkness. Pode ser portado pra outro projeto copiando os tokens (`:root`) e seguindo as regras de uso abaixo.*

---

## 1. Filosofia

Aparência de **manuscrito digital sob luz fria** — fundos cinza-azulados dessaturados, acentos em tan/cream sóbrio (latão envelhecido), texto em folha branca-fria, e cores vivas apenas onde o jogo precisa de leitura instantânea (cores semânticas dos mods). A textura visual vem só de cores e bordas — nada de imagens. Combina uma fonte **serif moderna com flair** (Fraunces) para títulos e narrativa com uma **mono pixelada** (JetBrains Mono) para a interface. O resultado fica entre uma ficha técnica de ARPG sóbrio e uma página de códice à luz fria — formal, contido, com hierarquia clara.

**Princípios:**
- Contraste presente mas controlado — nunca preto puro nem branco puro
- Cores sempre derivadas das três famílias: **noite cinza-azulada** (fundos), **latão dessaturado** (acentos e UI primária), **folha cinza-clara** (textos)
- Vermelho é reservado pra ações destrutivas (e por convenção de jogo, vida)
- Fronteiras visíveis mas leves — o leitor sente as divisões sem que elas gritem
- **Valores numéricos sempre em latão** — destacam-se das labels neutras pra que o olho vá direto pros números

---

## 2. Tom de voz

A interface fala de forma **direta e funcional**. A imersão do RPG vem do **conteúdo do jogo** (história, diálogos, descrições de itens, eventos do mundo) — **não da UI**. Títulos de tela, botões, labels, instruções e mensagens de sistema devem ser claros, neutros e modernos, como em qualquer interface bem feita.

**Princípios:**
- **Direto, não narrativo**: "Criar Personagem" em vez de "Forjar Herói". "Escolha uma classe" em vez de "Diz qual senda seguirás".
- **Português moderno**: nada de "tu/teu/diz/escolhe". Usar imperativos modernos ("Escolha", "Confirme", "Digite") e tratamento neutro.
- **Sem cenas em mensagens de UI**: confirmar uma ação não precisa de narração. Avisar erros não precisa de drama. Toasts e modais são informativos, não cinematográficos.
- **Vocabulário do jogo é OK**: "Vida", "Mana", "Dano", "Classe", "Habilidade", "Inventário" são termos do sistema, não imersão. Use livremente.
- **A personalidade vem do visual**: a paleta de noite/latão dessaturado, a Fraunces nos títulos, o `✦` ornamental — esses elementos carregam a atmosfera. O texto da UI não precisa reforçar isso.

**Onde a narrativa entra:**
A UI é o esqueleto — só sustenta. A voz de RPG vive no **conteúdo**: história, diálogos com NPCs, descrições de itens e habilidades, lore, falas de eventos do mundo. Esse é o miolo do jogo, e ali a Fraunces italic em `--ink-muted` brilha. Mas isso é *conteúdo*, não *interface*.

**Exemplos lado a lado:**

| Excesso de imersão (evitar)              | Direto (preferir)                                     |
|------------------------------------------|-------------------------------------------------------|
| A Forja do Herói                         | Criação de Personagem                                 |
| Capítulo I — Diz teu nome                | Escolha um nome e uma classe                          |
| Vocações Disponíveis                     | Classes                                               |
| Forjar Herói                             | Criar Personagem                                      |
| "Como serás conhecido nas crônicas..."   | "Digite o nome do personagem"                         |
| Modal pós-ação com narração              | (sem modal — vai direto pra próxima tela)             |
| "Aço e fúria" (tagline poética)          | "Combate corpo a corpo" (descrição funcional)         |
| "Forjado em batalhas, muralha de carne..." | "Alta defesa e dano físico. Forte no combate direto." |
| "E qual senda seguirás, herói?"          | "Escolha uma classe."                                 |

**Teste prático:**
Antes de redigir qualquer texto de UI, pergunte: *"Esse texto está descrevendo o que a tela faz, ou está atuando uma cena?"* Se for atuando, simplifica.

---

## 3. Cores

Todas as cores são CSS variables no `:root`. Use sempre via `var(--nome)`.

### Fundos — noite (do mais profundo ao mais elevado)

| Token              | Hex       | Quando usar                                         |
|--------------------|-----------|-----------------------------------------------------|
| `--bg`             | `#0c0e12` | Cor de fundo do `body` — base do app                |
| `--paper`          | `#131620` | Modais, dropdowns abertos, "ilhas" de conteúdo      |
| `--surface`        | `#1a1e2a` | Cards, inputs, botões, estatísticas                 |
| `--surface-hover`  | `#232838` | Hover sobre `--surface`                             |
| `--surface-deep`   | `#2a3045` | Estado "ativo" (item de menu selecionado, badges)   |

> **Nota:** quanto mais "elevado/proeminente" o elemento, mais ele se afasta do `--bg` (ficando mais claro). Esse é o princípio de elevação por contraste — uma camada acima da outra.

### Latão — bordas, ações, acentos e **destaque de valores**

| Token            | Hex       | Quando usar                                              |
|------------------|-----------|----------------------------------------------------------|
| `--brass-light`  | `#5a5040` | Hover de bordas, acento decorativo sutil                 |
| `--brass`        | `#7a7060` | Borda focada (input em foco, dropdown aberto)            |
| `--brass-deep`   | `#bcb09a` | **Botão primário**, **títulos importantes**, **valores numéricos**, item selecionado |
| `--brass-bright` | `#c2a878` | Hover do botão primário, estados mais brilhantes         |

> **Princípio:** o latão é a "peça de destaque" da interface. `--brass-deep` aparece em três contextos: (1) ações primárias (botões), (2) títulos importantes, e (3) **todos os valores numéricos da ficha** — números de stats, vitais (X/Y), tempo, ouro, números de ações de cena, índices de quick action. A regra é: **labels em texto neutro, valores em latão** — assim o olho vai direto pros números numa varredura de relance.

### Folha — textos (do mais forte ao mais discreto)

| Token          | Hex       | Quando usar                                              |
|----------------|-----------|----------------------------------------------------------|
| `--ink`        | `#d8dce2` | Texto principal (parágrafos, valores não-numéricos)      |
| `--ink-soft`   | `#b0b6c0` | Texto secundário (descrições, labels destacadas)         |
| `--ink-muted`  | `#8b96a3` | Texto de apoio (subtítulos, metadados, placeholder forte)|
| `--ink-faint`  | `#545d6e` | Texto bem discreto, placeholders em itálico              |

### Acento — destruição

| Token            | Hex       | Quando usar                                              |
|------------------|-----------|----------------------------------------------------------|
| `--accent`       | `#c45a4d` | Botão de perigo (apagar, substituir), badge "oculto"     |
| `--accent-deep`  | `#9a3e34` | Hover/active do acento, título em modo "danger"          |

> **Regra:** vermelho **só** aparece em ações irreversíveis ou alertas. Nunca em links, botões positivos, hover normal. *(Exceção: barra de Vida — ver "Vitais" abaixo.)*

### Vitais — convenção de jogo

| Token            | Hex       | Quando usar                                              |
|------------------|-----------|----------------------------------------------------------|
| `--vital-vida`   | `#b85450` | Vida (HP) — terracota sóbrio, vindo do mockup de referência. Aplica em barra de Vida, Regen Vida e Roubo de Vida |
| `--vital-mana`   | `#5a8aa8` | Mana (MP) — azul-cinza dessaturado, vindo do mockup de referência. Aplica em barra de Mana, Regen Mana, Roubo de Mana, Eficiência Mana |
| `--vital-exp`    | `#8a6f3e` | Experiência (EXP) — latão oxidado. Aplica em barra de Exp |

> **Exceção explícita:** estas cores quebram a regra "vermelho só pra ações destrutivas" porque convenção de jogo (vermelho = sangue/vida, azul = arcano/mana) tem precedência aqui. Use **apenas** em barras de status/recursos. Botões, bordas, ícones e UI geral continuam na paleta de latão/folha.

### Tipos de Dano — alinhados com Grim Dawn Rainbow Filter

| Token            | Hex       | Quando usar                                              |
|------------------|-----------|----------------------------------------------------------|
| `--elem-fisico`  | `#F0E68C` | Dano Físico, DPS, Resistência Física — **GD: Physical (Khaki)** |
| `--elem-fogo`    | `#C09060` | Dano de Fogo, Resistência ao Fogo — **GD: Fire (Tussock)** |
| `--elem-gelo`    | `#4DD9D9` | Dano de Gelo, Resistência ao Gelo — **GD: Cold (Cyan)** |
| `--elem-raio`    | `#6495ED` | Dano de Raio, Resistência ao Raio — **GD: Lightning (Cornflower Blue)** |
| `--elem-caos`    | `#B57EDC` | Dano de Caos, Resistência ao Caos — **GD: Chaos (Lavender Purple)** |

> **Princípio:** todos os tipos de dano têm cor própria, alinhados com a paleta do **Rainbow Filter mod do Grim Dawn** (Wanez Tools) pra coerência com convenção de jogo do gênero ARPG. Físico é Khaki (não é mais "neutro"). As cores aparecem em labels de stats, ícones de habilidade e efeitos visuais. **Não devem aparecer em UI geral** (botões, bordas, decoração).

### Categorias de Mods — convenção de jogo

Cores semânticas para os modificadores da ficha do personagem que não se encaixam em "Vitais" ou "Tipos de Dano".

| Token              | Hex       | Mods nessa categoria                                              |
|--------------------|-----------|-------------------------------------------------------------------|
| `--stat-forca`     | `#E04848` | **Força** (atributo) — vermelho RGB vivo (par com Agilidade verde e Intelecto azul). Distinto do `--vital-vida` que é terracota mais sóbrio |
| `--stat-agilidade` | `#22C55E` | **Agilidade** (atributo), Vel. Ataque, Vel. Conjuração, Vel. Movimento, Esquiva — verde clássico |
| `--stat-intelecto` | `#3B82F6` | **Intelecto** (atributo), Bônus Mágico — azul clássico             |
| `--stat-defesa`    | `#9aa6b4` | Armadura, Evasão, Bloqueio — cinza-aço                             |
| `--stat-critico`   | `#4F5934` | Chance Crítico, Mult. Crítico — **GD: Special (Tom Thumb verde-oliva)** |

> **Princípio (todas as categorias de mods):** todo modificador da ficha tem uma cor associada que mapeia a uma categoria semântica. A cor é aplicada **no label do mod**, não no valor — números permanecem em `--brass-deep` para destaque (ver "Latão"). Mods sem categoria forte (ex: "Penetração" genérica) ficam em `--ink-soft` padrão.

> **Atributos primários em RGB clássico:** Força (vermelho), Agilidade (verde), Intelecto (azul) — convenção universal de RPG. As stats que **derivam** de cada atributo herdam a cor (ex: Vel. Ataque deriva de Agilidade → verde). Isso conecta visualmente o atributo ao seu efeito derivado.

> **Stats agregados (sem cor de categoria):** "Dano Total" e "DPS" são somas de todos os tipos de dano (físico + elemental + caos), então não pertencem a nenhuma categoria específica. Ficam em `--ink-soft` (texto neutro) — só o valor numérico recebe destaque (`--brass-deep`).

**Combinação de cores numa linha de stat:**
```
[label em mod color]    [valor em --brass-deep]
Resistência ao Fogo     0% / 75%
        ↑                    ↑
   --elem-fogo          --brass-deep
```

### Raridade de Itens — convenção ARPG

| Token              | Hex       | Tier                                                            |
|--------------------|-----------|-----------------------------------------------------------------|
| `--rarity-comum`   | `#b0b6c0` | **Comum** — cinza-folha, mesmo do `--ink-soft`                  |
| `--rarity-magico`  | `#6495ED` | **Mágico** — cornflower blue (família do Raio)                  |
| `--rarity-raro`    | `#F0E68C` | **Raro** — khaki (família do Físico)                            |
| `--rarity-unico`   | `#C09060` | **Único** — tussock orange (família do Fogo)                    |
| `--rarity-lendario`| `#B57EDC` | **Lendário** — lavanda (família do Caos)                        |

> **Princípio:** os 5 tiers de raridade reusam tons já presentes no design system pra criar hierarquia familiar. Aplicar **na cor do nome do item** (em slots de inventário, tooltips, descrições) — nunca em bordas. A borda do slot fica neutra; a raridade comunica via tipografia colorida.

### Tipos de Missão — Diário

| Token              | Hex       | Tipo                                                            |
|--------------------|-----------|-----------------------------------------------------------------|
| `--brass-bright`   | `#c2a878` | **Principal** — jornada canônica da história                    |
| `--ink-soft`       | `#b0b6c0` | **Secundária** — opcional, flavor                               |
| `--vital-vida`     | `#b85450` | **Caçada** (bounty) — perigo, pressa                            |
| `--rarity-magico`  | `#6495ED` | **Classe** — provações de classe, maestria                      |
| `--stat-agilidade` | `#22C55E` | **Evento** — eventos temporários do mundo                       |
| `--elem-caos`      | `#B57EDC` | **Facção** — política, intriga                                  |

> **Princípio:** os 6 tipos de missão também reusam tokens existentes. Aplica-se na cor do **tag de tipo** dentro do card de quest (mono uppercase 10px). Nunca na borda do card.

### Bordas

| Token            | Hex       | Quando usar                                              |
|------------------|-----------|----------------------------------------------------------|
| `--border`       | `#2a3045` | Divisor/borda padrão (inputs, cards proeminentes)        |
| `--border-soft`  | `#1d2230` | Borda discreta (cards normais, separação suave)          |
| `--border-faint` | `#14181f` | Linha quase invisível (separadores internos de card)     |

### Sombras

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.45);   /* card em repouso */
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.55);   /* card em hover */
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.7);   /* modal, dropdown aberto */
```

> Sombras são quase pretas e densas — o escuro precisa de mais opacidade pra criar profundidade visível.

---

## 4. Tipografia

### Famílias

```css
--serif: 'Fraunces', Georgia, serif;            /* display, narrativa, ênfase */
--mono:  'JetBrains Mono', 'Courier New', monospace;  /* UI, body, controles */
```

Importação via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
```

> **Importante:** Fraunces tem `font-variation-settings: "opsz" N` — define o "tamanho ótico". Usamos valores diferentes pra dar peso e personalidade conforme o tamanho real do texto.

### Escala de tamanhos

Organizada do maior pro menor:

| Tamanho | Família | Peso | opsz | Uso                                              |
|---------|---------|------|------|--------------------------------------------------|
| 44px    | serif   | 500  | 96   | `.stat .num` (números grandes de estatísticas)   |
| 40px    | serif   | 500  | 96   | Título de detalhe (`.detail h2`)                 |
| 36px    | serif   | 500  | 72   | Título de página (`.section-title`)              |
| 32px    | serif   | 500  | 60   | `<h1>` da marca (versão original)                |
| 30px    | serif   | 500  | 60   | `<h1>` da marca (versão sidebar)                 |
| 28px    | serif   | 500  | 36   | Título do modal de formulário (`.modal h2`)      |
| 26px    | serif   | 500  | 36   | Título do modal de confirmação                   |
| 24px    | serif   | 500  | 36   | Empty state h3, modal de fechar (×)              |
| 22px    | serif   | 500  | 36   | Título de card (`.card-title`)                   |
| 20px    | serif   | 500  | 24   | Título de evento (`.event-item .ttl`)            |
| 19px    | serif   | italic 400 | 18 | Subtítulo do detalhe ("role")                |
| 18px    | mono    | 500  | —    | Botões de número customizados (+ −)              |
| 17px    | serif   | italic 400 | 14 | Subtítulo de página, empty state p           |
| 16px    | serif   | 500  | 14   | Trigger do select (variante normal)              |
| 16px    | mono    | —    | —    | Mensagem de modal de confirmação                 |
| 16px    | mono    | —    | —    | Botão ícone (×, ↑, ↓, +)                        |
| 15px    | serif   | italic 400 | 14 | Subtítulo de card                            |
| 15px    | mono    | 400  | —    | Body geral, inputs, descrições, valores meta     |
| 14px    | serif   | 400  | 14   | Chip, hint do checkbox                           |
| 14px    | mono    | 400  | —    | Body de card, descrição de evento                |
| 13px    | mono    | 500  | —    | Tabs, botão primário, link voltar                |
| 12px    | mono    | 500  | —    | Botão secundário, mode-toggle, related h3        |
| 12px    | mono    | 500  | —    | **Valores de stats da ficha (em `--brass-deep`)** |
| 12px    | mono    | 400  | —    | Card meta                                        |
| 11px    | mono    | 500  | —    | Labels (UPPERCASE), tag, meta-label              |
| 10px    | mono    | 500  | —    | Badges (visível/oculto)                          |
| 9px     | mono    | —    | —    | Setinhas do dropdown (▼)                         |

### Padrões de uso

**Títulos de seção/página** → `serif`, peso 500, `letter-spacing: -0.015em`, `opsz: 72`, cor `--brass-deep` (latão dessaturado).

**Subtítulos** → `serif italic` em `--ink-muted`, dá um ar "narrativo".

**Body / parágrafo** → `mono` 15px com `line-height: 1.65-1.75`, cor `--ink`.

**Labels de formulário e categoria** → `mono` 11px **UPPERCASE** com `letter-spacing: 0.08em`. Em `--ink-soft` ou `--ink-muted` quando subseção.

**Valores numéricos** → `mono` 12-16px peso 500 em `--brass-deep`. **Sempre.** Não importa o tamanho do contexto — valor numérico tem cor de latão.

**Botões e controles** → `mono`, 12-13px, peso 500, `letter-spacing: 0.03-0.06em`.

**Badges** → `mono` 10px, **lowercase** (proposital, dá um charme), peso 500.

**Pre-formatted "narrativa"** (descrição longa) → `mono` 15px, `white-space: pre-wrap`, `line-height: 1.75`.

---

## 5. Outros tokens visuais

### Border radius
- `4px` — botões, inputs, slots de inventário, cards do HUD principal e do frame de modais (overlay/header/footer/painéis), tabs, talents, opções de dropdown
- `6px` — cards de conteúdo internos (CharacterSheet, Inventory, TalentsView, MapView, JournalView), summary cards
- `20px` — chips (pill format), badges arredondadas

### Espaçamentos comuns
- Padding interno de card de conteúdo: `24-28px` (varia por densidade — Inventory 24×28, CharacterSheet 28×36)
- Padding de input: `11px 14px`
- Padding de botão primário: `10px 20px`
- Gap entre elementos relacionados: `8-12px`
- Gap entre seções: `24-28px`

### Layout HUD principal e Modais "large"

A HUD do jogo e os modais que cobrem a tela toda seguem o mesmo pattern: **frame escuro (`--bg`) com cards paper flutuantes separados por gap de 8px**. Isso cria respiração visual e consistência entre as telas.

```
┌────────────── frame: --bg ──────────────┐
│ ┌─card─────────────────────────────────┐│
│ │ Header (paper bg + border)           ││  ← 8px gap entre cards
│ └──────────────────────────────────────┘│
│ ┌─card────────┐ ┌─card────────────────┐│
│ │ Sidebar     │ │ Centro              ││  ← cards lado a lado também 8px gap
│ │ (paper)     │ │ (paper)             ││
│ └─────────────┘ └─────────────────────┘│
│ ┌─card─────────────────────────────────┐│
│ │ Footer (paper bg + border)           ││
│ └──────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Regras:**
- Frame externo: `padding: 8px` + `gap: 8px` entre filhos
- Cada card: `background: var(--paper)`, `border: 1px solid var(--border-soft)`, `border-radius: 4px`
- O `--bg` escuro mostra **através** dos gaps — não há separadores internos
- Modais "large" reutilizam exatamente esse pattern: o body do modal é `--bg`, com cards paper dentro

### Transições
- Padrão: `0.15s` (hover, focus)
- Modais e dropdowns: `0.2s` (slideUp/fadeIn)
- Animações de abertura: `cubic-bezier` natural ou `ease-out`
- Cross-fade entre tabs no mesmo modal: `0.18s` ease-out (fade + slide 4px)

---

## 6. Componentes principais — anatomia rápida

### Botão primário
```css
background: var(--brass-deep);    /* tan/cream */
color: var(--paper);              /* fundo escuro como texto contrastante */
padding: 10px 20px;
font: 500 13px var(--mono);
letter-spacing: 0.03em;
border-radius: 4px;
/* hover: background --brass-bright */
```

### Botão secundário
```css
background: transparent;
border: 1px solid var(--border);
color: var(--ink-soft);
padding: 8px 16px;
font: 500 12px var(--mono);
border-radius: 4px;
/* hover: border --brass, color --brass-deep, background --surface-hover */
```

### Botão de perigo (modifier de `.btn-secondary`)
```css
border-color: var(--accent);
color: var(--accent);
/* hover: background --accent, color --paper */
```

### Card
```css
background: var(--surface);
border: 1px solid var(--border-soft);
border-radius: 6px;
padding: 22px 24px;
/* hover: border --brass-light, shadow-md */
```

### Linha de stat (com destaque de valor)
```css
.stat-line {
  display: grid;
  grid-template-columns: 1fr auto;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-soft);
}
.stat-line-name { color: var(--ink-soft); }       /* ou mod color (fogo, gelo, etc) */
.stat-line-value { color: var(--brass-deep); }    /* SEMPRE em latão */
```

### Input
```css
background: var(--surface);
border: 1px solid var(--border-soft);
padding: 11px 14px;
font: 15px var(--mono);
color: var(--ink);
border-radius: 4px;
/* focus: border --brass, background --surface-hover */
```

### Modal
Frame escuro com header / body / footer como **cards paper independentes** separados por gap (mesmo pattern da HUD).

- **Overlay**: `rgba(0, 0, 0, 0.7)` + `backdrop-filter: blur(3px)`
- **Frame** (`.modal`): `background: var(--bg)` (não mais paper!), `border: 1px solid var(--border)`, `border-radius: 4px`, `padding: 8px`, `gap: 8px`
- **Header**, **Footer**: cards próprios com `background: var(--paper)`, `border: 1px solid var(--border-soft)`, `border-radius: 4px`, `padding: 14px 24px`
- **Body**: transparente — não tem padding próprio. Conteúdo de dentro deve ser cards (paper) ou ter wrapper que se torne card
- **Variants**:
  - default: `max-width: 640px`, `max-height: 80vh`
  - `.large`: full screen (`width: 100%; height: 100%`) — usado pra Personagem, Talentos, Mapa, Diário
- **Animação**: `slideUp 0.2s` (translateY 12px → 0) só em mount inicial. Cross-fade entre tabs no mesmo `<Modal>` mantido (key={tabId} no body)

### Tooltip
Padrão: renderizado em **portal** pra `document.body`, posicionamento via `position: fixed` calculado a partir do `getBoundingClientRect()` do elemento alvo.

```tsx
const r = ref.current.getBoundingClientRect();
const TT_WIDTH = 308;  // max-width do tooltip + padding
let left = r.right + 12;
if (left + TT_WIDTH > window.innerWidth - 8) left = r.left - 12 - TT_WIDTH;
if (left < 8) left = 8;
let top = r.top;
if (top + TT_HEIGHT > window.innerHeight - 8) top = window.innerHeight - TT_HEIGHT - 8;
```

- **Animação**: `tooltipIn 0.15s ease-out` (fade + slide sutil)
- **Pointer-events**: `none` — tooltip nunca bloqueia hover do conteúdo abaixo
- **z-index**: 1000 (sobre tudo, inclusive overlay de modal)
- **Smart placement**: flipa lateral se sair pela direita, sobe se sair embaixo, encosta na borda como fallback
- **Estrutura interna**: header com nome (serif brass), descrição (italic Fraunces ou mono), seções separadas por `border-top: 1px solid var(--border-soft)` em `padding-top: 8-10px`

### Empty state
- Centralizado (`text-align: center`)
- `padding: 80px 20px` no normal, `padding: 0` quando em modo "tela cheia"
- H3 em serif 24px, parágrafo em serif italic 17px
- Botões em linha (flex-wrap), gap 14px

---

## 7. Iconografia

Usa caracteres unicode em vez de SVG/font icons — mantém leveza e o estilo "tipográfico":

| Caractere | Uso                                |
|-----------|------------------------------------|
| `＋`      | Adicionar (fullwidth, dá peso)     |
| `↑`       | Importar / mover pra cima          |
| `↓`       | Exportar / mover pra baixo         |
| `×`       | Fechar modal                       |
| `▼`       | Indicador de dropdown              |
| `✓`       | Item selecionado em dropdown       |
| `−`       | Decremento (number input)          |
| `+`       | Incremento (number input)          |
| `↳`       | Indicação "dentro de" (ex: NPC em local) |
| `•`       | Separador inline (subtítulo)       |
| `→` `←`   | Navegação (voltar, seleção ativa)  |
| `✦` `✧`   | Selos decorativos, ornamentos      |

---

## 8. Anti-patterns (regras do que **não** fazer)

### Bordas esquerdas coloridas como indicador de tipo/categoria/raridade

**Não fazer:**
```css
.questCard.principal { border-left: 3px solid var(--brass-bright); }
.questCard.bounty    { border-left: 3px solid var(--vital-vida); }
```

**Por que:** quebra a uniformidade visual da grade de cards e gera ruído lateral que compete com o conteúdo. Visualmente "berra" sem necessidade.

**O que fazer no lugar:**
- **Cor do label/tag** (mono uppercase, ex: `PRINCIPAL` em brass-bright)
- **Cor da fonte do título** ou nome do item (ex: nome de item em rarity-magico)
- **Estados de borda inteira** pra hover/selected/locked (toda a borda muda, não só um lado)
- **Background sutil** quando precisar destacar grupos
- **Tipografia** (peso, tamanho, italic) pra hierarquia

Bordas devem ficar **uniformes** — todos os 4 lados na mesma cor neutra (`--border` / `--border-soft`). Trocar a borda **inteira** em estados (hover, selected, locked) é OK; pintar só um lado pra "tagging" é ruído.

### Cores semânticas em UI geral

`--vital-vida`, `--vital-mana`, `--elem-fogo`, etc. **só** aparecem em barras, labels e mods semânticos. **Não** usar em botões, bordas decorativas, ícones de UI. UI geral fica em latão/folha/acento.

### Vermelho fora do contexto destrutivo/vida

`--accent` e `--accent-deep` (vermelhos vivos) **só** em ações destrutivas (deletar, falhar, descartar) ou alertas. `--vital-vida` é exceção (terracota mais sóbrio) só pra contexto de Vida do personagem.

### Narrativas dramáticas em UI

Ver seção 2 — "Tom de voz". UI fala direto. Drama vai em conteúdo (descrição de item, diálogo de NPC, lore).

---

## 9. Tudo num bloco — copiar e colar

```css
:root {
  /* Fundos — noite cinza-azulada */
  --bg: #0c0e12;
  --paper: #131620;
  --surface: #1a1e2a;
  --surface-hover: #232838;
  --surface-deep: #2a3045;

  /* Latão — UI primária + destaque de valores */
  --brass-light: #5a5040;
  --brass: #7a7060;
  --brass-deep: #bcb09a;
  --brass-bright: #c2a878;

  /* Folha (texto) */
  --ink: #d8dce2;
  --ink-soft: #b0b6c0;
  --ink-muted: #8b96a3;
  --ink-faint: #545d6e;

  /* Acento (destrutivo) */
  --accent: #c45a4d;
  --accent-deep: #9a3e34;

  /* Vitais */
  --vital-vida: #b85450;
  --vital-mana: #5a8aa8;
  --vital-exp: #8a6f3e;

  /* Tipos de Dano — alinhados com Grim Dawn Rainbow Filter */
  --elem-fisico: #F0E68C;
  --elem-fogo: #C09060;
  --elem-gelo: #4DD9D9;
  --elem-raio: #6495ED;
  --elem-caos: #B57EDC;

  /* Categorias de Mods — atributos em RGB clássico */
  --stat-forca: #E04848;
  --stat-agilidade: #22C55E;
  --stat-intelecto: #3B82F6;
  --stat-defesa: #9aa6b4;
  --stat-critico: #4F5934;

  /* Raridade de itens — convenção ARPG (reusa famílias dos elementos) */
  --rarity-comum:    #b0b6c0;  /* mesmo do --ink-soft */
  --rarity-magico:   #6495ED;  /* família do Raio */
  --rarity-raro:     #F0E68C;  /* família do Físico */
  --rarity-unico:    #C09060;  /* família do Fogo */
  --rarity-lendario: #B57EDC;  /* família do Caos */

  /* Bordas */
  --border: #2a3045;
  --border-soft: #1d2230;
  --border-faint: #14181f;

  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.45);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.55);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.7);

  /* Tipografia */
  --serif: 'Fraunces', Georgia, serif;
  --mono: 'JetBrains Mono', 'Courier New', monospace;
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--mono);
  font-size: 15px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

::selection { background: var(--brass); color: var(--paper); }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--brass); }
```

---

## 10. Variantes / temas (ideias)

A paleta é construída em três famílias paralelas (fundo / latão / folha), então trocar uma família por vez funciona bem.

- **Tema "dia"** (claro, retorno ao pergaminho) → trocar `--bg`/`--paper` por tons de pergaminho (`#e8dcbe`, `#f3e9cc`), `--ink` vira escuro (`#2a1c0f`), `--brass-deep` vira marrom-escuro (`#5a3a1a`). Mantém a estrutura, vira um livro à luz do dia.
- **Tema "noite saturada"** (versão anterior, navy + dourado vibrante) → `--bg` em `#050810` mais escuro com tom navy, `--brass-deep` em `#d4b378` (dourado). Mais "fantasy mágico" e menos "ARPG sóbrio".
- **Tema "carvão puro"** → trocar a família "noite" por cinzas neutros (`#0f0f10`, `#1a1a1c`, `#262628`), mantendo `--brass` quente como acento. Fica mais industrial.
- **Tema "esmeralda"** → trocar fundos por verde-musgo profundo (`#0d1f15`, `#152d20`), `--brass` continua dourado. Floresta antiga × ouro envelhecido.
- **Tema "vinho"** → fundos em borgonha-quase-preto (`#1a0a0e`, `#241218`), `--brass` continua dourado, `--accent` muda pra vermelho mais frio. Atmosfera de adega/ritual.

> **Regra geral pra criar variantes:** mude UMA família de cada vez (fundos OU latão OU folha) mantendo as outras. Trocar tudo de uma vez quebra a coerência da paleta e dá impressão de "outro produto".
