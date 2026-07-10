'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { useState, useMemo, useRef } from 'react'

interface CSVPreviewTableProps {
  isVisible: boolean
  headers: string[]
  rows: any[]
}

export function CSVPreviewTable({ isVisible, headers, rows }: CSVPreviewTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const parentRef = useRef<HTMLDivElement>(null)

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<any>()
    return headers.map(header => 
      columnHelper.accessor(header, {
        header: header,
        cell: info => <span className="max-w-[300px] truncate block">{String(info.getValue() || '')}</span>,
        size: 180,
      })
    )
  }, [headers])

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const { rows: flatRows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45, // Estimated row height in pixels
    overscan: 10,
  })

  if (!isVisible) return null

  const virtualItems = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0
  const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-card/50 p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder-muted-foreground outline-none"
          />
          <span className="text-xs text-muted-foreground font-medium">
            {flatRows.length} rows
          </span>
        </div>
      </div>

      <div 
        ref={parentRef} 
        className="overflow-auto max-h-[450px] relative border-b border-border"
        style={{ scrollbarGutter: 'stable' }}
      >
        <table className="w-full text-sm table-fixed">
          <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
            <tr className="border-b border-border">
              {table.getHeaderGroups()[0].headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap select-none"
                  style={{ width: header.getSize() }}
                >
                  <button
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span>
                        {header.column.getIsSorted() === 'asc' && (
                          <ChevronUp className="h-3 w-3" />
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flatRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No preview data available.
                </td>
              </tr>
            ) : (
              <>
                {paddingTop > 0 && (
                  <tr>
                    <td style={{ height: `${paddingTop}px` }} colSpan={columns.length} />
                  </tr>
                )}
                {virtualItems.map((virtualRow) => {
                  const row = flatRows[virtualRow.index]
                  return (
                    <tr 
                      key={row.id} 
                      ref={rowVirtualizer.measureElement}
                      data-index={virtualRow.index}
                      className="border-b border-border/50 hover:bg-card/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )
                })}
                {paddingBottom > 0 && (
                  <tr>
                    <td style={{ height: `${paddingBottom}px` }} colSpan={columns.length} />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
