# AGENTS.md — Underdarkness (Documento Mestre Técnico & Handoff)

> **Fonte única de verdade técnica** do projeto. Leia antes de qualquer trabalho substancial. Cobre visão, stack, arquitetura, todas as fórmulas de stats, o estado de validação de cada atributo/mod, anti-patterns e roadmap.
>
> **Complementa (não substitui)** o `design-system.md` — esse documento é o *técnico/geral*; o `design-system.md` é o *visual* (cores, tipografia, layout em detalhe).
>
> **Idioma:** Português brasileiro em TODA a UI, dados, comentários e flavor. Inglês só em símbolos de código (funções, tipos, variáveis).
>
> **Documento vivo:** cada decisão de stat, sistema novo ou mudança de fórmula deve ser refletida aqui.

---

## 1. Visão Geral / Pitch

**Underdarkness** é um RPG single-player baseado em fichas, com estética **"manuscrito-digital"** — um caderno/grimório sóbrio renderizado em tela. ARPG de inspiração **Path of Exile** (afixos, raridades, itemização profunda) e **Grim Dawn** (paleta de tipos de dano), apresentado como **ficha de personagem** em vez de mundo isométrico.

### Pilares de design
1. **Tipografia, não ícones.** A interface inteira é texto. Sem sprites, ícones ou glifos decorativos. Hierarquia vem de fonte, peso, cor e espaçamento. (Retratos de NPC podem usar imagem, mas foram revertidos — ver § 16.)
2. **Itemização real.** Equipamento afeta a ficha via dados estruturados (`ItemStatEffect`), nunca por parsing de texto. Todo número na ficha é derivado e rastreável.
3. **Transparência total (PoE-style).** Todo stat derivado mostra um **breakdown de fontes** no tooltip — de onde cada ponto vem (classe, atributo, item), com cor por origem.
4. **Sobriedade.** Dark mode profundo, paleta latão/folha/noite, sombras em camadas. Nada estridente.
5. **Progressão ganha.** O jogador começa fraco (desarmado 1–1) e constrói poder via loot, craft e talentos. Sem itens iniciais "de presente".

### Tom da UI
- UI direta e neutra: "Criar Personagem", não "Forjar Herói".
- Narrativa só vive em **conteúdo** (descrições de item, diálogo de NPC, log de quest). UI é esqueleto.
- Nenhum emoji em código ou UI sem pedido explícito.
- PT-BR moderno: imperativos diretos ("Escolha", "Confirme"), nunca arcaísmos.

### Gosto declarado do usuário
- Aprecia densidade de informação bem organizada; detesta ruído visual (ver Anti-patterns § 21).
- Curte detalhes sutis: animações 150–200ms, tipografia variable `opsz`, cor de label ≠ cor de valor.
- **Itera por feedback contínuo** — prefere ver algo funcionar e ajustar do que receber proposta longa antes. Confirme mudanças grandes; entregue incremental.

### Fantasia das três classes
- **Guerreiro** — tanque corpo-a-corpo, alta Força/Vida, baixa Mana.
- **Ladino** — precisão e esquiva, alta Agilidade, crítico.
- **Mago** — dano arcano, alta Mana/Intelecto, frágil no corpo-a-corpo.

---

## 2. Stack Técnico

| Camada | Tecnologia |
|---|---|
| Framework | React 18.3 |
| Build | Vite 5.4 |
| Linguagem | TypeScript 5.5 (strict, `noUnusedLocals`, `noUnusedParameters`) |
| Estilo | CSS Modules (`.module.css`) + tokens globais em `:root` |
| Estado | `useState`/`useEffect` locais + hooks custom; **sem** Redux/Zustand |
| Persistência | `localStorage` (chave `underdarkness_characters`) |
| Deploy | Vercel (SPA rewrite, Hobby plan) |
| Dependências runtime | **só** `react` + `react-dom` — zero libs de UI/estado/utilidade |

**Scripts:** `npm run dev` (porta 5173), `npm run build` (`tsc -b && vite build`), `npm run preview`.

**Plataforma de dev:** Windows 11, PowerShell primário (Bash tool disponível pra POSIX).

### Build/deploy já resolvidos
- `src/vite-env.d.ts` tem `/// <reference types="vite/client" />` — tipos ambient pra `.module.css` e assets (`.png`). Sem isso o build de produção quebra.
- CSS Modules geram type errors no `tsc --noEmit` por falta de declaração — **preexistentes e ignoráveis**; só se preocupe com erros não-CSS-module.
- Vercel: rewrite SPA (`/* → /index.html`), favicon SVG inline. 403 no preview = recriar projeto Vercel.

---

## 3. Sistema de Design (Tokens)

Tokens em `src/styles/tokens.css` (`:root`). **Nunca hardcode cores** — sempre `var(--token)`. (Detalhamento visual completo em `design-system.md`.)

```
FUNDOS:  --bg #0c0e12 · --paper #131620 · --surface #1a1e2a · --surface-hover #232838 · --surface-deep #2a3045
LATÃO:   --brass-light #5a5040 · --brass #7a7060 · --brass-deep #bcb09a · --brass-bright #c2a878
FOLHA:   --ink #d8dce2 · --ink-soft #b0b6c0 · --ink-muted #8b96a3 · --ink-faint #545d6e
ACENTO:  --accent #c45a4d · --accent-deep #9a3e34   (SÓ destrutivo)
VITAIS:  --vital-vida #d97766 · --vital-mana #5a8aa8 · --vital-exp #8a6f3e
DANO:    --elem-fisico #F0E68C · --elem-fogo #C09060 · --elem-gelo #4DD9D9 · --elem-raio #6495ED · --elem-caos #B57EDC · --elem-sagrado #EFE5C4
ATRIB:   --stat-forca #E04848 (verm) · --stat-agilidade #22C55E (verde) · --stat-intelecto #3B82F6 (azul) · --stat-defesa #9aa6b4 · --stat-critico #a3b04c
RARIDADE: --rarity-comum #b0b6c0 · --rarity-magico #6495ED · --rarity-raro #F0E68C · --rarity-unico #C09060 · --rarity-lendario #B57EDC
```

