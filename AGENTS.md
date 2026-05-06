# AGENTS.md — Underdarkness

> Documento de contexto pra agentes de IA continuarem o desenvolvimento sem refazer descobertas. Lê este arquivo antes de qualquer trabalho substancial no projeto. Complementa (não substitui) o `design-system.md`.

---

## 1. Visão e tom

**Underdarkness** é um RPG **planilhado** (sheet-based) com inspiração em ARPGs sóbrios estilo Path of Exile / Grim Dawn / Diablo 2, mas **sem ícones nem ilustrações** — toda a comunicação visual é **tipográfica**. A ficha de personagem é a estrela do show, não um adendo.

**Tom:**
- UI direta e neutra: "Criar Personagem", não "Forjar Herói"
- Narrativa só vive em conteúdo (descrições de itens, diálogos com NPCs, log de quests)
- Nenhum emoji em código ou UI a menos que pedido explicitamente
- Português brasileiro moderno: imperativos diretos ("Escolha", "Confirme"), nunca arcaísmos ("escolhe", "diz")

**Gosto declarado do usuário:**
- Aprecia densidade de informação bem organizada
- Detesta ruído visual (ver Anti-patterns abaixo)
- Curte detalhes sutis (animações 150-200ms, tipografia variable opsz, cor de label diferente de cor de valor)
- Itera por feedback contínuo — geralmente quer ver algo funcionar e ajustar do que receber proposta longa antes

---

## 2. Stack técnico

- **React 18** + **Vite 5** + **TypeScript strict mode**
- **CSS Modules** (`.module.css` ao lado do `.tsx`)
- **localStorage** pra persistência (sem backend)
- **Sem libs externas de UI** — só `react`, `react-dom`. Se precisar de algo (drag, animação), prefira HTML5 nativo
- Build via `vite build`, dev via `vite dev` (porta padrão 5173)
- TypeScript: `noUnusedLocals: true`, `noUnusedParameters: true`, `strict: true`. CSS Modules geram type errors no `tsc --noEmit` por falta de declaração — esses erros são **preexistentes e ignoráveis**; só se preocupe com erros não-CSS-module

---

## 3. Arquitetura de dados

### Tipos centrais (`src/types.ts`)

**Character** — agregado raiz, persistido em localStorage:
```ts
interface Character {
  id, name, classKey, classLabel, classTagline, level, xp, xpNext,
  vidaMax, vidaAtual, manaMax, manaAtual,
  forca, agilidade, intelecto,
  abilities, equipped, inventory, talentRanks, visitedLocations,
  gold, time, day, period, location, // todos string
  createdAt, updatedAt?
}
```

- `equipped: Record<EquipSlot, Item | null>` — 9 posições (cabeça, peito, mãos, pés, amuleto, anel1, anel2, arma, escudo)
- `inventory: (Item | null)[]` — array de tamanho fixo (`INVENTORY_SIZE = 36`, grid 6×6)
- `talentRanks: Record<string, number>` — talent.id → rank atual
- `visitedLocations: string[]` — IDs do Atlas que o jogador descobriu
- `location: string` — ID do local atual (slug, ex: `'origem'`)

### Item (`Item`)
```ts
interface Item {
  id, name, slot: ItemSlot | null, rarity: 'comum' | 'magico' | 'raro' | 'unico' | 'lendario',
  stats?: ItemStat[],     // mods exibidos no tooltip
  description?: string,    // flavor italic
  stackable?: boolean,     // poções, materiais
  stack?: number,          // quantidade no stack
}
```

**ItemSlot vs EquipSlot:** `ItemSlot` é a categoria do item (`'anel'` único), `EquipSlot` é a posição no boneco (`'anel1'`, `'anel2'`). Helper `itemFitsInSlot(itemSlot, equipSlot)` resolve compatibilidade — anel cabe em anel1 OU anel2.

### Talent (`Talent`)
```ts
interface Talent {
  id, name, description, row, col, maxRank, prerequisites?: string[],
  effect?: { perRank, label, unit?, color?, signed? }
}
```

