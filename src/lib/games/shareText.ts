import { scopeSearchParams } from '@/lib/league-scope';
import type { LeagueScope } from '@/types/league';

export function formatDailyShareText(
  scope: LeagueScope,
  scopeLabel: string,
  score: number,
  total: number,
  dailyStreak: number,
): string {
  const squares = Array.from({ length: total }, (_, i) => (i < score ? '🟩' : '⬜')).join('');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const params = scopeSearchParams(scope);
  params.set('game', 'daily');
  const url = `${origin}/play?${params}`;

  return [
    `Boundary Bytes Daily (${scopeLabel}) ${score}/${total}`,
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

  let textarea: HTMLTextAreaElement | null = null;
  try {
    textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    if (textarea?.parentNode) {
      document.body.removeChild(textarea);
    }
  }
}
