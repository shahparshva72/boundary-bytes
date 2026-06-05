'use client';

interface StatRevealBarProps {
  labelA: string;
  valueA: number;
  labelB: string;
  valueB: number;
  formattedA: string;
  formattedB: string;
  highlightSide?: 'left' | 'right' | null;
}

export default function StatRevealBar({
  labelA,
  valueA,
  labelB,
  valueB,
  formattedA,
  formattedB,
  highlightSide,
}: StatRevealBarProps) {
  const max = Math.max(valueA, valueB, 1);
  const widthA = `${(valueA / max) * 100}%`;
  const widthB = `${(valueB / max) * 100}%`;

  return (
    <div className="w-full max-w-2xl flex flex-col gap-3">
      <div>
        <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
          <span className="truncate pr-2">{labelA}</span>
          <span>{formattedA}</span>
        </div>
        <div className="h-4 sm:h-5 bg-[#FFFEE0] border-2 border-black">
          <div
            className={`h-full transition-all duration-500 ${highlightSide === 'left' ? 'bg-[#4ECDC4]' : 'bg-[#FFED66]'}`}
            style={{ width: widthA }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
          <span className="truncate pr-2">{labelB}</span>
          <span>{formattedB}</span>
        </div>
        <div className="h-4 sm:h-5 bg-[#FFFEE0] border-2 border-black">
          <div
            className={`h-full transition-all duration-500 ${highlightSide === 'right' ? 'bg-[#4ECDC4]' : 'bg-[#FFED66]'}`}
            style={{ width: widthB }}
          />
        </div>
      </div>
    </div>
  );
}
