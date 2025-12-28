'use client';

import { forwardRef, HTMLAttributes } from 'react';

type SectionHeaderColor = 'coral' | 'teal' | 'yellow' | 'gold';
type SectionHeaderSize = 'sm' | 'md' | 'lg';

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  color?: SectionHeaderColor;
  size?: SectionHeaderSize;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

const colorStyles: Record<SectionHeaderColor, string> = {
  coral: 'bg-[#FF5E5B]',
  teal: 'bg-[#4ECDC4]',
  yellow: 'bg-[#FFED66]',
  gold: 'bg-[#FFC700]',
};

const sizeStyles: Record<SectionHeaderSize, string> = {
  sm: 'p-2 border-b-2',
  md: 'p-2 sm:p-4 border-b-2 sm:border-b-4',
  lg: 'p-4 sm:p-6 border-b-4',
};

const textSizeStyles: Record<SectionHeaderSize, string> = {
  sm: 'text-sm sm:text-base md:text-lg',
  md: 'text-base sm:text-xl md:text-2xl',
  lg: 'text-xl sm:text-2xl md:text-3xl',
};

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    { title, color = 'coral', size = 'md', as: Component = 'h2', className = '', ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`${colorStyles[color]} ${sizeStyles[size]} border-black ${className}`}
        {...props}
      >
        <Component
          className={`${textSizeStyles[size]} font-black text-black text-center uppercase tracking-wide`}
        >
          {title}
        </Component>
      </div>
    );
  },
);

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
export { SectionHeader };
export type { SectionHeaderColor, SectionHeaderProps, SectionHeaderSize };
