'use client';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <div className="flex justify-center items-center space-x-4 p-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-6 py-3 bg-[#FFED66] border-4 border-black rounded-none shadow-[4px_4px_0_#000]
            hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-150
            disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0`}
        >
          <span className="text-xl font-black text-black uppercase tracking-wide">
            Previous
          </span>
        </button>
        <div
          className="px-6 py-3 bg-white border-4 border-black rounded-none"
        >
          <span className="text-xl font-black text-black uppercase tracking-wide">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-6 py-3 bg-[#FFED66] border-4 border-black rounded-none shadow-[4px_4px_0_#000]
            hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-150
            disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0`}
        >
          <span className="text-xl font-black text-black uppercase tracking-wide">
            Next
          </span>
        </button>
      </div>
    </div>
  );
}
