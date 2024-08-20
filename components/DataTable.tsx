'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from './ui/button';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { decryptKey } from '@/lib/utils';
import { redirect } from 'next/navigation';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [isClient, setIsClient] = useState(false);
  const [accessKey, setAccessKey] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      const encryptedKey = window.localStorage.getItem('accessKey');
      if (encryptedKey) {
        const decryptedKey = decryptKey(encryptedKey);
        setAccessKey(decryptedKey);
      }
    }
  }, []);

  useEffect(() => {
    if (accessKey && accessKey !== process.env.NEXT_PUBLIC_ADMIN_PASSKEY) {
      redirect('/');
    }
  }, [accessKey]);

  const memoizedData = useMemo(() => data, [data]);
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Always call useReactTable, no conditionals
  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!isClient) {
    return null; // Render nothing on the server to avoid mismatches
  }

  return (
    <div className='data-table'>
      <Table className='shad-table'>
        <TableHeader className='bg-dark-200'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='shad-table-row-header'>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className='shad-table-row'
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {[
                      flexRender(cell.column.columnDef.cell, cell.getContext()),
                    ]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className='table-actions'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className='shad-gray-btn'
        >
          <Image
            src='/assets/icons/arrow.svg'
            width={24}
            height={24}
            alt='arrow'
          />
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <Image
            src='/assets/icons/arrow.svg'
            width={24}
            height={24}
            alt='arrow '
            className='rotate-180'
          />
        </Button>
      </div>
    </div>
  );
}