### Sombras em camadas (assinatura visual)
3 camadas: highlight branco sutil no topo + drop shadow tight + hairline sub-pixel. Tiers: `--card-edge` (repouso), `--card-edge-lg` (elevado/hover), `--card-edge-pill` (pequeno), `--card-edge-press` (pressionado), `--tooltip-edge` (tooltip, hairline latão quente).

### Tipografia
```
--serif: 'Fraunces', Georgia, serif   → títulos, nomes, flavor itálico (usa font-variation-settings: "opsz" N)
--mono:  'JetBrains Mono', monospace  → stats, valores, labels, UI funcional
```

---

## 4. Estrutura de Pastas

```
src/
  App.tsx                    # roteador de view (list | create | hud)
  main.tsx                   # bootstrap React
  types.ts                   # TODOS os tipos do domínio
  vite-env.d.ts              # ambient types (css modules, assets)
  assets/                    # imagens (retratos NPC — atualmente NÃO importados)

  styles/
    tokens.css               # design tokens (:root)
    global.css               # reset + base + scrollbar
    buttons.css              # .btn-primary / .btn-secondary / danger

  hooks/
    useCharacters.ts         # CRUD de personagens + persistência
    useSettings.ts           # settings (atalhos, fullscreen)
    useRealTime.ts           # relógio real HH:MM (placeholder p/ tempo de jogo)

  lib/
    stats.ts                 # ★ CORAÇÃO: computeDerivedStatsWithSources()
    combat.ts                # lógica de combate em tempo real (pura)
    leveling.ts              # curva de XP, applyLevelUp
    inventory.ts             # addItemToInventory etc.
    settings.ts              # tipos/helpers de settings + atalhos
    storage.ts               # load/save + migração de schema

  data/                      # conteúdo declarativo (single source of truth)
    classes.ts  talents.ts  world.ts  enemies.ts  npcs.ts  quests.ts
    items.ts  itemBases.ts  itemMods.ts  materials.ts  recipes.ts  shops.ts
    social.ts  socialLinks.ts  parties.ts          # mock multiplayer — SOCIAL:

  components/                # 1 pasta por componente (.tsx + .module.css)
  views/                     # telas full (CharacterCreate, CharacterSelect, GameHud)
```

**Convenção de dados:** `itemBases.ts` = templates de base; `itemMods.ts` = afixos; `materials.ts` = consumíveis; `shops.ts`/`recipes.ts` compõem esses átomos. Nunca duplique definições entre arquivos.

**Marcador `// SOCIAL:`** — tudo de multiplayer (mock) é marcado assim pra remoção fácil.

**Camadas:** tipos em `types.ts` → dados declarativos em `data/` → lógica pura em `lib/` → UI em `components/`/`views/`. Componentes consomem tipos, não os definem.

---

## 5. Fluxo da Aplicação

`App.tsx` mantém `view: 'list' | 'create' | 'hud'`:
- **list** → `CharacterSelect`; **create** → `CharacterCreate`; **hud** → `GameHud`.
- Sem personagens → vai pra `create`. `onUpdate` no HUD chama `saveCharacter` (persiste).

### GameHud — layout
Grid 3 linhas: **topbar** (nome/classe + barras vitais) / **central** (cena da location) / **footer** (tabs).
- **Painel esquerdo:** placeholder.
- **Painel central:** descrição da location, lista de NPCs (cards quadrados), botão "Patrulhar" se há encontros.
- **Painel direito:** **Equipamento** (10 slots reais de `EQUIP_GROUPS`, tooltip de item no hover) + **Status Ativos** (placeholder).

### Tabs (atalhos configuráveis em settings)
| Tab | Default | Conteúdo |
|---|---|---|
| Personagem | C | Inventory (paper-doll + bag) + CharacterSheet |
| Habilidades | A | árvore de habilidades (talent tree) |
| Mapa | M | Atlas (MapView) |
| Diário | J | Quests (JournalView) |
| Registro | K | mods, forja, bestiário |
| Códice | L | guia de raridade (e futuros guias) |
| Social | G | chat, guilda, amigos, grupos (mock) — SOCIAL: |
| Opções | ESC | settings |

**Modal único compartilhado:** Personagem/Habilidades/Mapa/Diário/Registro/Códice/Social/Opções compartilham UM `<Modal large>`.

---

## 6. Modelo de Dados (types.ts)

### Character (persistido)
```ts
interface Character {
  id, name, classKey, classLabel, classTagline: string;
  level, xp, xpNext: number;
  vidaMax, vidaAtual, manaMax, manaAtual: number;  // vidaMax/manaMax sincronizados do derivado na migração
  forca, agilidade, intelecto: number;             // atributos BASE (da classe)
  abilities: Ability[];
  equipped: Record<EquipSlot, Item | null>;        // 10 posições
  inventory: (Item | null)[];                      // INVENTORY_SIZE = 36
  talentRanks: Record<string, number>;             // talent.id → rank
  visitedLocations: string[];
  abandonedQuestIds: string[];
  gold, day: number;
  time, period, location, createdAt: string;
  updatedAt?: string;
}
```

