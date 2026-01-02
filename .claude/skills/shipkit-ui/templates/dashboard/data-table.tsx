/**
 * DataTable
 * A sortable, filterable data table for dashboards.
 * Best for: User management, order lists, content tables
 */

'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface Column<T> {
  /** Column key (must match data object key) */
  key: keyof T;
  /** Column header label */
  label: string;
  /** Is column sortable? */
  sortable?: boolean;
  /** Custom render function */
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface Action<T> {
  /** Action label */
  label: string;
  /** Action handler */
  onClick: (row: T) => void;
  /** Is this a destructive action? */
  destructive?: boolean;
}

interface DataTableProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Row actions */
  actions?: Action<T>[];
  /** Enable search */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Searchable fields */
  searchFields?: (keyof T)[];
  /** Items per page */
  pageSize?: number;
  /** Additional CSS classes */
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchFields,
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data by search
  const filteredData = useMemo(() => {
    if (!search) return data;

    const fieldsToSearch = searchFields || columns.map((c) => c.key);
    return data.filter((row) =>
      fieldsToSearch.some((field) => {
        const value = row[field];
        return String(value).toLowerCase().includes(search.toLowerCase());
      })
    );
  }, [data, search, searchFields, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {sortedData.length} result{sortedData.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      {column.label}
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              {actions && actions.length > 0 && (
                <TableHead className="w-[50px]"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? '')}
                    </TableCell>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                              className={
                                action.destructive ? 'text-destructive' : ''
                              }
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Example usage with type-safe columns:
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   status: 'active' | 'inactive';
//   createdAt: string;
// }
//
// const columns: Column<User>[] = [
//   { key: 'name', label: 'Name', sortable: true },
//   { key: 'email', label: 'Email', sortable: true },
//   {
//     key: 'status',
//     label: 'Status',
//     render: (value) => (
//       <Badge variant={value === 'active' ? 'default' : 'secondary'}>
//         {value}
//       </Badge>
//     ),
//   },
//   { key: 'createdAt', label: 'Created', sortable: true },
// ];
//
// <DataTable
//   data={users}
//   columns={columns}
//   actions={[
//     { label: 'Edit', onClick: (user) => console.log('Edit', user) },
//     { label: 'Delete', onClick: (user) => console.log('Delete', user), destructive: true },
//   ]}
// />
