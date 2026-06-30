import { useEffect, useState } from 'react';
import { getMsUntilNextLocalDay } from '@/lib/games/seededRandom';

function formatCountdownLabel(): string {
  const ms = getMsUntilNextLocalDay();
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export function useDailyCountdownLabel(refreshMs = 60_000): string {
  const [label, setLabel] = useState(formatCountdownLabel);

  useEffect(() => {
    const intervalId = setInterval(() => setLabel(formatCountdownLabel()), refreshMs);
    return () => clearInterval(intervalId);
  }, [refreshMs]);

  return label;
}
