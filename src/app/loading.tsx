import { MoonLoader } from 'react-spinners';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <MoonLoader color="#1a202c" size={32} />
    </div>
  );
}
