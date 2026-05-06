import { useState, useEffect } from 'react';

function formatTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Hook que retorna o horário do mundo real (HH:MM) e atualiza
 * automaticamente conforme o relógio avança.
 *
 * Por enquanto, a HUD usa esse hook pra exibir o "Tempo" — quando
 * tivermos um sistema de dia/noite próprio do jogo, é só trocar
 * essa fonte por uma que reflita o tempo do mundo do jogo.
 */
export function useRealTime(): string {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
