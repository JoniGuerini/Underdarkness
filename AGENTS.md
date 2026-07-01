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
MAPA(tier): --map-tier-1 #b0b6c0 · --map-tier-2 #6495ED · --map-tier-3 #F0E68C · --map-tier-4 #C09060
MATERIAIS: --material-{erva,minerio,couro,tecido,carne,verdura,fruta}  (cor por tipo de reagente)
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
    useRegenTick.ts          # regen vida/mana 1/s fora de combate (só itens)
    useRealTime.ts           # relógio real HH:MM (placeholder p/ tempo de jogo)

  lib/
    stats.ts                 # ★ CORAÇÃO: computeDerivedStatsWithSources()
    combat.ts                # combate em tempo real (puro) + magias + afixos de mapa
    leveling.ts              # curva de XP, applyLevelUp
    inventory.ts             # addItemToInventory etc.
    settings.ts              # tipos/helpers de settings + atalhos
    storage.ts               # load/save + migração de schema
    locationInfo.ts          # badges / nível de encontro por local
    questProgress.ts         # status efetivo de quest, aceite, recompensas
    lootgen.ts               # ★ ENDGAME: rollItem/rollItems (loot procedural)
    mapgen.ts                # ★ ENDGAME: rollMap, expedições, drops, cor por tier

  data/                      # conteúdo declarativo (single source of truth)
    classes.ts  talents.ts  world.ts  enemies.ts  npcs.ts  npcDialogues.ts  quests.ts
    items.ts  itemBases.ts  itemMods.ts  materials.ts  recipes.ts  shops.ts
    spells.ts  summons.ts                           # magias/invocações por arma (Mago)
    market.ts                                       # casa de leilões (mock)
    mapAffixes.ts                                   # ENDGAME: afixos de item-mapa
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
Ordem em `TAB_ORDER` (GameHud). `registro` foi **absorvido pelo Códice** (não existe mais como tab).
| Tab | Default | Componente | Conteúdo |
|---|---|---|---|
| Personagem | C | `Inventory` + `CharacterSheet` | paper-doll + bag + ficha |
| Habilidades | A | `TalentsView` | árvore de talentos |
| Mapa | M | `MapView` | atlas de campanha (viagem) |
| Diário | J | `JournalView` | quests |
| Códice | K | `CodexView` | Itens · Mods · Raridade · Forja · Bestiário · guia do Atlas |
| Mercado | L | `MercadoView` | casa de leilões (mock) |
| Atlas de Mapas | N | `AtlasMapsView` (+ `MapRunModal`) | ★ ENDGAME: forja / estoque / expedição |
| Social | G | `SocialView` | chat, guilda, amigos, grupos (mock) — SOCIAL: |
| Opções | ESC | `OptionsView` | settings |

**Modal único compartilhado:** todas as tabs (exceto o overlay de expedição `MapRunModal`) compartilham UM `<Modal large>`. Cada tab tem um par View/Header (ex.: `CodexView`/`CodexHeader`).

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
  acceptedQuestIds: string[];                       // quests aceitas via diálogo (requiresAccept)
  questStates: Record<string, QuestStatus>;         // status por quest quando difere do mock global
  gold, day: number;
  maps: MapItem[];                                  // ENDGAME: estoque de mapas (fora dos 36 slots)
  highestMapTier: number;                           // ENDGAME: maior tier concluído
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

Lista: `weapon-speed, weapon-crit-base, flat-{vida,mana,armadura,evasao,escudo-energia,regen-vida,regen-mana,acerto,forca,agilidade,intelecto,todos-atributos,dmg-fis,dmg-fogo,dmg-gelo,dmg-raio,dmg-caos,dmg-sagrado}, pct-{res-fogo,res-gelo,res-raio,res-caos,res-sagrado,res-fisica,pen-fogo,pen-gelo,pen-raio,pen-caos,pen-sagrado,vel-ataque,red-tempo-conjuracao,crit-chance,crit-mult,eficiencia-mana,dmg-magia,dmg-{elem}-magia,roubo-vida,roubo-mana,bloqueio}`.

### ItemStatEffect / ItemStat
```ts
interface ItemStatEffect { key: StatKey; value: number; max?: number; }  // max = range (ex: 1 a 2)
interface ItemStat { text: string; color?: ModColor; kind?: 'base'|'prefix'|'suffix'; effect?: ItemStatEffect; }
```
`ItemStat` **sem** `effect` só aparece no tooltip (não afeta a ficha). Com `effect`, vira número real.