### EquipSlot vs ItemSlot
- `EquipSlot` (10 posições onde veste): `cabeca, peito, maos, pes, cinto, amuleto, anel1, anel2, arma, escudo`
- `ItemSlot` (categoria do item): igual mas `anel` único (vai em anel1 OU anel2). `itemFitsInSlot(itemSlot, equipSlot)` resolve.

### StatKey (como um efeito de item entra no cálculo)
- `weapon-*` — base de arma; **substitui** default da classe (`weapon-speed`, `weapon-crit-base`)
- `flat-*` — **soma** cumulativa entre slots
- `pct-*` — soma como **percentual**

Lista: `weapon-speed, weapon-crit-base, flat-{vida,mana,armadura,evasao,regen-vida,regen-mana,acerto,forca,agilidade,intelecto,dmg-fis,dmg-fogo,dmg-gelo,dmg-raio,dmg-caos,dmg-sagrado}, pct-{res-fogo,res-gelo,res-raio,res-caos,res-sagrado,res-fisica,pen-fogo,pen-gelo,pen-raio,pen-caos,pen-sagrado,vel-ataque,red-tempo-conjuracao,crit-chance,crit-mult,eficiencia-mana,dmg-magia,dmg-{elem}-magia,roubo-vida,roubo-mana,esquiva,bloqueio}`.

### ItemStatEffect / ItemStat
```ts
interface ItemStatEffect { key: StatKey; value: number; max?: number; }  // max = range (ex: 1 a 2)
interface ItemStat { text: string; color?: ModColor; kind?: 'base'|'prefix'|'suffix'; effect?: ItemStatEffect; }
```
`ItemStat` **sem** `effect` só aparece no tooltip (não afeta a ficha). Com `effect`, vira número real.

### Outros tipos
- **Item:** `id, name, slot: ItemSlot|null, rarity, stats?, description?, stackable?, stack?`.
- **Talent:** `id, name, description, row, col, maxRank (default 5), prerequisites?, effect?`.
- **Quest:** `id, title, type (principal|side|bounty|classe|evento|faccao), status (ativa|concluida|falhada), chapter?, giver?, locationId?, description, story, objectives[], rewards[], journal[], expiresIn?`.
- **MapLocation:** `id, name, description, region, level, x, y, connections[], type? (town|wilderness|dungeon|boss)`.
- **DerivedStats:** saída de stats.ts (ver § 7).

---

## 7. ★ Sistema de Stats Derivados (lib/stats.ts) — O CORAÇÃO

`computeDerivedStatsWithSources(c): { stats, sources }`. Wrapper: `computeDerivedStats(c): DerivedStats`.

### Sistema de "sources" (breakdown PoE-style)
```ts
interface StatSource {
  label: string;       // "Espada Curta", "Força (+8% mult.)", "Classe (Mago)"
  value: number;
  max?: number;        // ranges → "+1 a 2"
  tone?: StatSourceTone;
  keepZero?: boolean;  // mantém linha mesmo se value=max=0 (ex: Força arredondada)
}
```
**Tones (cor da label):** `class` (ink), `attr-forca`/`attr-agi`/`attr-int` (cor do atributo), `item-{rarity}` (cor da raridade), `base` (ink-muted itálico).

Helper `itemSources(contribs, key)` constrói sources com `max` pra ranges e sufixo "(prefixo)"/"(sufixo)" no label. **Filtro final** remove sources com `value === 0` sem range — exceto `keepZero: true`.

### Fórmulas atuais (estado VALIDADO — ver § 9 pro status)
```
ATRIBUTOS:  forca/agi/int = base + Σ flat-{attr}

VIDA/MANA:  vidaMax = classe.vida + Σ flat-vida          (nenhum atributo)
            manaMax = classe.mana + (intelecto × 5) + Σ flat-mana

DANO FÍSICO (range):
 base = arma (flat-dmg-fis min/max) OU desarmado [2,4] (escala WoW — DPS desarmado ≈ o do antigo 1–1 rápido)
  forcaMult = 1 + forca/100   (MULTIPLICATIVO)
  danoFisico{Min,Max} = round(base{Min,Max} × forcaMult)
  → Força mostra delta absoluto no breakdown (keepZero=true)

TEMPO DE ATAQUE (WoW-style, SEGUNDOS por golpe — maior = mais lento):
 base = arma (weapon-speed, em segundos) OU desarmado (ladino 2.0s/guerreiro 2.5s/mago 3.0s)
 velAtaque = base ÷ (1 + Σpct-vel-ataque/100) — % de vel. REDUZ o tempo; Agilidade NÃO contribui
 ⚠️ o campo derivado continua chamado `velAtaque`, mas guarda SEGUNDOS

CRÍTICO:    chanceCritico = [arma OU 5% desarmado] + max(0,agi-10)×0.4 + Σpct-crit-chance (cap 100%)
            multCritico   = 1.5 + (ladino?0.2:0) + Σ(pct-crit-mult/100)
            Após conectar: rollCritical → mult no dano rolado antes da armadura

DANO ELEM (flat): flat-dmg-{elem} — dano por golpe em ataques NÃO-magia (melee/habilidade física)
MAGIA:      spell base × % (pct-dmg-magia + pct-dmg-{elem}-magia); Intelecto NÃO contribui dano
            Mago: ataque básico = magia da arma (`spells.ts` + `grantedSpellId` em itemBases)
            Mitigação: applyElementalMitigation — res.efetiva = min(75, max(0, resAlvo − penAtacante))

PENETRAÇÃO: pen{elem} = Σ pct-pen-{elem} — subtrai da res. do alvo antes do %

DEFESA:     armadura = Σ flat-armadura            (reduz dano físico recebido; fórmula PoE no combate)
            evasao   = (agi × 2) + Σ flat-evasao
            bloqueio = Σ pct-bloqueio (só se escudo equipado; cap blockMax=75)

ACERTO:     base classe (8/12/6) + floor(agi×1.5) + Σ flat-acerto
            rollHit: chance = acerto÷(acerto+evasao), cap 5–95% — evadiu = 0 dano

RESIST (cap resistMax=75): res{elem} = Σ pct-res-{elem}; resFisico = Σ pct-res-fisica

TOTAL+DPS:  danoTotal{Min,Max} = danoFisico{Min,Max} + Σ elementais (referência; mago usa magia no combate)
            dps = ((min+max)/2) ÷ velAtaque(seg) × (1 + (chanceCritico/100)×(multCritico-1))

MAGIA:      pctDmgMagia / pctDmg{Elem}Magia = Σ pct-dmg-*-magia (só magias)
            eficienciaMana = Σ pct-eficiencia-mana (cap 95%) — reduz custo: custo × (1 − eff/100)
            reducaoTempoConjuracao = Σ pct-red-tempo-conjuracao (cap 95%) — tempo × max(0.05, 1 − red/100)
            Helpers: effectiveManaCost(), effectiveCastTime() em stats.ts

REGEN (só itens): regenVida = Σflat-regen-vida; regenMana = Σflat-regen-mana
ROUBO/MOB:  rouboVida/Mana = Σpct-roubo-{x} (só itens); floor(danoEfetivo × %/100)
```

