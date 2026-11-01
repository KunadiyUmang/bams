'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
} from 'lucide-react';
import { Pagination } from './Pagination';
import { LoadingSpinner } from './LoadingSpinner';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  accessor?: (row: T) => any;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'danger';
  show?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T | ((row: T) => string);
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T | ((row: T) => string))[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;
  // Row actions
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  customActions?: DataTableAction<T>[];
  // Pagination
  paginated?: boolean;
  pageSize?: number;
  // External filter/tools
  extraHeaderActions?: React.ReactNode;
  emptyMessage?: string;
  striped?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  isLoading = false,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchFields,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  customActions = [],
  paginated = true,
  pageSize = 10,
  extraHeaderActions,
  emptyMessage = 'No records found',
  striped = true,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  const getRowId = (row: T, index: number): string => {
    if (typeof keyField === 'function') return keyField(row);
    if (row && keyField in row) return String(row[keyField]);
    return String(index);
  };

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = typeof field === 'function' ? field(row) : row[field];
          return val ? String(val).toLowerCase().includes(lower) : false;
        });
      }
      // Default: match against all string / number fields
      return Object.values(row).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(lower);
        }
        return false;
      });
    });
  }, [data, searchTerm, searchFields]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const activeColumn = columns.find((c) => c.key === sortKey);

    return [...filteredData].sort((a, b) => {
      let valA: any = activeColumn?.accessor ? activeColumn.accessor(a) : a[sortKey];
      let valB: any = activeColumn?.accessor ? activeColumn.accessor(b) : b[sortKey];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(String(valB));
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    if (!paginated) return sortedData;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, paginated, currentPage, itemsPerPage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Selection
  const allCurrentSelected =
    currentData.length > 0 &&
    currentData.every((row, i) =>
      selectedRows.some((sel, si) => getRowId(sel, si) === getRowId(row, i))
    );
  const someCurrentSelected =
    currentData.some((row, i) =>
      selectedRows.some((sel, si) => getRowId(sel, si) === getRowId(row, i))
    ) && !allCurrentSelected;

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allCurrentSelected) {
      // Remove all current page items
      const next = selectedRows.filter(
        (sel, si) => !currentData.some((r, ri) => getRowId(r, ri) === getRowId(sel, si))
      );
      onSelectionChange(next);
    } else {
      // Add all current page items not already selected
      const toAdd = currentData.filter(
        (r, ri) => !selectedRows.some((sel, si) => getRowId(sel, si) === getRowId(r, ri))
      );
      onSelectionChange([...selectedRows, ...toAdd]);
    }
  };

  const toggleSelectRow = (row: T, idx: number) => {
    if (!onSelectionChange) return;
    const rowId = getRowId(row, idx);
    const isSelected = selectedRows.some((sel, si) => getRowId(sel, si) === rowId);
    if (isSelected) {
      onSelectionChange(selectedRows.filter((sel, si) => getRowId(sel, si) !== rowId));
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const hasActions = onView || onEdit || onDelete || customActions.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Top Header / Search / Filter Bar */}
      {(searchable || extraHeaderActions) && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          {searchable ? (
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {extraHeaderActions}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-[2px] z-10 flex items-center justify-center min-h-[220px]">
            <LoadingSpinner size="md" label="Loading data..." />
          </div>
        )}

        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold select-none">
              {selectable && (
                <th className="py-3.5 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {allCurrentSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : someCurrentSelected ? (
                      <MinusSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 ${
                      col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750' : ''
                    } ${col.headerClassName || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {hasActions && (
                <th className="py-3.5 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentData.length === 0 && !isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)}
                  className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentData.map((row, index) => {
                const rowId = getRowId(row, index);
                const isSelected = selectedRows.some((sel, si) => getRowId(sel, si) === rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-blue-50/40 dark:hover:bg-slate-800/60' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    } ${striped && index % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-850/30' : ''} ${
                      isSelected ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {selectable && (
                      <td
                        className="py-3 px-4 w-10 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectRow(row, index);
                        }}
                      >
                        <button type="button" className="text-slate-400 hover:text-slate-600">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}

                    {columns.map((col) => {
                      const value = col.accessor ? col.accessor(row) : row[col.key];
                      return (
                        <td
                          key={col.key}
                          className={`py-3 px-4 text-slate-700 dark:text-slate-300 ${
                            col.className || ''
                          }`}
                        >
                          {col.render ? col.render(row) : value !== undefined && value !== null ? String(value) : '—'}
                        </td>
                      );
                    })}

                    {hasActions && (
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {onView && (
                            <button
                              type="button"
                              onClick={() => onView(row)}
                              title="View Details"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(row)}
                              title="Edit Record"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(row)}
                              title="Delete Record"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {customActions.map((action, ai) => {
                            if (action.show && !action.show(row)) return null;
                            return (
                              <button
                                key={`ca-${ai}`}
                                type="button"
                                onClick={() => action.onClick(row)}
                                title={action.label}
                                className={`p-1.5 rounded transition ${
                                  action.variant === 'danger'
                                    ? 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-slate-800'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                {action.icon || action.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {paginated && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}

export default DataTable;