### Outros tipos
- **Item:** `id, name, slot: ItemSlot|null, rarity, stats?, description?, stackable?, stack?`. `ItemSlot` inclui `aljava` (off-hand exclusiva de arco).
- **Talent:** `id, name, description, row, col, maxRank (default 5), prerequisites?, effect?`.
- **Quest:** `id, title, type (principal|side|bounty|classe|evento|faccao), status (ativa|concluida|falhada), chapter?, giver?, locationId?, description, story, objectives[], rewards[], journal[], expiresIn?, requiresAccept?, giverNpcId?`.
- **MapLocation:** `id, name, description, region, level, x, y, connections[], type? (town|wilderness|dungeon|boss), branch? (main|parallel), act?`.
- **MapItem / MapAffix:** item-mapa de endgame + afixo rolado (ver § 25).
- **Spell / SummonSpell / Minion:** magias/invocações concedidas por arma do Mago (`spells.ts`/`summons.ts` — ver § 25b).
- **MarketListing:** listagem da casa de leilões mock (`market.ts` — ver § 17b).
- **DerivedStats:** saída de stats.ts (ver § 7) — inclui `escudoEnergia`.

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

VIDA/MANA:  vidaMax = classe.vida + Σ flat-vida          (nenhum atributo; sem termo de level)
            manaMax = (intelecto × 5) + Σ flat-mana      (SEM termo de classe — mana é 100% Int + itens)
ESCUDO EN.: escudoEnergia = Σ flat-escudo-energia        (buffer absorvido antes da Vida; só itens)
TODOS ATR.: flat-todos-atributos soma em forca/agi/int simultaneamente

DANO FÍSICO (range):
  base = arma (flat-dmg-fis min/max) OU desarmado [1,1]
  forcaMult = 1 + forca/100   (MULTIPLICATIVO)
  danoFisico{Min,Max} = round(base{Min,Max} × forcaMult)
  → Força mostra delta absoluto no breakdown (keepZero=true)

VEL ATAQUE: base = arma (weapon-speed) OU desarmado (ladino 1.6/guerreiro 1.0/mago 0.8)
            velAtaque = base × (1 + Σpct-vel-ataque/100) + (agi-10)×0.02

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
            dps = ((min+max)/2) × velAtaque × (1 + (chanceCritico/100)×(multCritico-1))

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

| Classe | Vida | Força | Agi | Int |
|---|---:|---:|---:|---:|
| Guerreiro | 30 | **8** | 3 | 3 |
| Ladino | 20 | 5 | **8** | 5 |
| Mago | 15 | 3 | 5 | **8** |

`ClassData` **não tem campo `mana`** — Mana é derivada (Int×5 + itens). Cada classe: atributo primário em 8, demais em 3–5. 2 `abilities` (flavor, sem mecânica). Textos de tab em `TAB_LABEL`/`TAB_SHORTCUT`/`TAB_DESC`.

---

## 9. ★ STATUS DE VALIDAÇÃO DOS STATS (questionário em progresso)

Revisão guiada de **cada um dos 39 stats**: pergunta → resposta → implementação → confirmação. Registro mestre.