`effect` é opcional — talents com efeito linear preenchem; talents binários (Whirlwind, Sentinela) só têm `description` rica.

### Quest (`Quest`)
```ts
interface Quest {
  id, title,
  type: 'principal' | 'side' | 'bounty' | 'classe' | 'evento' | 'faccao',
  status: 'ativa' | 'concluida' | 'falhada',
  chapter?, giver?, locationId?,
  description, story,        // duas camadas: pitch + narrativa
  objectives: { text, current?, total?, completed }[],
  rewards: { type, label, detail? }[],
  journal: { date, text }[], // log narrativo cronológico
  expiresIn?,                // pra bounties
}
```

### MapLocation (`MapLocation`)
```ts
interface MapLocation {
  id, name, description, region, level,
  x, y,                  // pixels num design space ~1180×680
  connections: string[], // ids de outros nodes (bidirecional)
  type?: 'town' | 'wilderness' | 'dungeon' | 'boss',
}
```

Conexões são **declaradas no nível mais baixo** (ex: floresta-densa declara `['origem']`, não o contrário). O dedup no render usa `Set` com chave canônica `[a, b].sort().join('|')`.

---

## 4. Persistência e migrações

`src/lib/storage.ts` tem `loadCharacters` e `saveCharacters`. **Toda alteração de schema** passa por uma função `migrate(c)` que roda em todo load.

**Padrão de migração:**
```ts
function migrate(c: Character): Character {
  return {
    ...c,
    novoCampo: c.novoCampo ?? defaultValue,
  };
}
```

Migrações já implementadas:
- `equipped.anel` (slot único antigo) → `equipped.anel1` (slot novo)
- `inventory` redimensionado pra `INVENTORY_SIZE` (foi 24 → 36)
- `equipped`, `inventory`, `talentRanks`, `visitedLocations` adicionados com defaults vazios
- Item legado sem `rarity` ganha `rarity: 'comum'`

**Quando adicionar novos campos** ao Character: adicione defaults na `migrate()` em `storage.ts` E no `CharacterCreate.tsx` (criação de personagem novo).

---

## 5. Padrões arquitetônicos importantes

### Modal único compartilhado (cross-fade entre tabs)

`GameHud.tsx` mantém **um único `<Modal large>`** ativo enquanto qualquer tab "grande" estiver ativa (Personagem, Talentos, Mapa, Diário). React reconcilia o header e o body conforme `activeTab` muda — overlay e frame **não remontam**, só o conteúdo (com `key={activeTab}` pra disparar fade-in `tabFadeIn 0.18s`).

Isso evita o flash feio de fechar/abrir entre tabs grandes. Tabs pequenas (Opções, stub) ainda têm modal próprio.

```tsx
{(activeTab === 'personagem' || activeTab === 'talentos' || ...) && (
  <Modal large header={...condicional...}>
    <div key={activeTab} className={styles.tabBody}>
      {/* conteúdo condicional */}
    </div>
  </Modal>
)}
```

### Tooltips em portal

Todos os tooltips ricos (StatLine, ItemTooltip, MapView, TalentsView) usam o **mesmo padrão**:

1. `useRef<HTMLElement>` no elemento alvo
2. `onMouseEnter` lê `getBoundingClientRect()` e seta `tooltipPos: { left, top }`
3. Tooltip é renderizado via `createPortal` pra `document.body` com `position: fixed`
4. **Smart placement** verifica overflow no viewport e flipa lateral / vertical / encosta na borda
5. `pointer-events: none` no tooltip — nunca bloqueia hover do conteúdo abaixo
6. `z-index: 1000` (sobre tudo, inclusive overlay de modal)

Ver implementação canônica em `MapView.tsx` (com smart placement) e `StatLine.tsx` (mais antigo, sem flip).

### Layout HUD/Modal: cards independentes com gap

A HUD principal e o frame do Modal usam o **mesmo pattern**:
- Container externo: `padding: 8px`, `gap: 8px`, `background: var(--bg)`
- Cada bloco interno (header, sidebar, body, footer): `background: var(--paper)`, `border: 1px solid var(--border-soft)`, `border-radius: 4px`
- O `--bg` escuro mostra **através** dos gaps — sem separadores

