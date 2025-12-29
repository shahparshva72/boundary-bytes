'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  error?: boolean;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  inputSize?: InputSize;
  error?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-2 py-1.5 text-xs sm:text-sm',
  md: 'px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base',
  lg: 'px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg',
};

const baseStyles =
  'w-full bg-white border-2 border-black font-medium placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-150';

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = 'md', error = false, className = '', ...props }, ref) => {
    const errorStyles = error ? 'border-[#FF5E5B] focus:border-[#FF5E5B]' : '';

    return (
      <input
        ref={ref}
        className={`${baseStyles} ${sizeStyles[inputSize]} ${errorStyles} ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ inputSize = 'md', error = false, className = '', ...props }, ref) => {
    const errorStyles = error ? 'border-[#FF5E5B] focus:border-[#FF5E5B]' : '';

    return (
      <textarea
        ref={ref}
        className={`${baseStyles} ${sizeStyles[inputSize]} ${errorStyles} resize-none ${className}`}
        {...props}
      />
    );
  },
);

TextArea.displayName = 'TextArea';

export default Input;
export { Input, TextArea };
export type { InputProps, InputSize, TextAreaProps };
