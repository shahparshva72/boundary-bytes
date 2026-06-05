export interface SeededRandom {
  next(): number;
  nextInt(max: number): number;
  pick<T>(array: T[]): T;
  shuffle<T>(array: T[]): T[];
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRandom(seed: string): SeededRandom {
  let state = hashSeed(seed) || 1;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    nextInt(max: number) {
      return Math.floor(next() * max);
    },
    pick<T>(array: T[]): T {
      if (array.length === 0) {
        throw new Error('Cannot pick from empty array');
      }
      return array[nextInt(array.length)]!;
    },
    shuffle<T>(array: T[]): T[] {
      const copy = [...array];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = nextInt(i + 1);
        [copy[i], copy[j]] = [copy[j]!, copy[i]!];
      }
      return copy;
    },
  };

  function nextInt(max: number) {
    return Math.floor(next() * max);
  }
}

export function getLocalDateISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMsUntilNextLocalDay(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getTime() - now.getTime();
}