### ✅ VALIDADOS
| Stat | Regra |
|---|---|
| **Força** | Base 8/5/3. Cada ponto = +1% Dano Físico multiplicativo. NÃO contribui pra Armadura. |
| **Agilidade** | Base 3/8/5. Cada ponto = +2 Esquiva e +2 Evasão (flat). |
| **Intelecto** | Base 3/5/8. Cada ponto = +5 Mana Máxima. |
| **Vida Máxima** | Base por classe (Guerreiro 30 / Ladino 20 / Mago 15) + itens. Nenhum atributo. Nenhum ganho por level-up. |
| **Mana Máxima** | Int×5 + itens. **Sem termo de classe.** Nenhum ganho por level-up. |
| **Escudo de Energia** | Zero base, só itens (`flat-escudo-energia`). Buffer que absorve dano antes da Vida. |
| **Todos os Atributos** | `flat-todos-atributos` — soma simultânea em Força, Agilidade e Intelecto (afixo de amuleto). |
| **Regen Vida/Mana** | Zero base, só itens. **Por segundo** (`/s`). Fora do combate: `useRegenTick`. No combate RT: tick 1s no `CombatModal`. |
| **Dano Físico** | Desarmado 1–1. Arma define range. Força multiplica. |
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
| **Dano Elemental** | `flat-dmg-{elem}` = dano por golpe em ataques não-magia (físico/habilidade). Mago usa magia da arma. Afixos de magia usam `pct-dmg-*-magia`. |
| **Dano de Magias** | `pct-dmg-magia` + `pct-dmg-{elem}-magia` — só magias; não soma em melee. |
| **Eficiência de Mana** | Zero base, só itens. % de redução do custo (100 mana + 20% → 80). Cap 95%. `effectiveManaCost()` em combate. |
| **Redução do Tempo de Conjuração** | Zero base, só itens. % reduz segundos de cast. Cap 95%. `effectiveCastTime()` no intervalo de ataque do Mago. |
| **Res. Elementais** | Zero base, só itens. Cap 75%. Jogador e inimigos (`res{Elem}?`). Pen. do atacante reduz res. efetiva antes do %. |
| **Penetração** | Zero base, só itens (`pct-pen-{elem}`). Res. efetiva = max(0, Res. alvo − Pen.), cap 75%. `applyElementalMitigation()` em combat.ts. |
| **Vel. de Ataque** | Arma (`weapon-speed`) ou desarmado + Agi + itens. Define cadência do ataque básico automático no combate RT (`getPlayerAttackIntervalMs`). |

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

### Bases (itemBases.ts) — ~614 templates
Templates "limpos". `baseStats[]` com `text` (display) + `effect` (numérico). Helper `makeBaseItem(baseId, idPrefix)`. Quase toda base tem `reqLevel` e dano escalado por `rolledDamage(reqLevel, aps, cls)` (curva DPS ~4,6%/nível; 2 mãos ×1,28; spread 25–30%).

**Famílias de arma (`WeaponType`, 15):** espada/machado/maça de uma e duas mãos, adaga, lança, alabarda, foice, arco, besta, cajado, varinha, cetro. Helpers `isTwoHandedWeaponType`, `isPrimaryOnlyWeaponType` (2 mãos, lança e arco só na Principal), `weaponTypeOfItem`.

**Armadura (`ArmorType`, 6):** `armadura`, `evasao`, `escudo-energia` + híbridos (`armadura-evasao`, `armadura-energia`, `evasao-energia`). Peças: cabeça/peito/mãos/pés (60 cada) + escudo (60).

**Acessórios:** cinto (`BeltType`), anel (`RingType`), amuleto (`AmuletType`), aljava (`AljavaType`, off-hand só de arco).

**Armas mágicas:** `grantedSpellId` (16 cajados/varinhas → magia = ataque básico do Mago) e `grantedSummonId` (5 cetros → invocação; combate ainda **não** integrado). Ver § 25b.

### Afixos / Mods (itemMods.ts)
Prefixos (poder bruto) e Sufixos (qualificadores "do/da"), PoE-style. `ItemModDef`: `id, label, category, group, color, description, roll: [min,max]`, **`statKey: StatKey`** (efeito numérico) e **`namePrefix?: {m,f}` / `nameSuffix?`** (fragmentos pra compor nome procedural, com gênero). Dois geradores:
- `rollMod(mod)` → **só texto** (o Códice lê isto — atualizar mod = atualizar Códice).
- `rollModStat(mod)` → `ItemStat` completo com `effect` numérico via `statKey` (usado pelo **loot procedural**, ver § 25).

### Raridades
| Tier | Afixos | Cor |
|---|---|---|
| Comum | 0 (só base) | cinza |
| Mágico | 1–2 | azul |
| Raro | 3+ | khaki |
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
- **Endgame:** `applyVictoryNoRestore` (aplica XP/ouro/loot **sem** curar — usado entre ondas de expedição) e `applyMapModsToEnemy(enemy, affixes)` (buffa vida/dano/vel/crit conforme afixos do mapa). Ver § 25.
- **Fim de combate no `CombatModal`** (vitória, derrota ou fuga): vida e mana restauradas a 100%. **Expedições NÃO curam entre lutas** — só ao final.

### Regen no combate
`applyRegenTick` a cada `COMBAT_REGEN_INTERVAL_MS` (1s) dentro do modal. Fora do combate: tick por segundo via `useRegenTick` (só itens com regen); **não** substitui o restore total ao sair de um combate.

