'use client';

import { Card, CardContent, CardHeader } from '@/components/ui';

interface PlayerChoiceCardProps {
  name: string;
  formattedValue?: string;
  revealed?: boolean;
  selected?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function PlayerChoiceCard({
  name,
  formattedValue,
  revealed = false,
  selected = false,
  isCorrect = false,
  isWrong = false,
  disabled = false,
  onClick,
}: PlayerChoiceCardProps) {
  let headerColor: 'coral' | 'teal' | 'yellow' | 'gold' | 'white' = 'yellow';
  if (revealed) {
    if (isCorrect) {
      headerColor = 'teal';
    } else if (isWrong) {
      headerColor = 'coral';
    }
  } else if (selected) {
    headerColor = 'gold';
  }

  const borderClass =
    revealed && isCorrect
      ? 'ring-2 ring-[#4ECDC4]'
      : revealed && isWrong
        ? 'ring-2 ring-[#FF5E5B]'
        : '';

  return (
    <Card
      interactive={!disabled && !revealed && !!onClick}
      className={`w-full ${borderClass} ${disabled ? 'opacity-60' : ''}`}
      onClick={disabled || revealed ? undefined : onClick}
    >
      <CardHeader color={headerColor} className="p-2 sm:p-3">
        <p className="text-sm sm:text-base md:text-lg font-black text-black text-center uppercase tracking-tight break-words">
          {name}
        </p>
      </CardHeader>
      {revealed && formattedValue !== undefined && (
        <CardContent className="p-2 sm:p-3">
          <p className="text-xl sm:text-2xl font-black text-black text-center">{formattedValue}</p>
        </CardContent>
      )}
    </Card>
  );
}