> Vel. de Ataque e Redução do Tempo de Conjuração alimentam o combate em tempo real (`CombatModal`).

---

## 8. Classes (data/classes.ts)

| Classe | Vida | Mana | Força | Agi | Int |
|---|---:|---:|---:|---:|---:|
| Guerreiro | 14 | 2 | **8** | 3 | 3 |
| Ladino | 10 | 4 | 5 | **8** | 5 |
| Mago | 8 | 12 | 3 | 5 | **8** |

Cada classe: atributo primário em 8, demais em 3–5. 2 `abilities` (flavor, sem mecânica). Textos de tab em `TAB_LABEL`/`TAB_SHORTCUT`/`TAB_DESC`.

---

## 9. ★ STATUS DE VALIDAÇÃO DOS STATS (questionário em progresso)

Revisão guiada de **cada um dos 39 stats**: pergunta → resposta → implementação → confirmação. Registro mestre.

### ✅ VALIDADOS
| Stat | Regra |
|---|---|
| **Força** | Base 8/5/3. Cada ponto = +1% Dano Físico multiplicativo. NÃO contribui pra Armadura. |
| **Agilidade** | Base 3/8/5. Cada ponto = +2 Esquiva e +2 Evasão (flat). |
| **Intelecto** | Base 3/5/8. Cada ponto = +5 Mana Máxima. |
| **Vida Máxima** | Só classe + itens. Nenhum atributo. Nenhum ganho por level-up. |
| **Mana Máxima** | Classe + Int×5 + itens. Nenhum ganho por level-up. |
| **Regen Vida/Mana** | Zero base, só itens. **Por segundo** (`/s`). Fora do combate: `useRegenTick`. No combate RT: tick 1s no `CombatModal`. |
| **Dano Físico** | Desarmado 2–4 (escala WoW). Arma define range (por golpe = DPS-alvo × segundos). Força multiplica. |
| **Dano Total** | Físico (range) + elementais (flat). |
| **DPS** | `dano médio × vel × (1 + crit×(mult-1))`. Referencial teórico. |
| **Armadura** | Reduz físico via fórmula PoE `armadura/(armadura + 10×dano)`. `applyArmor()` em combat.ts. Inimigos têm `armadura?`. |
| **Resistência Física** | Zero base, só itens (`pct-res-fisica`). Cap 75%. Após evasão: Armadura → Res. Física % no restante. `mitigatePhysicalDamage()` em combat.ts. Mínimo 1 se o golpe conecta. |
| **Acerto** | Base por classe (Guerreiro 8 / Ladino 12 / Mago 6) + Agi×1,5 + itens (`flat-acerto`). |
| **Evasão** | Agi×2 + itens (`flat-evasao`). Substitui Esquiva (removida). |
| **Acerto vs Evasão** | Uma rolagem: chance = Acerto÷(Acerto+Evasão), cap 5–95%. Evadiu = 0 dano; conectou = aplica dano. `rollHit()` em combat.ts. Inimigos: `evasao` flat + `acerto` default nível×6. |
| **Chance de Crítico** | Arma (`weapon-crit-base`) ou 5% desarmado + max(0, Agi−10)×0,4 + itens. Cap 100%. `rollCritical()` após conectar. Jogador e inimigos. |
| **Mult. de Crítico** | Base 1,5 + Ladino 0,2 + itens. Multiplica o golpe inteiro (físico ou magia) **antes** da mitigação. |
| **Bloqueio** | Só com escudo equipado; senão 0%. Só itens (`pct-bloqueio`). Cap 75%. Após conectar: `rollBlock()` → 0 dano (sem crítico/mitigação). Inimigos: `bloqueio?` por tipo (maioria 0). |
| **Roubo Vida/Mana** | Zero base, só itens. % do dano efetivo causado (pós-mitigação do alvo; overkill não conta). Jogador e inimigos (`rouboVida?` / `rouboMana?`). `computeLeech()` / `applyPlayerLeech()`. |
| **Escudo de Energia** | VITAL (não defensivo). Zero base, só itens (`flat-escudo-energia`). Todo dano recebido consome ES antes da Vida (`applyDamageToPlayer` em combat.ts). `Character.esAtual` persistido; restaura no fim do combate e re-forma ao trocar equipamento fora de combate. **UI: camada sobreposta à barra de Vida** (PoE-style), largura = ES ÷ VidaMax (cap 100%), translúcida (opacity .82) + valor "+N" em energia — na ficha (VitalBar `overlayCurrent`), topbar do HUD e CombatModal. StatLine com breakdown só aparece na ficha se ES > 0. Sem regen de ES. |
| **Dano Elemental** | `flat-dmg-{elem}` = dano por golpe em ataques não-magia (físico/habilidade). Mago usa magia da arma. Afixos de magia usam `pct-dmg-*-magia`. |
| **Dano de Magias** | `pct-dmg-magia` + `pct-dmg-{elem}-magia` — só magias; não soma em melee. |
| **Eficiência de Mana** | Zero base, só itens. % de redução do custo (100 mana + 20% → 80). Cap 95%. `effectiveManaCost()` em combate. |
| **Redução do Tempo de Conjuração** | Zero base, só itens. % reduz segundos de cast. Cap 95%. `effectiveCastTime()` no intervalo de ataque do Mago. |
| **Res. Elementais** | Zero base, só itens. Cap 75%. Jogador e inimigos (`res{Elem}?`). Pen. do atacante reduz res. efetiva antes do %. |
| **Penetração** | Zero base, só itens (`pct-pen-{elem}`). Res. efetiva = max(0, Res. alvo − Pen.), cap 75%. `applyElementalMitigation()` em combat.ts. |
| **Tempo de Ataque** | SEGUNDOS por golpe (WoW-style; campo derivado ainda se chama `velAtaque`). Arma (`weapon-speed` em seg) ou desarmado (2.0/2.5/3.0s); `pct-vel-ataque` DIVIDE o tempo. Agilidade NÃO contribui. Dano por golpe das bases = DPS-alvo × segundos (armas lentas batem mais forte). Inimigos idem (`velAtaque` em seg, default 3.0; dano dos 184 defs re-escalado pra manter DPS). Intervalo RT = seg × 1000. |

