'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  skipSize?: number;
}

function getPageItems(
  totalPages: number,
  currentPage: number,
  range: number,
): Array<number | 'dots'> {
  const items: Array<number | 'dots'> = [];
  const maxVisible = range * 2 + 3;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
    return items;
  }

  const left = Math.max(2, currentPage - range);
  const right = Math.min(totalPages - 1, currentPage + range);

  items.push(1);

  if (left > 2) {
    items.push('dots');
  } else {
    for (let i = 2; i < left; i++) {
      items.push(i);
    }
  }

  for (let i = left; i <= right; i++) {
    items.push(i);
  }

  if (right < totalPages - 1) {
    items.push('dots');
  } else {
    for (let i = right + 1; i < totalPages; i++) {
      items.push(i);
    }
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
    <div className="flex gap-1 sm:gap-1.5 md:gap-2 justify-center flex-wrap items-center my-2 sm:my-2.5 px-2">
      {currentPage === 1 || skipLeft === currentPage ? (
        <span className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 font-bold text-black opacity-50 text-xs sm:text-sm">
          ««
        </span>
      ) : (
        <button
          onClick={() => handlePageChange(skipLeft)}
          className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 font-bold border-2 border-black text-black bg-white hover:bg-[#FF5E5B] transition-colors text-xs sm:text-sm"
        >
          ««
        </button>
      )}

      <div className="hidden sm:flex gap-1 sm:gap-1.5 md:gap-2 items-center">
        {getPageItems(totalPages, currentPage, 2).map((item, idx) => {
          if (item === 'dots') {
            return (
              <span
                key={`dots-${idx}`}
                className="px-1 sm:px-1.5 md:px-2 py-1.5 sm:py-2 font-bold text-black text-xs sm:text-sm"
              >
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
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold border-2 border-black text-black text-xs sm:text-sm ${
                isActive
                  ? 'bg-[#FF5E5B] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-[#FF5E5B] transition-colors'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <div className="flex sm:hidden gap-1 items-center">
        {getPageItems(totalPages, currentPage, 1).map((item, idx) => {
          if (item === 'dots') {
            return (
              <span key={`dots-mobile-${idx}`} className="px-1 py-1.5 font-bold text-black text-xs">
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
              className={`px-2 py-1.5 font-bold border-2 border-black text-black text-xs ${
                isActive
                  ? 'bg-[#FF5E5B] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white hover:bg-[#FF5E5B] transition-colors'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {currentPage === totalPages || skipRight === currentPage ? (
        <span className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 font-bold text-black opacity-50 text-xs sm:text-sm">
          »»
        </span>
      ) : (
        <button
          onClick={() => handlePageChange(skipRight)}
          className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 font-bold border-2 border-black text-black bg-white hover:bg-[#FF5E5B] transition-colors text-xs sm:text-sm"
        >
          »»
        </button>
      )}
    </div>
  );
}
