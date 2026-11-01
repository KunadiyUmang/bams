import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= itemsPerPage)) {
    return null;
  }

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : currentPage * itemsPerPage;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-sm ${className}`}
    >
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
        {totalItems !== undefined ? (
          <span>
            Showing <strong className="text-slate-700 dark:text-slate-200">{startItem}</strong> to{' '}
            <strong className="text-slate-700 dark:text-slate-200">{endItem}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-700 dark:text-slate-200">{currentPage}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{totalPages}</strong>
          </span>
        )}

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs">Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 text-xs">
                ...
              </span>
            ) : (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(Number(p))}
                className={`min-w-[32px] h-8 px-2 text-xs font-medium rounded-md transition ${
                  p === currentPage
                    ? 'bg-[#142B4A] dark:bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