### ⏳ EM DISCUSSÃO
_(nenhum stat de combate core pendente)_

### ❌ AINDA GENÉRICOS (exibidos mas sem efeito real validado)
_(nenhum — questionário de combate core concluído)_

### Ordem sugerida pra fechar o loop de combate
1. ✅ Armadura reduz físico (FEITO)
2. ✅ Resistência Física (FEITO)
3. ✅ Acerto vs Evasão (FEITO)
4. ✅ Crítico (FEITO)
5. ✅ Bloqueio (FEITO)
6. ✅ Roubo Vida/Mana (FEITO)
7. ✅ Elemental + Res + Pen (FEITO)
8. ✅ Magia (Eficiência + Redução Tempo Conjuração) (FEITO) · 9. ✅ Regen externa por segundo (FEITO).

### Protocolo do questionário
`AskUserQuestion` com 1–3 perguntas por stat: **base por classe**, **o que cada ponto/nível faz**, **cap**, **interação com stat oposta do inimigo**, **quando aplica**. Primeira opção sempre "(Recomendado)". Após resposta: implementar em `stats.ts` (+ `combat.ts` se afeta combate), atualizar **tooltip na ficha** (`CharacterSheet.tsx`) E **`description` do mod** (`itemMods.ts` — códice lê de lá). Confirmar antes de avançar.

---

## 10. Sistema de Itens

### Bases (itemBases.ts)
Templates "limpos". `baseStats[]` com `text` (display) + `effect` (numérico). Helper `makeBaseItem(baseId, idPrefix)`.

**Armas (167 bases geradas por curva de DPS):** cada arma declara `speedSec` (Tempo de Ataque em SEGUNDOS, WoW-style) e o dano por golpe é derivado: `dano médio = DPS-alvo(reqLevel, 1h/2h) × speedSec` — armas lentas batem mais forte pro mesmo DPS. Faixas: adagas ~2.0–2.1s · espadas 1h ~2.3–2.6s · maças/machados 1h ~2.6–3.1s · duas mãos ~3.3–3.6s. Crítico base 5%. Cajados não têm dano físico (concedem magia; cadência = cast time). Cetros concedem invocação.

### Afixos / Mods (itemMods.ts)
Prefixos (poder bruto) e Sufixos (qualificadores "do/da"), PoE-style. `ItemModDef`: `id, label, category, group, color, description, tiers: ModTierDef[]`. **O Registro lê `description` daqui** — atualizar mod = atualizar registro.