Cards de **conteúdo** internos (CharacterSheet, Inventory, etc.) usam `border-radius: 6px` (slightly maior — distingue "card de sub-conteúdo" de "card de frame").

### Conexões SVG entre nodes (Talent Tree, Atlas)

Usado em `TalentsView` e `MapView`:
- SVG overlay absoluto sobre o grid (`pointer-events: none`)
- Linhas com `vectorEffect="non-scaling-stroke"` (espessura constante mesmo escalando)
- Edge clipping geométrico pra linha não passar por dentro do node (ver `edgePoint` em `TalentsView.tsx`)
- `<path>` com Bézier no Atlas (ver `curvedPath` em `MapView.tsx`) — quadratic com offset perpendicular determinístico via hash do seed

### Drag-and-drop nativo (Inventory)

HTML5 nativo, sem libs. Estado:
- `dragSource: { kind: 'inventory'|'equipped', index|slot }` durante drag
- `dropTarget: string` (id do slot sob hover válido)
- Helper `canSwap(source, target)` verifica bidirecionalidade (item da origem cabe no destino + item do destino cabe na origem)
- Feedback visual: `compatible` (dashed brass) vs `incompatible` (dashed terracota — mais sutil, sem chamar atenção)

---

## 6. Anti-patterns (regras absolutas — não quebre)

### NUNCA usar border-left colorida pra indicar tipo/categoria/raridade

O usuário **rejeitou esse pattern múltiplas vezes**. Ver memória persistente em `~/.auto-memory/feedback_no_colored_left_borders.md`.

**Não fazer:**
```css
.questCard.bounty { border-left: 3px solid var(--vital-vida); }
```

**Fazer:**
- Cor da fonte do **label/tag** (mono uppercase, ex: `BOUNTY` em terracota)
- Cor da fonte do **título** ou nome do item (ex: nome em rarity-magico azul)
- Cor da **borda inteira** mudando em estados (hover, selected) — borda completa, não um lado

### NUNCA usar cores semânticas em UI geral

Tokens `--vital-vida`, `--vital-mana`, `--elem-fogo`, etc. **só** em contextos semânticos (barras, labels de mod, tags de tipo de quest). Botões, bordas decorativas, ícones de UI ficam em latão/folha/acento.

### NUNCA usar `--accent` (vermelho vivo) fora de contexto destrutivo

`--accent: #c45a4d` e `--accent-deep` só em ações irreversíveis (deletar, descartar). Pra "incompatível" / "alerta" use `--vital-vida` (terracota mais sóbrio).

### NUNCA escrever UI em tom de RPG dramático

Erros, confirmações, modais, prompts: tudo direto e funcional. Drama vai em conteúdo (descrição de item, log de quest, story de NPC). UI é esqueleto — só sustenta.

### NUNCA criar `*.md` (READMEs, docs) sem pedido explícito

Política comum em projetos. Se for criar documentação, confirme antes.

---

## 7. Convenções de tipografia e cor (mapeamento rápido)

**Texto neutro:** `--ink` (forte), `--ink-soft` (médio), `--ink-muted` (apoio), `--ink-faint` (placeholder).

**Valores numéricos:** **sempre** em `--brass-deep` (mono 12-16px peso 500). Labels acompanhantes em `--ink-soft` ou cor de categoria. Ver "Linha de stat" no design-system.

**Atributos primários (RGB clássico):** Força = vermelho `--stat-forca`, Agilidade = verde `--stat-agilidade`, Intelecto = azul `--stat-intelecto`. Stats que **derivam** herdam a cor (ex: Velocidade de Ataque é verde porque deriva de Agilidade).

**Tipos de dano (Grim Dawn Rainbow Filter):** Físico khaki, Fogo tussock, Gelo cyan, Raio cornflower, Caos lavanda. Ver `design-system.md` § 3.

**Raridade de item:** Comum cinza, Mágico azul, Raro khaki, Único laranja, Lendário lavanda. **Aplicada na cor do nome**, nunca em borda.

