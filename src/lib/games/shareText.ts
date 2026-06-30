import type { League } from '@/types/league';

export function formatDailyDraftShareText(
  league: League,
  score: number,
  optimalScore: number,
  efficiencyPct: number,
  draftStreak: number,
): string {
  const filled = Math.min(5, Math.round(efficiencyPct / 20));
  const squares = Array.from({ length: 5 }, (_, i) => (i < filled ? '🟩' : '⬜')).join('');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/play?game=draft&league=${league}`;

  return [
    `Boundary Bytes Daily Draft ${league}`,
    `${Math.round(score)}/${Math.round(optimalScore)} pts (${efficiencyPct}%)`,
    squares,
    `Streak: ${draftStreak}`,
    url,
  ].join('\n');
}

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
