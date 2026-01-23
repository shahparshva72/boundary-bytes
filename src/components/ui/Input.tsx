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
  sm: 'px-1.5 py-1 text-xs',
  md: 'px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm',
  lg: 'px-2 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base',
};

const baseStyles =
  'w-full bg-white border-2 border-black font-medium placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-150';

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
