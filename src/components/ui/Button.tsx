'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  shadow?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#FFED66] text-black hover:bg-[#FFED66]/80 border-2 border-black',
  secondary: 'bg-[#4ECDC4] text-black hover:bg-[#4ECDC4]/80 border-2 border-black',
  danger: 'bg-[#FF5E5B] text-black hover:bg-[#FF5E5B]/80 border-2 border-black',
  ghost: 'bg-white text-black hover:bg-[#FFED66] border-2 border-black',
  outline: 'bg-transparent text-black hover:bg-white border-2 border-black',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm',
  md: 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base',
  lg: 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      shadow = true,
      className = '',
      disabled,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'font-bold transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';

    const shadowStyles = shadow
      ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]'
      : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${shadowStyles} ${className}`}
        disabled={disabled || isLoading}
        style={style}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⟳</span>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
export { Button };
export type { ButtonProps, ButtonSize, ButtonVariant };
