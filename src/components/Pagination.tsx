'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // optional: how many pages to skip with double arrow
  skipSize?: number;
}

function getPageItems(totalPages: number, currentPage: number): Array<number | 'dots'> {
  const items: Array<number | 'dots'> = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) items.push(i);
    return items;
  }

  const left = Math.max(2, currentPage - 2);
  const right = Math.min(totalPages - 1, currentPage + 2);

  items.push(1);

  if (left > 2) {
    items.push('dots');
  } else {
    for (let i = 2; i < left; i++) items.push(i);
  }

  for (let i = left; i <= right; i++) items.push(i);

  if (right < totalPages - 1) {
    items.push('dots');
  } else {
    for (let i = right + 1; i < totalPages; i++) items.push(i);
  }

  items.push(totalPages);
  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  skipSize = 10,
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const skipLeft = Math.max(1, currentPage - skipSize);
  const skipRight = Math.min(totalPages, currentPage + skipSize);

  return (
    <div className="flex gap-4 justify-center flex-wrap items-center my-4">
      {/* skip left */}
      {currentPage === 1 || skipLeft === currentPage ? (
        <span className="px-4 py-3 font-bold text-black opacity-50">««</span>
      ) : (
        <button
          onClick={() => handlePageChange(skipLeft)}
          className="px-4 py-3 font-bold border-2 border-black text-black bg-white hover:bg-[#FF5E5B] transition-colors"
        >
          ««
        </button>
      )}

      {getPageItems(totalPages, currentPage).map((item, idx) => {
        if (item === 'dots') {
          return (
            <span key={`dots-${idx}`} className="px-4 py-3 font-bold text-black">
              ...
            </span>
          );
        }

        const page = item as number;
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-6 py-3 font-bold border-2 border-black text-black ${
              isActive
                ? 'bg-[#FF5E5B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white hover:bg-[#FF5E5B] transition-colors'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* skip right */}
      {currentPage === totalPages || skipRight === currentPage ? (
        <span className="px-4 py-3 font-bold text-black opacity-50">»»</span>
      ) : (
        <button
          onClick={() => handlePageChange(skipRight)}
          className="px-4 py-3 font-bold border-2 border-black text-black bg-white hover:bg-[#FF5E5B] transition-colors"
        >
          »»
        </button>
      )}
    </div>
  );
}
