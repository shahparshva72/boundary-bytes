'use client';

import { MoonLoader } from 'react-spinners';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
}

const sizeMap: Record<SpinnerSize, number> = {
  sm: 24,
  md: 48,
  lg: 64,
};

const Spinner = ({ size = 'md', color = '#FF5E5B', className = '' }: SpinnerProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <MoonLoader color={color} size={sizeMap[size]} />
    </div>
  );
};

export default Spinner;
export { Spinner };
export type { SpinnerProps, SpinnerSize };