**Sistema de tiers (41 mods):**
- Cada afixo tem uma escada de `tiers` **ascendente** (T1 fraco → T-máx forte, convenção de atos/materiais — NÃO a invertida do PoE). Quantidade **variável por afixo**: stats principais têm escadas longas (vida 8, armadura/evasão/ES 7, dano/atributos/res elem/acerto 6), utilidades nichadas são curtas (roubo 3, pen/crít chance/eficiência/bloqueio/regen/res física/todos-atributos 4, %vel/%magia/mult crít 5).
- `ModTierDef`: `ilvl` (item level mínimo pro tier rolar) + `roll: [min,max]` ou `rollRange: {min, max}` (max = delta somado ao min).
- **Item level (ilvl) = nível do monstro que dropou** (drop de mob nv 35 → item nv 35). Independente do `reqLevel` da base (requisito pra equipar). Ilvl alto libera tiers altos; tiers baixos continuam elegíveis.
- **Sorteio com pesos decrescentes**: dentro dos tiers elegíveis, cada tier acima é 2× mais raro que o anterior (`getTierWeights` — ex.: 4 elegíveis → 8/4/2/1 → T-máx ~6,7%). Ilvl 100 NÃO garante tier máximo — é o "good roll".
- Helpers: `getEligibleTiers(mod, ilvl)`, `getTierWeights(n)`, `rollTier(mod, ilvl)`, `rollModStat(mod, ilvl)` (ItemStat completo com `effect` real), `rollMod(mod, ilvl=100)` (só texto — Forja sandbox), `tierDisplayRange(tier)`.
- Cada `ItemModDef` tem `key: StatKey` — liga o afixo ao cálculo da ficha.
- Códice > Mods de Item: sidebar estilo database (Prefixos/Sufixos → grupos → afixo) + detalhe com tabela de tiers (Tier · Nível do Item · Range · Chance).

### Gerador de equipamento (lib/itemGen.ts) — LOOT PROCEDURAL ATIVO
`generateEquipment(ilvl)`: base sorteada entre as com `reqLevel ≤ ilvl` → raridade por peso (comum 82 / mágico 16 / raro 2, `RARITY_WEIGHTS` — mágico/raro são DE VERDADE raros por decisão do usuário; por kill: ~1,9% mágico, ~0,24% raro) → afixos únicos respeitando caps da raridade, tier limitado pelo ilvl com pesos decrescentes. Item sai com `ilvl` gravado (tooltip mostra "Nv Item N") e `effect` real em cada afixo — entra direto na ficha.
- **Drop:** `rollRewards` (combat.ts) rola `EQUIP_DROP_CHANCE = 0.12` por vitória; ilvl = `enemy.level`. Loot que não cabe na bag é descartado em silêncio (comportamento pré-existente).
- **Nomes:** sempre o nome da base — a cor da raridade diferencia (decisão do usuário: sem nome expandido por afixo). Único/Lendário ainda não geram (sem exemplares).

### Raridades
| Tier | Afixos | Cor |
|---|---|---|
| Comum | 0 (só base) | cinza |
| Mágico | 1–2 (máx 1 prefixo + 1 sufixo) | azul |
| Raro | 3–6 (máx 3 prefixos + 3 sufixos) | khaki |
| Único | fixos curados | tussock |
| Lendário | fixos + especiais | lavender |

### Slots & Paper-doll (items.ts)
`EQUIP_GROUPS`: armadura `[cabeca,peito,maos,pes,cinto]`, acessórios `[amuleto,anel1,anel2]`, armas `[arma,escudo]` = **10 slots**. `PAPER_DOLL_ORDER` grid 3×4 com `null` pra células vazias:
```
[Amuleto] [Cabeça] [Anel 1]
[Arma]    [Peito]  [Escudo]
[Mãos]    [Cinto]  [Anel 2]
[  —  ]   [Pés]    [  —  ]
```
`INVENTORY_SIZE = 36` (grid 6×6). Helpers: `itemFitsInSlot`, `findEmptyEquipSlot`, `findFirstCompatibleEquipSlot`, `emptyEquipped()`.

---

## 11. Inventário & Equipamento (components/Inventory)

- **Drag & drop** HTML5 nativo entre slots, validado por `canSwap` (bidirecional: item da origem cabe no destino E vice-versa). Feedback: `compatible` (dashed brass) vs `incompatible` (dashed terracota sutil).
- **Click esquerdo** = quick-toggle: equipa (do inventário, slot vazio compatível preferido) ou desequipa (1º slot livre da bag).
- **Click direito** = **mesma ação** do quick-toggle. **Não há mais menu "Descartar"** (removido; CSS `.contextMenu`/`.menuItemDanger` órfãos — limpar). Descartar virá via drag-out futuro.
- **Hover** = `ItemTooltip` (portal, fixed) com nome por raridade + stats + flavor.
- `null` em PAPER_DOLL_ORDER → `.slotGap`.
- Trocar equipamento recomputa `vidaMax`/`manaMax` derivados e clampa atuais se o cap encolheu (em `GameHud` `onUpdate`).

---

## 12. Combate (lib/combat.ts + components/CombatModal)

**Tempo real** — ataques básicos automáticos; habilidade e fuga manuais. Loop a cada 100ms.

### Funções puras (combat.ts)
- `playerAttack` / `playerAbility` / `enemyAttack` — `rollHit` → `rollBlock` → crítico → mitigação
- `getPlayerAttackIntervalMs` — `1/velAtaque`; Mago usa `max(cast, 1/vel)` com `effectiveCastTime`
- `getEnemyAttackIntervalMs` — `1/enemy.velAtaque` (default 1,0/s)
- `applyArmor`, `mitigatePhysicalDamage`, `applyElementalMitigation`, `rollHit`, `rollCritical`, `rollBlock`
- `tryFlee()` — 70%. `rollRewards`, `applyVictory`, `applyDefeat`, `restoreVitalsFull`, `computeLeech` / `applyPlayerLeech`
- **Fim de combate** (vitória, derrota ou fuga): vida e mana restauradas a 100% dos máximos derivados.

