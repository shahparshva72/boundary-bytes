'use client';

import { forwardRef, HTMLAttributes } from 'react';

type CardVariant = 'default' | 'elevated' | 'flat';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  color?: 'coral' | 'teal' | 'yellow' | 'gold' | 'white';
}

type CardContentProps = HTMLAttributes<HTMLDivElement>;

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
  elevated: 'bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]',
  flat: 'bg-white border-4 border-black',
};

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-2 sm:p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const headerColorStyles: Record<NonNullable<CardHeaderProps['color']>, string> = {
  coral: 'bg-[#FF5E5B]',
  teal: 'bg-[#4ECDC4]',
  yellow: 'bg-[#FFED66]',
  gold: 'bg-[#FFC700]',
  white: 'bg-white',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      interactive = false,
      padding = 'none',
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const interactiveStyles = interactive
      ? 'cursor-pointer hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150'
      : '';

    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ color = 'coral', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${headerColorStyles[color]} p-2 sm:p-4 border-b-2 sm:border-b-4 border-black ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardHeader.displayName = 'CardHeader';

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`p-4 sm:p-6 ${className}`} {...props}>
        {children}
      </div>
    );
  },
);

CardContent.displayName = 'CardContent';

export default Card;
export { Card, CardContent, CardHeader };
export type { CardContentProps, CardHeaderProps, CardProps, CardVariant };