### Inimigos (enemies.ts) — ~184 defs
`EnemyDef` com stats no **nível 1** e `locationId` exclusivo (uma criatura = uma área). `spawnEnemy(def, level)` escala linearmente. Stats opcionais: `velAtaque, acerto, chanceCritico, multCritico, bloqueio, rouboVida, rouboMana, res{Fogo,Gelo,Raio,Caos,Sagrado}, armadura, loot[], xpFactor` (defaults: acerto = nível×6, crit 5%, mult 1,5, vel 1/s).
Nível do encontro: **`resolveEncounterLevel(charLevel, areaLevel)`** = clamp(personagem, área, área+1).
Pool derivado em `LOCATION_ENEMIES`; `rollEncounter(locationId, characterLevel)`. **Cidades (`type: 'town'`) não têm encontros.** Chefes de expedição de endgame são inimigos de locais `type: 'boss'` reforçados (ver § 25).

---

## 13. Progressão (leveling.ts + talentos)

**XP:** `xpForLevel(level) = round(10 × level^1.5)`. Cap `MAX_LEVEL = 100`. `applyLevelUp` aplica level-ups consecutivos; **só incrementa level** (Vida/Mana/atributos estáticos). Ganho real = **1 ponto de talento/nível** (derivado, não armazenado).

**Talentos (talents.ts):** 3 classes × 3 árvores × ~12 talentos. Layout staggered 5 cols × 4 tiers. Pontos = `(level-1) - total gasto`. **Efeitos de talento ainda NÃO plugados** em stats.ts (display por enquanto).

---

## 14. Mundo / Atlas de Campanha (world.ts + MapView)

**61 locais** em grafo, distribuídos por **5 atos** (`act`): Ato I (nv 1–20) … Ato V (nv 80–100). Cada local tem `type` (`town`/`wilderness`/`dungeon`/`boss`) e `branch` (`main` = tronco da história / `parallel` = ramo opcional sem saída). Conexões bidirecionais.
- **5 cidades** (`type: 'town'`, zonas seguras): Pedragal, Candelária, Cais Pálido, Brasa Última, Último Limiar.
- **5 arenas de chefe** (`type: 'boss'`): Forja do Caos (19), Trono Cego (40), Leviatã Adormecido (60), Coração da Forja (80), Escuridão Primordial (100).
- ~31 `wilderness` + ~20 `dungeon` têm patrulha.

> Esta é a progressão **vertical** (nv 1→100). O endgame **horizontal** (Atlas de Mapas) vive em outra tab — ver § 25.

---

## 15. NPCs / Vila / Lojas / Crafting / Descanso

**NPCs (npcs.ts + npcDialogues.ts):** declarativo — `roles: NpcRole[]` (`falar, loja, forjar, destilar, descansar`), UI renderiza botões conforme. `npcDialogues.ts` guarda os fluxos de conversa (`NpcDialog` full-screen; pode aceitar quests `requiresAccept`). NPCs existem nas **5 cidades**; roster de Pedragal: Tibério (Ferreiro), Solana (Alquimista), Doroteu (Padeiro), Sirvên (Ancião), Madalena (Estalajadeira). Campo `portrait?` existe mas **nenhum NPC usa** (revertidos). Cards quadrados (`aspect-ratio: 1/1`, grid `minmax(200px,1fr)`).

**Materiais (`materials.ts`):** ~196 reagentes empilháveis, 7 tipos (`MaterialType`: erva, minério, couro, tecido, carne, verdura, fruta) × tiers 1–5 (~ato). Maps `MATERIAL_TYPE_LABEL/SINGULAR/COLOR` (tokens `--material-{tipo}`); grupo "Reagente de Criação". Frutas usam nomes reais.

**Loja/Forja/Destilaria/Estalagem:** `shops.ts` (compra/venda), `recipes.ts` (materiais → item), `ShopPane`/`CraftPane`/`RestPane` (descanso 5g → Vida/Mana cheias + `day+1`).

---

## 16. Quests / Diário (quests.ts + JournalView)

Mock cobrindo todos os estados/tipos. Quests com `requiresAccept` só entram no diário após aceite via `NpcDialog` (`acceptedQuestIds`); status por-personagem em `questStates` sobrepõe o mock global. Abandono some do diário (`abandonedQuestIds`), retomável. Lógica de status efetivo/aceite/recompensa em `lib/questProgress.ts`. Progresso de objetivos ainda é hardcoded (sem sistema de eventos).