### Regen no combate
`applyRegenTick` a cada `COMBAT_REGEN_INTERVAL_MS` (1s) dentro do modal. Fora do combate: tick por segundo via `useRegenTick` (só itens com regen); **não** substitui o restore total ao sair de um combate.

### Inimigos (enemies.ts)
`EnemyDef` com stats no **nível 1** e `locationId` exclusivo (uma criatura = uma área). `spawnEnemy(def, level)` escala com curva **GEOMÉTRICA de 1.046^(nível−1)** — a mesma da curva de DPS dos equipamentos, mantendo a relação jogador×inimigo coerente do nv 1 ao 100 (mob do seu nível cai em ~3 golpes de arma do nível dele; a escala linear `×nível` antiga dobrava o mob do nv 1→2 e foi descartada). Balanço WoW-style: vida nível 1 entre 25–100, dano por golpe alto com `velAtaque` em segundos (2.0–5.0s). **Primeiro golpe do combate respeita o Tempo de Ataque cheio dos dois lados** (CombatModal init; inimigo com +400ms de cortesia).
Nível do encontro: **`resolveEncounterLevel(charLevel, areaLevel)`** = clamp(personagem, área, área+1). Ex.: Floresta (1) — char nv 1→1, nv 2→2, nv 3+→2.
12 áreas hostis × 4 criaturas cada (48 total). **Pedragal** é a única zona sem encontros. Pool derivado em `LOCATION_ENEMIES`. `rollEncounter(locationId, characterLevel)`.

---

## 13. Progressão (leveling.ts + talentos)

**XP:** `xpForLevel(level) = round(10 × level^1.5)`. Cap `MAX_LEVEL = 100`. `applyLevelUp` aplica level-ups consecutivos; **só incrementa level** (Vida/Mana/atributos estáticos). Ganho real = **1 ponto de talento/nível** (derivado, não armazenado).

**Talentos (talents.ts):** 3 classes × 3 árvores × ~12 talentos. Layout staggered 5 cols × 4 tiers. Pontos = `(level-1) - total gasto`. **Efeitos de talento ainda NÃO plugados** em stats.ts (display por enquanto).

---

## 14. Mundo / Atlas (world.ts + MapView)

13 locations em grafo com **tronco principal** + **4 ramos sem saída** (voltar ao hub pra seguir). Conexões bidirecionais. **Pedragal** é a única `town` (zona segura); demais locais têm patrulha.

---

## 15. NPCs / Vila / Lojas / Crafting / Descanso

**NPCs (npcs.ts):** declarativo — `roles: NpcRole[]` (`falar, loja, forjar, destilar, descansar`), UI renderiza botões conforme. Campo `portrait?` existe mas **nenhum NPC usa** (revertidos). Roster Pedragal: Tibério (Ferreiro), Solana (Alquimista), Doroteu (Padeiro), Sirvên (Ancião), Madalena (Estalajadeira). Cards quadrados (`aspect-ratio: 1/1`, grid `minmax(200px,1fr)`).

**Loja/Forja/Destilaria/Estalagem:** `shops.ts` (compra/venda), `recipes.ts` (materiais → item), RestPane (5g → Vida/Mana cheias + `day+1`).

---

## 16. Quests / Diário (quests.ts + JournalView)

Mock cobrindo todos os estados/tipos. Abandono some do diário (`abandonedQuestIds`), retomável. Progresso hoje é hardcoded (sem sistema de eventos).

---

## 17. Registro + Códice

**Registro** (`RegistroView`): **Mods**, **Forja** (simulador), **Bestiário** (`enemies.ts`). Manter `description` dos mods sincronizada com fórmulas reais.

**Códice** (`CodexView` + `RarityGuide`): guias que ensinam mecânicas — hoje **Raridade**; novos guias entram aqui, não no Registro.

---

## 18. Social / Multiplayer (MOCK — SOCIAL:)

Tudo `// SOCIAL:`. Tab **Social**: chat Global/Guilda/Amigos/Grupos (LFG estilo WoW). Dados em `social.ts`, `socialLinks.ts`, `parties.ts`. Fachada — sem rede real.

---

## 19. Persistência & Migração (storage.ts)

`loadCharacters()` → parse + `migrate()` por personagem. Chave `underdarkness_characters`.

`migrate()` faz: garante `rarity` em itens; rename `anel`→`anel1`; redimensiona inventário pra `INVENTORY_SIZE`; renomeia location `origem`→`pedragal`; recomputa `xpNext`; **re-sincroniza atributos** (`forca/agi/int`) com `CLASSES[classKey]`; level-ups retroativos; **sincroniza `vidaMax`/`manaMax`** com `computeDerivedStats` e clampa atuais.

> ⚠️ **Requisito firme do usuário:** atributos re-sincronizam da classe a cada load — personagens existentes herdam mudanças de balanceamento **sem recriar**. Quando houver alocação manual de pontos, separar base-da-classe de pontos-alocados e tornar esse refresh condicional.

**Ao adicionar campo ao Character:** tipo em `types.ts` → default em `CharacterCreate.tsx` → migração em `storage.ts`.

---

## 20. Padrões arquitetônicos & componentes-chave

### Tooltips em portal (padrão canônico)
1. `useRef` no alvo → 2. `onMouseEnter` lê `getBoundingClientRect` → 3. `createPortal` pra `document.body`, `position: fixed` → 4. smart placement (flip lateral/vertical no overflow) → 5. `pointer-events: none` → 6. `z-index: 1000`. Referência: `MapView.tsx` (com flip), `StatLine.tsx` (mais antigo).

