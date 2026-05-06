import type { TabKey } from '../types';

const STORAGE_KEY = 'underdarkness_settings';

// Tabs com atalho editável pelo usuário. 'opcoes' fica fora — sempre ESC.
export type EditableTab = Exclude<TabKey, 'opcoes'>;
export const EDITABLE_TABS: EditableTab[] = [
  'personagem',
  'talentos',
  'habilidades',
  'mapa',
  'diario',
  'codice',
];

export interface Settings {
  shortcuts: Record<EditableTab, string>;
  /** Pede tela cheia automaticamente ao entrar no HUD do jogo. */
  startInFullscreen: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  shortcuts: {
    personagem: 'C',
    talentos: 'T',
    habilidades: 'A',
    mapa: 'M',
    diario: 'J',
    codice: 'K',
  },
  startInFullscreen: false,
};

/** Preenche campos faltantes com defaults — futura adição de settings não quebra saves antigos. */
function migrate(raw: unknown): Settings {
  const s = (raw ?? {}) as Partial<Settings>;
  return {
    shortcuts: { ...DEFAULT_SETTINGS.shortcuts, ...(s.shortcuts ?? {}) },
    startInFullscreen: s.startInFullscreen ?? DEFAULT_SETTINGS.startInFullscreen,
  };
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS, shortcuts: { ...DEFAULT_SETTINGS.shortcuts } };
    return migrate(JSON.parse(raw));
  } catch (e) {
    console.error('Erro ao ler settings:', e);
    return { ...DEFAULT_SETTINGS, shortcuts: { ...DEFAULT_SETTINGS.shortcuts } };
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.error('Erro ao salvar settings:', e);
  }
}

/**
 * Normaliza um valor de `e.key` pra forma canônica usada como atalho:
 * letras em uppercase, resto preservado (`'Tab'`, `'Enter'`, `' '`, `'F1'`, `'/'`, etc.).
 * Garante que `'m'` e `'M'` sejam tratados como mesma tecla no matching.
 */
export function normalizeKey(key: string): string {
  if (key.length === 1 && /[a-zA-Z]/.test(key)) return key.toUpperCase();
  return key;
}

/**
 * Versão "humana" do atalho pra mostrar na UI. Letras viram uppercase,
 * teclas especiais ganham label legível (Space em vez de " ", etc.).
 */
export function displayKey(key: string): string {
  if (key === ' ') return 'Space';
  return normalizeKey(key);
}

/**
 * Aplica um atalho a uma tab. Se `key` colide com outra tab, faz **swap**:
 * a tab que tinha `key` recebe o atalho antigo de `tab`. Garante consistência
 * sempre — nunca duas tabs com a mesma tecla, nenhuma tab sem tecla.
 */
export function assignShortcut(
  shortcuts: Record<EditableTab, string>,
  tab: EditableTab,
  key: string,
): Record<EditableTab, string> {
  const next = { ...shortcuts };
  const oldKey = next[tab];
  const newKey = normalizeKey(key);
  const conflicting = (Object.keys(next) as EditableTab[]).find(
    (t) => t !== tab && normalizeKey(next[t]) === newKey,
  );
  next[tab] = newKey;
  if (conflicting) next[conflicting] = oldKey;
  return next;
}