**Tipos de quest (6 tipos):** Principal dourado, Secundária cinza, Caçada terracota, Classe azul, Evento verde, Facção lavanda. **Aplicada na cor do tag** (`PRINCIPAL`, `EVENTO` em mono uppercase 10px).

**Fontes:** Fraunces (serif, com variable opsz) pra títulos e narrativa flavor. JetBrains Mono pra UI, valores, labels e body de RPG-de-mesa-feel.

---

## 8. Componentes — onde estão e o que fazem

| Componente | Onde está | Função |
|---|---|---|
| `Modal` | `components/Modal/` | Wrapper genérico (overlay + frame), variantes `large` / default |
| `StatLine` | `components/StatLine/` | Linha de stat com nome, valor, color por categoria, tooltip rico (Mod, TooltipLine, TooltipMeta) |
| `VitalBar` | `components/VitalBar/` | Barra Vida/Mana/Exp com label e valores |
| `CharacterSheet` | `components/CharacterSheet/` | Ficha completa em 3 colunas (Recursos, Ofensivo, Defensivo) |
| `Inventory` | `components/Inventory/` | Equipado (paper-doll 3×3) + Inventário (6×6 grid), drag-and-drop, click-to-equip, right-click discard |
| `ItemTooltip` | `components/ItemTooltip/` | Tooltip de item (nome em cor de raridade, stats, descrição flavor) |
| `TalentsView` | `components/TalentsView/` | Árvore de talentos com tabs por tree, grid 5×4 staggered, linhas SVG conectoras |
| `MapView` | `components/MapView/` | Atlas estilo PoE 2 com nodes circulares e curvas Bézier conectoras |
| `JournalView` | `components/JournalView/` | Diário de missões com tabs por status, lista + detail pane |
| Sidebar items | `components/Class/CharacterSidebarItem/` | Itens da sidebar de criação/seleção |
| Detail panels | `components/Class/CharacterDetailPanel/` | Painéis de detalhe na criação/seleção |

**Views top-level** (`src/views/`):
- `CharacterSelect/` — tela inicial se já há personagens
- `CharacterCreate/` — formulário de criação
- `GameHud/` — HUD principal do jogo (topbar + 3 painéis + footer + modais)

---

## 9. Sistema atual: o que é mock vs o que é "real"

**Real (funciona end-to-end):**
- Criação/seleção/deleção de personagem
- Persistência em localStorage com migrações
- Drag-and-drop no inventário (com swap, merge de stacks)
- Click-to-equip / right-click-discard
- Investir pontos de talent (incrementa rank, salva)
- Travel no mapa (atualiza `location` e adiciona a `visitedLocations`)
- Tabs e atalhos de teclado (C/T/A/M/J/ESC)
- Cross-fade entre tabs no modal large

**Mock (visual mas sem efeito real):**
- **Item stats não somam** em `computeDerivedStats` — são puramente exibidos no tooltip. Equipar/desequipar não muda os números da ficha.
- **Talent ranks não aplicam** efeitos no character. Investir num talent não dá +5% Dano Físico de fato — só visualmente o talent fica "ativo".
- **Combate, eventos, dano real** — nada implementado. A ficha não simula nada.
- **Quests** são estáticas: progresso é hardcoded nos mocks, não há sistema de eventos pra completar objetivos.
- **Habilidades** (tab A) é stub "em desenvolvimento" — placeholder pra futuras magias/abilities ativas.
- **Diário, mapa, talentos** consomem dados mockados em `data/*.ts` — não há geração procedural nem progressão temporal.

**Gap importante a fechar (próxima fase natural):**
Wirar `Item.stats` → `computeDerivedStats` (item bonuses afetam stats reais) e `talentRanks` → `computeDerivedStats` (talents afetam stats reais). Isso requer **estruturar `ItemStat.bonus` e `Talent.effect` de forma que mapeiem pra campos do `DerivedStats`** — hoje só têm `text` (string display) e `effect: { perRank, label, ... }` (display também).

---

## 10. Convenções de naming e estilo

