'use client';

import { forwardRef, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

type HeaderColor = 'coral' | 'teal' | 'yellow' | 'gold';

interface DataTableProps extends HTMLAttributes<HTMLDivElement> {
  minWidth?: string;
}

interface DataTableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  color?: HeaderColor;
}

interface DataTableHeadCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  isLast?: boolean;
}

interface DataTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  index?: number;
  striped?: boolean;
}

interface DataTableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  isLast?: boolean;
}

interface DataTableEmptyProps extends HTMLAttributes<HTMLTableRowElement> {
  colSpan: number;
  message?: string;
}

const headerColorStyles: Record<HeaderColor, string> = {
  coral: 'bg-[#FF5E5B]',
  teal: 'bg-[#4ECDC4]',
  yellow: 'bg-[#FFED66]',
  gold: 'bg-[#FFC700]',
};

const DataTable = forwardRef<HTMLDivElement, DataTableProps>(
  ({ minWidth = '600px', className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`overflow-x-auto ${className}`} {...props}>
        <table className="w-full border-2 border-black" style={{ minWidth }}>
          {children}
        </table>
      </div>
    );
  },
);
DataTable.displayName = 'DataTable';

const DataTableHeader = forwardRef<HTMLTableSectionElement, DataTableHeaderProps>(
  ({ color = 'teal', className = '', children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={`${headerColorStyles[color]} border-b-2 border-black ${className}`}
        {...props}
      >
        {children}
      </thead>
    );
  },
);
DataTableHeader.displayName = 'DataTableHeader';

const DataTableHeadCell = forwardRef<HTMLTableCellElement, DataTableHeadCellProps>(
  ({ isLast = false, className = '', children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-2.5 text-left text-xs sm:text-sm md:text-base font-black text-black uppercase tracking-wide whitespace-nowrap ${
          isLast ? '' : 'border-r-2 border-black'
        } ${className}`}
        {...props}
      >
        {children}
      </th>
    );
  },
);
DataTableHeadCell.displayName = 'DataTableHeadCell';

const DataTableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <tbody ref={ref} className={className} {...props}>
        {children}
      </tbody>
    );
  },
);
DataTableBody.displayName = 'DataTableBody';

const DataTableRow = forwardRef<HTMLTableRowElement, DataTableRowProps>(
  ({ index = 0, striped = true, className = '', children, ...props }, ref) => {
    const bgColor = striped ? (index % 2 === 0 ? 'bg-white' : 'bg-[#FFED66]') : 'bg-white';

    return (
      <tr
        ref={ref}
        className={`${bgColor} border-b-2 border-black hover:bg-[#FFED66] transition-colors duration-150 ${className}`}
        {...props}
      >
        {children}
      </tr>
    );
  },
);
DataTableRow.displayName = 'DataTableRow';

const DataTableCell = forwardRef<HTMLTableCellElement, DataTableCellProps>(
  ({ isLast = false, className = '', children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-base font-bold text-black whitespace-nowrap ${
          isLast ? '' : 'border-r-2 border-black'
        } ${className}`}
        {...props}
      >
        {children}
      </td>
    );
  },
);
DataTableCell.displayName = 'DataTableCell';

const DataTableEmpty = forwardRef<HTMLTableRowElement, DataTableEmptyProps>(
  ({ colSpan, message = 'No data available', className = '', ...props }, ref) => {
    return (
      <tr ref={ref} className={className} {...props}>
        <td
          colSpan={colSpan}
          className="px-2 sm:px-3 py-3 sm:py-4 text-sm sm:text-base font-bold text-black text-center"
        >
          {message}
        </td>
      </tr>
    );
  },
);
DataTableEmpty.displayName = 'DataTableEmpty';

export {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHeadCell,
  DataTableHeader,
  DataTableRow,
};

export type {
  DataTableCellProps,
  DataTableEmptyProps,
  DataTableHeadCellProps,
  DataTableHeaderProps,
  DataTableProps,
  DataTableRowProps,
};