---

## 17. Códice (CodexView) — Registro unificado

O antigo **Registro** foi **absorvido pelo Códice** (não existe mais `RegistroView`). `CodexView` tem seções (`CodexSection`):
- **Itens** (`ItemsView`) — catálogo de bases + materiais com origem (drop/loja).
- **Mods** (`ModsList`) — lê `description` dos afixos (manter sincronizado com as fórmulas reais).
- **Raridade** (`RarityGuide`).
- **Forja** (`ForgeView`) — sandbox de craft.
- **Bestiário** (`BestiaryView`) — de `enemies.ts`.
- **Atlas de Mapas** (`AtlasGuide`) — guia da mecânica de endgame (≠ tab de gameplay do Atlas).

Novos guias/registros entram como seções aqui.

## 17b. Mercado (MercadoView) — Casa de Leilões (MOCK)

Tab própria (`L`). Listagens em `market.ts` (`MarketListing`: `seller`, `sellerClassKey`, `item`, `price`, `listedMinutesAgo`, `isPlayer?`), filtro por `MarketCategory` (`todos|arma|armadura|acessorio|consumivel`). Fachada de compra/venda entre jogadores — sem rede real.

---

## 18. Social / Multiplayer (MOCK — SOCIAL:)

Tudo `// SOCIAL:`. Tab **Social**: chat Global/Guilda/Amigos/Grupos (LFG estilo WoW). Dados em `social.ts`, `socialLinks.ts`, `parties.ts`. Fachada — sem rede real.

---

## 19. Persistência & Migração (storage.ts)

`loadCharacters()` → parse + `migrate()` por personagem. Chave `underdarkness_characters`.

`migrate()` faz: garante `rarity` em itens; rename `anel`→`anel1`; redimensiona inventário pra `INVENTORY_SIZE`; renomeia location `origem`→`pedragal`; recomputa `xpNext`; **re-sincroniza atributos** (`forca/agi/int`) com `CLASSES[classKey]`; level-ups retroativos; **sincroniza `vidaMax`/`manaMax`** com `computeDerivedStats` e clampa atuais; garante campos novos (`acceptedQuestIds`, `questStates`, `maps: []`, `highestMapTier: 0`).

> ⚠️ **TEMP (dev/teste):** enquanto o endgame está "no forno", `migrate()` força `gold: 999999` e o gate de nível 100 do Atlas está desativado (ver § 23, Dívida técnica). **Reverter antes de release.**

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

### Feito recentemente (deste ciclo)
- [x] **Loot procedural** (`lootgen.ts` + `rollModStat`).
- [x] **Endgame — Atlas de Mapas** (§ 25): geração de mapas, expedições ondas+chefe sem cura, drops T/T+1.
- [x] **Magias do Mago** no combate (spell por arma; eficiência de mana + redução de cast).
- [x] Catálogo de materiais por tipo (196 itens: ervas/minérios/couros/tecidos/carnes/verduras/frutas).

### Sistemas a definir
- [ ] **Invocações (summons)** — `summons.ts` existe (5 minions + 5 magias em cetros), mas **combate ainda não usa**. Plugar em `combat.ts`.
- [ ] **"Turno fora do combate"** (bloqueador da regen externa): por ação | tick em tempo real | por período do dia.
- [ ] Plugar efeitos de **talento** em stats.ts.
- [ ] Alocação **manual de pontos de atributo** (separar base-classe de alocado; refresh da migração condicional).
- [ ] Descartar item (drag-out da bag).
- [ ] Endgame: balanceamento de tiers/afixos, sabor por tema, uniques de mapa.
- [ ] Eventos no Atlas, reputação como sistema, multi-slot items, save slots múltiplos.

