import { useState, useCallback } from 'react';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type Settings,
} from '../lib/settings';

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(() => loadSettings());

  const setSettings = useCallback((next: Settings) => {
    setSettingsState(next);
    saveSettings(next);
  }, []);

  const resetShortcuts = useCallback(() => {
    const next: Settings = {
      ...settings,
      shortcuts: { ...DEFAULT_SETTINGS.shortcuts },
    };
    setSettingsState(next);
    saveSettings(next);
  }, [settings]);

  return { settings, setSettings, resetShortcuts };
}
