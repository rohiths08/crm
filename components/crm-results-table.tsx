'use client'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Button } from './ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useMemo, useState, useRef } from 'react'

const columnHelper = createColumnHelper<any>()

const crmStatusColors: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  SALE_DONE: 'bg-green-500/10 text-green-700 dark:text-green-400',
  BAD_LEAD: 'bg-red-500/10 text-red-700 dark:text-red-400',
  DID_NOT_CONNECT: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
}

const crmStatusLabels: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'Good Lead - Follow Up',
  SALE_DONE: 'Sale Done',
  BAD_LEAD: 'Bad Lead',
  DID_NOT_CONNECT: 'Did Not Connect',
}

const columns = [
  columnHelper.accessor('created_at', {
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    header: 'Created At',
    size: 120,
  }),
  columnHelper.accessor('name', {
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    header: 'Lead Name',
    size: 150,
  }),
  columnHelper.accessor('email', {
    cell: (info) => <span className="text-accent text-xs">{info.getValue()}</span>,
    header: 'Email',
    size: 200,
  }),
  columnHelper.accessor('country_code', {
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    header: 'Country Code',
    size: 80,
  }),
  columnHelper.accessor('mobile_without_country_code', {
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    header: 'Mobile Number',
    size: 120,
  }),
  columnHelper.accessor('company', {
    cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    header: 'Company',
    size: 150,
  }),
  columnHelper.accessor('city', {
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    header: 'City',
    size: 100,
  }),
  columnHelper.accessor('state', {
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    header: 'State',
    size: 80,
  }),
  columnHelper.accessor('country', {
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    header: 'Country',
    size: 100,
  }),
  columnHelper.accessor('lead_owner', {
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    header: 'Lead Owner',
    size: 120,
  }),
  columnHelper.accessor('crm_status', {
    cell: (info) => (
      <span
        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
          crmStatusColors[info.getValue()] || 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
        }`}
      >
        {crmStatusLabels[info.getValue()] || info.getValue()}
      </span>
    ),
    header: 'CRM Status',
    size: 180,
  }),
  columnHelper.accessor('crm_note', {
    cell: (info) => <span className="text-xs text-muted-foreground max-w-sm truncate">{info.getValue()}</span>,
    header: 'CRM Note',
    size: 250,
  }),
  columnHelper.accessor('data_source', {
    cell: (info) => (
      <span className="inline-block rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
        {info.getValue()}
      </span>
    ),
    header: 'Data Source',
    size: 130,
  }),
  columnHelper.accessor('possession_time', {
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    header: 'Possession Time',
    size: 120,
  }),
]

interface CRMResultsTableProps {
  isVisible: boolean
  records: any[]
}

export function CRMResultsTable({ isVisible, records }: CRMResultsTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  // Filter records based on selected status and/or source
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const statusLabel = crmStatusLabels[r.crm_status] || r.crm_status || 'Unknown'
      const sourceLabel = r.data_source || 'Unknown'
      
      if (selectedStatus && statusLabel !== selectedStatus) return false
      if (selectedSource && sourceLabel !== selectedSource) return false
      return true
    })
  }, [records, selectedStatus, selectedSource])

  const table = useReactTable({
    data: filteredRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const { rows: flatRows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 10,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0
  const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0

  const statusData = useMemo(() => {
    const counts = records.reduce((acc, curr) => {
      const status = crmStatusLabels[curr.crm_status] || curr.crm_status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [records])

  const sourceData = useMemo(() => {
    const counts = records.reduce((acc, curr) => {
      const source = curr.data_source || 'Unknown'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [records])

  const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899']

  if (!isVisible) return null

  return (
    <div className="space-y-8">
      {/* Analytics Dashboard */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-foreground">CRM Status Distribution</h3>
              {selectedStatus && (
                <button
                  onClick={() => setSelectedStatus(null)}
                  className="text-xs text-accent hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">Click a slice to filter the table below</p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(data) => {
                      if (data && data.name) {
                        setSelectedStatus(selectedStatus === data.name ? null : data.name)
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {statusData.map((entry, index) => {
                      const isSelected = selectedStatus === entry.name
                      const hasSelection = selectedStatus !== null
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          opacity={hasSelection && !isSelected ? 0.3 : 1}
                          stroke={isSelected ? '#ffffff' : 'none'}
                          strokeWidth={2}
                          style={{ outline: 'none' }}
                        />
                      )
                    })}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-foreground">Top Lead Sources</h3>
              {selectedSource && (
                <button
                  onClick={() => setSelectedSource(null)}
                  className="text-xs text-accent hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">Click a bar to filter the table below</p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--accent))"
                    radius={[0, 4, 4, 0]}
                    onClick={(data) => {
                      if (data && data.name) {
                        setSelectedSource(selectedSource === data.name ? null : data.name)
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {sourceData.map((entry, index) => {
                      const isSelected = selectedSource === entry.name
                      const hasSelection = selectedSource !== null
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          opacity={hasSelection && !isSelected ? 0.3 : 1}
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Banner */}
      {(selectedStatus || selectedSource) && (
        <div className="flex items-center justify-between bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 rounded-xl p-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider">Active Filters:</span>
            {selectedStatus && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus(null)} className="hover:text-red-500 ml-1 font-bold text-sm">×</button>
              </span>
            )}
            {selectedSource && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
                Source: {selectedSource}
                <button onClick={() => setSelectedSource(null)} className="hover:text-red-500 ml-1 font-bold text-sm">×</button>
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStatus(null)
              setSelectedSource(null)
            }}
            className="text-xs text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-card/50 p-4 flex justify-between items-center">
          <h3 className="font-semibold text-foreground">Imported Records</h3>
          <span className="text-xs text-muted-foreground font-medium">
            Showing {filteredRecords.length} of {records.length} records
          </span>
        </div>

        <div 
          ref={parentRef} 
          className="overflow-auto max-h-[450px] relative border-b border-border"
          style={{ scrollbarGutter: 'stable' }}
        >
          <table className="w-full text-xs table-fixed">
            <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
              <tr className="border-b border-border">
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap bg-card/95 select-none"
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    No records match the active filter criteria.
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
    </div>
  )
}
