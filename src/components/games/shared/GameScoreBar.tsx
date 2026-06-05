'use client';

import { Badge } from '@/components/ui';

interface GameScoreBarProps {
  streak?: number;
  round?: number;
  totalRounds?: number;
  score?: number;
  label?: string;
}

export default function GameScoreBar({
  streak,
  round,
  totalRounds,
  score,
  label,
}: GameScoreBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-2xl">
      {label && (
        <Badge variant="black" className="text-xs sm:text-sm font-black uppercase">
          {label}
        </Badge>
      )}
      {streak !== undefined && (
        <Badge variant="teal" className="text-xs sm:text-sm font-black">
          Streak: {streak}
        </Badge>
      )}
      {round !== undefined && totalRounds !== undefined && (
        <Badge variant="yellow" className="text-xs sm:text-sm font-black">
          Round {round}/{totalRounds}
        </Badge>
      )}
      {score !== undefined && totalRounds !== undefined && (
        <Badge variant="gold" className="text-xs sm:text-sm font-black">
          Score: {score}/{totalRounds}
        </Badge>
      )}
    </div>
  );
}
