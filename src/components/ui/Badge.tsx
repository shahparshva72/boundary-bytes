'use client';

import { forwardRef, HTMLAttributes } from 'react';

type BadgeVariant = 'coral' | 'teal' | 'yellow' | 'gold' | 'black' | 'white';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  coral: 'bg-[#FF5E5B] text-black',
  teal: 'bg-[#4ECDC4] text-black',
  yellow: 'bg-[#FFED66] text-black',
  gold: 'bg-[#FF9F1C] text-black',
  black: 'bg-black text-white',
  white: 'bg-white text-black',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 sm:px-3 py-1 text-xs sm:text-sm',
  lg: 'px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'teal', size = 'md', icon, className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1 sm:gap-2 font-bold border-2 border-black uppercase tracking-wide ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export default Badge;
export { Badge };
export type { BadgeProps, BadgeSize, BadgeVariant };
