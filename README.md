# Underdarkness

> RPG planilhado, sóbrio e text-only. Ficha de personagem como protagonista, sem ícones, com tom de códice à luz fria.

**Stack:** React 18 + Vite 5 + TypeScript (strict) + CSS Modules. Sem libs de UI — só CSS variables e o design system documentado.

**Status:** mockup funcional avançado. Sistemas implementados:
- Criação e seleção de personagem (3 classes: Guerreiro, Ladino, Mago)
- HUD principal com vitais, equipamento, ações rápidas
- **Personagem** (C): ficha completa de stats + inventário (paper-doll + grid 6×6) + drag-and-drop + raridade de itens + tooltips
- **Talentos** (T): árvore estilo Diablo 2 com tabs por arquétipo, prereqs, capstones, tooltip com efeito por rank
- **Mapa** (M): atlas estilo PoE 2 com nodes circulares conectados por curvas Bézier, click-to-travel
- **Diário** (J): missões com 6 tipos (Principal/Secundária/Caçada/Classe/Evento/Facção), 3 estados (ativa/concluída/falhada), objetivos, recompensas, log narrativo
- Persistência em `localStorage` com migrações automáticas

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173/`.

## Atalhos de teclado (na HUD)

| Tecla | Tab |
|---|---|
| `C` | Personagem (ficha + inventário) |
| `T` | Talentos (árvore) |
| `A` | Habilidades (em desenvolvimento) |
| `M` | Mapa (Atlas) |
| `J` | Diário (Missões) |
| `ESC` | Opções (trocar personagem, configurações) |

A mesma tecla abre e fecha o modal — toggle.

## Estrutura

```
src/
├── main.tsx              # entry point
├── App.tsx               # roteamento (list / create / hud)
├── types.ts              # tipos TypeScript (Character, Item, Quest, etc.)
├── styles/
│   ├── tokens.css        # design tokens (CSS variables)
│   ├── global.css        # html/body, reset, scrollbar
│   └── buttons.css       # btn-primary, btn-secondary, danger
├── data/                 # mock data + helpers de domínio
│   ├── classes.ts
│   ├── items.ts
│   ├── talents.ts
│   ├── quests.ts
│   └── world.ts
├── lib/
│   ├── storage.ts        # localStorage + migrações
│   └── stats.ts          # computeDerivedStats
├── hooks/
│   ├── useCharacters.ts  # CRUD de personagens
│   └── useRealTime.ts
├── components/           # blocos reutilizáveis (cada um com .module.css)
│   ├── Modal/
│   ├── CharacterSheet/
│   ├── Inventory/
│   ├── ItemTooltip/
│   ├── StatLine/
│   ├── VitalBar/
│   ├── TalentsView/
│   ├── MapView/
│   ├── JournalView/
│   ├── ClassSidebarItem/
│   ├── CharacterSidebarItem/
│   ├── ClassDetailPanel/
│   └── CharacterDetailPanel/
└── views/                # telas top-level
    ├── CharacterSelect/
    ├── CharacterCreate/
    └── GameHud/
```

Cada componente e view tem seu próprio `.module.css` (CSS Modules, escopo local). Tokens vivem em `tokens.css` e são acessados via `var(--brass-deep)` etc.

## Build

```bash
npm run build
```

Versão otimizada em `dist/`.

## Documentação

- **[`design-system.md`](./design-system.md)** — sistema visual completo: cores, tipografia, padrões de layout, anti-patterns
- **[`AGENTS.md`](./AGENTS.md)** — contexto pra agentes de IA continuarem o desenvolvimento sem refazer descobertas

## Estado do projeto

Mockup denso que estabelece linguagem visual, padrões de componente e arquitetura de dados. As mecânicas de jogo (combate, eventos, dano real) ainda não estão implementadas — descrições de stats, mods de itens e talents são puramente apresentadas mas não afetam cálculos. Próxima grande fase é wirar as derivações reais (item bonuses → derived stats, talent ranks → bonuses).