- **Idioma**: tudo em **português brasileiro** (UI, comentários de código, nomes de talents/quests/items). Variáveis em inglês (`level`, `inventory`) por convenção JS, mas valores e labels em português.
- **Comentários**: explicam o **porquê**, não o **o quê**. Reservados pra padrões não-óbvios ou armadilhas.
- **CSS Modules**: nomes em camelCase (`mergedPanel`, `nodeWrapper`)
- **Helpers**: prefixo `get*` pra leitura, `make*` ou `create*` pra factory, sem prefixo pra utilities curtos
- **TypeScript**: tipos exportados em `types.ts`, dados em `data/`, lógica pura em `lib/`. Componentes nunca exportam tipos da API pública (componente consome — não define).

---

## 11. Como trabalhar nesse projeto (workflow recomendado)

1. **Antes de mudar comportamento existente**, leia o `design-system.md` e este `AGENTS.md`. A maioria das decisões já foi pensada.
2. **Antes de adicionar componente novo**, veja se algum padrão existente cobre (Modal, StatLine, ItemTooltip são muito reusáveis).
3. **Adicione a tipo em `types.ts` antes do dado** em `data/*.ts` (TypeScript guia a estrutura).
4. **Persistência**: se mexer no `Character`, adicione default na `migrate()` em `storage.ts` E em `CharacterCreate.tsx`.
5. **Animação**: 0.15s pra hover/focus, 0.18s pra cross-fade entre tabs, 0.2s pra abertura de modal. Não invente outros valores sem motivo.
6. **Antes de adicionar `border-left` colorido**: pare. Use cor de label/tag em vez disso.
7. **Confirme com o usuário antes de mudanças grandes** — ele prefere iteração incremental sobre planejamento longo.
8. **Rodar `npx tsc --noEmit`** pra checar que não há erros de tipo (ignore os de `*.module.css`, são preexistentes).

---

## 12. Próximas frentes lógicas (sugestões)

Em ordem decrescente de impacto:

1. **Wirar item stats e talent effects em `computeDerivedStats`** — passa de "mock visual" pra "build matters". Maior pulo de imersão.
2. **Habilidades ativas** (tab A) — sistema de skills com cooldown, custo de mana, dano calculado. Ponto de saída pra combate.
3. **Sistema de combate por turnos** — usa derived stats reais. Encontros aleatórios em locais visitados.
4. **Eventos no Atlas** — viajar pra Floresta Densa pode disparar evento "Lobos atacam!" que vira combate / escolha.
5. **Loot procedural** — drops de itens com mods aleatórios baseados em raridade.
6. **Reputação como sistema** — mostrada num widget / aba própria com facções (Guarda Real, Caçadores, Veteranos do Corvo Cinza, Eruditos, etc.). Quests modificam reputação, reputação destrava conteúdo.
7. **Multi-slot items** (armas 2H ocupando 2 slots do inventário) — antes deferido. Requer rewrite parcial do grid.
8. **Save slots múltiplos / cloud sync** — hoje é localStorage único.

---

## 13. Onde achar o quê

| Pergunta | Onde |
|---|---|
| "Como adiciono um talent novo?" | `data/talents.ts` (helper `t({...})`), tree relevante |
| "Como mudo o tom de uma cor?" | `src/styles/tokens.css` (atualiza apenas o token, propaga pelo CSS Modules) |
| "Onde está o cálculo de stat X?" | `src/lib/stats.ts` (`computeDerivedStats`) |
| "Como adiciono um modal de tab nova?" | `views/GameHud/GameHud.tsx`, branch grande dos modais. Lembre de adicionar entrada em `KEY_TO_TAB`, `TAB_ORDER`, `TAB_LABEL/SHORTCUT/DESC` em `data/classes.ts` |
| "Como persistir um campo novo?" | tipo em `types.ts` → default em `CharacterCreate.tsx` → migração em `storage.ts` |
| "Padrão visual de X?" | `design-system.md` primeiro, depois examina componente similar existente |

---

Bom desenvolvimento. Se algo aqui ficou desatualizado, atualize. Esse documento é vivo.
