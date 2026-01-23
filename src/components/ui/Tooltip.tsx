'use client';

import { ReactNode, useId } from 'react';

type Side = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  content: ReactNode;
  side?: Side;
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
  children?: ReactNode;
}

export default function Tooltip({
  content,
  side = 'top',
  className,
  buttonClassName,
  ariaLabel = 'More info',
  children,
}: TooltipProps) {
  const id = useId();

  const position =
    side === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      : side === 'right'
        ? 'left-full top-1/2 -translate-y-1/2 ml-2'
        : side === 'bottom'
          ? 'top-full left-1/2 -translate-x-1/2 mt-2'
          : 'right-full top-1/2 -translate-y-1/2 mr-2';

  const arrow =
    side === 'top'
      ? 'top-full left-1/2 -translate-x-1/2 border-t-black'
      : side === 'right'
        ? 'right-full top-1/2 -translate-y-1/2 border-r-black'
        : side === 'bottom'
          ? 'bottom-full left-1/2 -translate-x-1/2 border-b-black'
          : 'left-full top-1/2 -translate-y-1/2 border-l-black';

  return (
    <span className={`relative inline-flex items-center group ${className || ''}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-describedby={id}
        className={`inline-flex items-center justify-center select-none rounded-full border-2 border-black bg-white text-black w-5 h-5 text-xs font-bold shadow-[1px_1px_0_#000] focus:outline-none focus:ring-2 focus:ring-black ${
          buttonClassName || ''
        }`}
      >
        {children ?? '?'}
      </button>
      <div
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute ${position} z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity`}
      >
        <div className="relative">
          <div className="bg-white text-black text-xs rounded-sm px-2 py-1.5 border-2 border-black shadow-[2px_2px_0_#000] w-64 sm:w-72 whitespace-normal break-words leading-snug">
            {content}
          </div>
          <span
            className={`absolute block w-0 h-0 border-8 border-transparent ${arrow}`}
            aria-hidden="true"
          />
        </div>
      </div>
    </span>
  );
}
