'use client';
import { MoonLoader } from 'react-spinners';

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <MoonLoader color="#4F46E5" size={50} />
    </div>
  );
}