### Dívida técnica
- **TEMP (reverter antes de release):** `storage.ts` força `gold: 999999`; `AtlasMapsView` com `unlocked = true` (2 pontos) ignora o gate de nível 100. Só pra testar o endgame sem boneco nv 100.
- CSS `.contextMenu`/`.menuItemDanger` órfãos (menu removido) — limpar.
- `useRealTime` é placeholder do tempo de jogo.
- `portrait?` de NPC + PNGs em `assets/` dormentes (revertidos) — manter ou remover.
- Comentário no topo de `world.ts` ainda diz "Pedragal é a única zona segura", mas há 5 `town` — atualizar.

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
| Forjar/abrir mapa (endgame) | `lib/mapgen.ts` + `components/AtlasMapsView` / `MapRunModal` |
| Gerar loot procedural | `lib/lootgen.ts` (`rollItem`) + `data/itemMods.ts` (`rollModStat`) |
| Magia de arma do Mago | `data/spells.ts` + `grantedSpellId` em `itemBases.ts` |
| Padrão visual | `design-system.md` primeiro, depois componente similar |

---

## 25. ★ Endgame — Atlas de Mapas (estilo PoE)

Progressão **horizontal** após o teto de nível 100 (teto continua 100; sem XP além disso — poder vem de loot + tiers de mapa). Tab própria **Atlas de Mapas** (`N`), pensada pra desbloquear em nível 100.

### Item-mapa (`MapItem`) e geração (`lib/mapgen.ts`)
- `MAX_MAP_TIER = 16`. `tierMonsterLevel(tier) = 100 + (tier−1)×3`. `tierWaves(tier) = min(7, 4 + floor((tier−1)/4))`. Nº de afixos = `min(4, 1 + floor(tier/2))`.
- `rollMap(tier)` sorteia um **tema** (local hostil → pool de inimigos + sabor), nível, ondas e afixos → devolve um `MapItem`. Fora do inventário de 36 slots: vive em `Character.maps`.
- Cor por tier: `tierColorVar(tier)` → tokens `--map-tier-1..4`.

### Afixos de mapa (`data/mapAffixes.ts`)
6 afixos (`MapAffixDef`: `id, label, description, color, kind, roll, minTier`). `kind`:
- **Dificuldade:** `enemy-vida` (+20–60%), `enemy-dano` (+15–45%), `enemy-vel` (+10–25%), `enemy-crit` (+6–16%, minTier 3).
- **Recompensa:** `loot-quantidade` (+20–80%), `loot-raridade` (+15–50%).
Helpers `rollMapAffix`, `sumAffixValue`. `AFFIX_COLOR_VAR` mapeia `ModColor` → var CSS pra colorir inline.

### Expedição (`components/MapRunModal`)
- `buildExpeditionEnemies(map)`: `waves` de inimigos normais do tema + **1 chefe** (`beefBoss`: +80% vida, +15% dano, +2 níveis). `applyMapModsToEnemy` aplica os afixos de dificuldade em cada inimigo.
- **Sem cura entre lutas** — vida/mana persistem; só regen/roubo/habilidade sustentam. `applyVictoryNoRestore` entre ondas; `restoreVitalsFull` **só** no fim (vitória, derrota ou fuga).
- **Vitória final:** ouro + `baseLootCount(tier)` itens via **loot procedural** (`lootgen`, com bônus de raridade/quantidade dos afixos) + `rollExpeditionMapDrops(tier)` (drop de mapas T/T+1) + atualiza `highestMapTier`. **Derrota/fuga consomem o mapa.**

### UI (`components/AtlasMapsView`)
"Dispositivo de Mapas" forja um mapa T1 (**200 ouro**), estoque ordenado por tier, botão "Abrir Expedição" → `MapRunModal`. Guia da mecânica no Códice (`AtlasGuide`). Mostra o maior tier concluído (`highestMapTier`).

---

## 25b. Magias & Invocações do Mago (spells.ts / summons.ts)

- **Magias (`spells.ts`, 16):** `Spell` = `id, name, element, tier, castTimeSec, hits[]`. Concedidas por arma via `grantedSpellId` (16 cajados/varinhas; fogo/gelo/raio/sagrado tiers 1–3, caos 1–4). `getGrantedSpell(character)` retorna `null` se não-Mago. **São o ataque básico do Mago** (sem custo de mana); dano em `combat.ts` via `resolveSpellDamage`, escalado por `pct-dmg-magia` / `pct-dmg-{elem}-magia`.
- **Invocações (`summons.ts`, 5 minions + 5 magias):** `Minion` (`role, vida, danoMin/Max`) e `SummonSpell` (`tier, manaCost, castTimeSec, minionId, count`), concedidas por `grantedSummonId` (5 cetros). **Ainda não integradas ao combate** (§ 23).

---

*Documento vivo. Se algo ficou desatualizado, atualize.*