### Layout HUD/Modal: cards independentes com gap
Container externo `padding/gap: 8px`, `background: var(--bg)`. Cada bloco interno `background: var(--paper)`, `border-radius: 4px`. O `--bg` mostra pelos gaps (sem separadores). Cards de sub-conteúdo usam `border-radius: 6px`.

### Conexões SVG entre nodes (Talent Tree, Atlas)
SVG overlay absoluto (`pointer-events: none`), `vectorEffect="non-scaling-stroke"`, edge clipping geométrico, Bézier quadrático no Atlas (`curvedPath`).

### Componentes
| Componente | Papel |
|---|---|
| `StatLine` | linha de stat + tooltip portal + breakdown. Sub: `Unit`, `Mod`, `TooltipLine`, `TooltipMeta`. `formatSourceValue` formata ranges. |
| `ItemTooltip`/`ItemTooltipInline` | tooltip de item (portal fixed / inline pra previews). |
| `Modal` | variantes default 640 / medium 900×600 / `large` full-screen. ESC fecha; nesting via capture-phase + stopImmediatePropagation. |
| `ConfirmDialog` | confirmação com ESC capture (não fecha modal pai). |
| `VitalBar` | barra vital em camadas (track + fill absoluto + content). |
| `CharacterSheet` | ficha 3 colunas (Recursos/Ofensivo/Defensivo), ~38 StatLines com `breakdown={sources.X}`. |

### Animações
0.15s hover/focus · 0.18s cross-fade entre tabs · 0.2s abertura de modal. Não invente outros valores sem motivo.

---

## 21. Anti-patterns (REGRAS ABSOLUTAS — não quebre)

### NUNCA usar border-left colorida pra indicar tipo/categoria/raridade
Rejeitado múltiplas vezes pelo usuário. **Não:** `border-left: 3px solid var(--vital-vida)`. **Sim:** cor da fonte do **label/tag** (mono uppercase), cor do **nome** por raridade, ou cor da **borda inteira** mudando em estados (hover/selected).

### NUNCA usar cores semânticas em UI geral
`--vital-*`, `--elem-*` etc. **só** em contextos semânticos (barras, labels de mod, tags de quest). Botões, bordas decorativas ficam em latão/folha/acento.

### NUNCA usar `--accent` (vermelho vivo) fora de destrutivo
`--accent`/`--accent-deep` só em ações irreversíveis (deletar, descartar). Pra "incompatível"/"alerta" use `--vital-vida` (terracota sóbrio).

### NUNCA escrever UI em tom de RPG dramático
Erros, confirmações, prompts: direto e funcional. Drama vai em conteúdo (item, quest, NPC).

### NUNCA criar `*.md` sem pedido explícito
Documentação só com confirmação.

---

## 22. Convenções de Código

- **PT-BR** em UI, dados, comentários, flavor. Símbolos em inglês.
- **CSS Modules** sempre; cores via `var(--token)`; sombras via `--card-edge*`. Nomes camelCase.
- **Sem libs novas** sem motivo forte — manter footprint react-only.
- Comentários explicam o **porquê**, não o **o quê**.
- Helpers: `get*` (leitura), `make*`/`create*` (factory).
- TS strict: prefixar não-usados com `_` ou remover. Rodar `npx tsc --noEmit` (ignorar erros de `.module.css`).
- Ao mudar fórmula de stat: `stats.ts` + tooltip na ficha + `description` do mod no códice.

---

## 23. Roadmap / TODOs / Pendências

### Imediato (questionário de stats)
- [ ] **Dano Elemental** — perguntas pendentes (§ 9).
### Sistemas a definir
- [ ] **"Turno fora do combate"** (bloqueador da regen externa): por ação | tick em tempo real | por período do dia.
- [ ] Plugar efeitos de **talento** em stats.ts.
- [ ] Sistema de **habilidades/feitiços** real (combate em tempo real + custos/tempos de cast por spell).
- [ ] Alocação **manual de pontos de atributo** (separar base-classe de alocado; refresh da migração condicional).
- [ ] Descartar item (drag-out da bag).
- [ ] Eventos no Atlas, loot procedural, reputação como sistema, multi-slot items, save slots múltiplos.

### Dívida técnica
- CSS `.contextMenu`/`.menuItemDanger` órfãos (menu removido) — limpar.
- `useRealTime` é placeholder do tempo de jogo.
- `portrait?` de NPC + PNGs em `assets/` dormentes (revertidos) — manter ou remover.

---

## 24. Onde achar o quê

| Pergunta | Onde |
|---|---|
| Cálculo de um stat | `lib/stats.ts` (`computeDerivedStatsWithSources`) |
| Lógica de combate | `lib/combat.ts` |
| Adicionar talent | `data/talents.ts` (helper `t({...})`) |
| Mudar tom de cor | `styles/tokens.css` (só o token, propaga) |
| Adicionar afixo/mod | `data/itemMods.ts` (códice atualiza sozinho) |
| Adicionar base de item | `data/itemBases.ts` |
| Persistir campo novo | `types.ts` → `CharacterCreate.tsx` → `storage.ts` |
| Adicionar tab/modal | `views/GameHud/GameHud.tsx` + `data/classes.ts` (TAB_*) + `lib/settings.ts` |
| Padrão visual | `design-system.md` primeiro, depois componente similar |

---

*Documento vivo. Se algo ficou desatualizado, atualize.*
