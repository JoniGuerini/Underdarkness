# Underdarkness

RPG planilhado em React + Vite + TypeScript.

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173/`.

## Estrutura

```
src/
├── main.tsx              # entry point
├── App.tsx               # roteamento entre views (list/create/hud)
├── types.ts              # tipos TypeScript (Character, ClassData, etc)
├── styles/
│   ├── tokens.css        # design tokens (CSS variables)
│   ├── global.css        # html/body, scrollbar
│   └── buttons.css       # btn-primary, btn-secondary, danger
├── data/classes.ts       # dados das 3 classes + tabs
├── lib/
│   ├── storage.ts        # localStorage helpers
│   └── stats.ts          # computeDerivedStats
├── hooks/useCharacters.ts # estado de personagens + save/load/delete
├── components/
│   ├── Modal/            # modal base reusável
│   ├── CharacterSheet/   # ficha completa (3 colunas)
│   ├── VitalBar/         # barra Vida/Mana/Exp
│   ├── StatLine/         # linha de stat com cor por categoria
│   ├── ClassCard/        # card de classe na criação
│   └── CharacterCard/    # card de personagem na seleção
└── views/
    ├── CharacterSelect/  # tela de seleção
    ├── CharacterCreate/  # tela de criação
    └── GameHud/          # HUD principal do jogo
```

Cada componente e view tem seu próprio `.module.css` (CSS Modules — escopo local). Os tokens vivem em `tokens.css` e são acessados via `var(--brass-deep)` etc em todos os módulos.

## Build

```bash
npm run build
```

Gera versão otimizada em `dist/`.
