import type { League } from '@/types/league';

export function formatDailyShareText(
  league: League,
  score: number,
  total: number,
  dailyStreak: number,
): string {
  const squares = Array.from({ length: total }, (_, i) => (i < score ? '🟩' : '⬜')).join('');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/play?game=daily&league=${league}`;

  return [
    `Boundary Bytes Daily ${league} ${score}/${total}`,
    squares,
    `Streak: ${dailyStreak}`,
    url,
  ].join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to fallback
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
