import Link from 'next/link';

interface PlayersPaginationProps {
  currentPage: number;
  totalPages: number;
  range?: number;
}

type PageItem = number | 'dots';

function getPageItems(totalPages: number, currentPage: number, range: number): PageItem[] {
  const items: PageItem[] = [];
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

function pageHref(page: number): string {
  return page <= 1 ? '/players' : `/players?page=${page}`;
}

const pageLinkClasses =
  'px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold border-2 border-black text-black text-xs sm:text-sm';
const activeClasses =
  'bg-[#FF5E5B] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
const inactiveClasses = 'bg-white hover:bg-[#FF5E5B] transition-colors';
const disabledClasses =
  'px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold text-black opacity-50 text-xs sm:text-sm';

export default function PlayersPagination({
  currentPage,
  totalPages,
  range = 2,
}: PlayersPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Players directory pagination"
      className="flex gap-1 sm:gap-1.5 md:gap-2 justify-center flex-wrap items-center my-2 sm:my-2.5 px-2"
    >
      {hasPrev ? (
        <Link
          href={pageHref(currentPage - 1)}
          rel="prev"
          className={`${pageLinkClasses} ${inactiveClasses}`}
        >
          « Prev
        </Link>
      ) : (
        <span className={disabledClasses}>« Prev</span>
      )}

      <div className="flex gap-1 sm:gap-1.5 md:gap-2 items-center">
        {getPageItems(totalPages, currentPage, range).map((item, idx) => {
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

          const page = item;
          const isActive = page === currentPage;
          return isActive ? (
            <span key={page} aria-current="page" className={`${pageLinkClasses} ${activeClasses}`}>
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={pageHref(page)}
              className={`${pageLinkClasses} ${inactiveClasses}`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {hasNext ? (
        <Link
          href={pageHref(currentPage + 1)}
          rel="next"
          className={`${pageLinkClasses} ${inactiveClasses}`}
        >
          Next »
        </Link>
      ) : (
        <span className={disabledClasses}>Next »</span>
      )}
    </nav>
  );
}
