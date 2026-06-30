'use client';

import { Card, CardContent, CardHeader } from '@/components/ui';
import type { DraftPlayer } from '@/lib/games/dailyDraft/types';

interface DraftPlayerTileProps {
  player: DraftPlayer;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export default function DraftPlayerTile({
  player,
  selected,
  disabled,
  onToggle,
}: DraftPlayerTileProps) {
  const isInteractive = !disabled;

  return (
    <Card
      interactive={isInteractive}
      className={`w-full ${selected ? 'ring-2 ring-[#FFC700]' : ''} ${disabled && !selected ? 'opacity-50' : ''}`}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={selected}
      onClick={isInteractive ? onToggle : undefined}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onToggle();
              }
            }
          : undefined
      }
    >
      <CardHeader
        color={selected ? 'gold' : player.role === 'batter' ? 'yellow' : 'teal'}
        className="p-2"
      >
        <p className="text-xs sm:text-sm font-black text-black text-center uppercase tracking-tight break-words">
          {player.name}
        </p>
      </CardHeader>
      <CardContent className="p-2 flex justify-between gap-2 text-xs font-bold text-black">
        <span>{player.price} cr</span>
        <span>{player.fantasyPoints} pts</span>
      </CardContent>
    </Card>
  );
}
