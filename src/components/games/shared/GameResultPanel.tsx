'use client';

import { Button } from '@/components/ui';

interface GameResultPanelProps {
  title: string;
  subtitle?: string;
  onPlayAgain?: () => void;
  onShare?: () => void;
  shareLabel?: string;
  showPlayAgain?: boolean;
  children?: React.ReactNode;
}

export default function GameResultPanel({
  title,
  subtitle,
  onPlayAgain,
  onShare,
  shareLabel = 'Share result',
  showPlayAgain = true,
  children,
}: GameResultPanelProps) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-black text-center uppercase tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base font-bold text-black/80 text-center">{subtitle}</p>
      )}
      {children}
      <div className="flex flex-wrap gap-2 justify-center">
        {showPlayAgain && onPlayAgain && (
          <Button type="button" variant="primary" onClick={onPlayAgain}>
            Play again
          </Button>
        )}
        {onShare && (
          <Button type="button" variant="secondary" onClick={onShare}>
            {shareLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
