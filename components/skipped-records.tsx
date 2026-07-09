'use client'

import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { useState } from 'react'


interface SkippedRecordsProps {
  isVisible: boolean
  skipped: any[]
}

export function SkippedRecords({ isVisible, skipped }: SkippedRecordsProps) {
  const [expanded, setExpanded] = useState(false)

  if (!isVisible) return null

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between bg-card/50 border-b border-border p-4 hover:bg-card/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <span className="font-semibold text-foreground">Skipped Records ({skipped.length})</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="divide-y divide-border">
          {skipped.map((record, index) => (
            <div key={index} className="p-4 hover:bg-card/50 transition-colors">
              <div className="mb-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Reason
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{record.reason}</p>
              </div>

              <div className="mb-3">
                <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Original Row
                </div>
                <div className="rounded-lg bg-card/50 p-2 font-mono text-xs text-muted-foreground overflow-x-auto">
                  <div className="whitespace-nowrap">
                    {record.originalRow.join(' | ')}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Preview
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(record.preview).map(([key, value]) => (
                    <div key={key} className="rounded bg-card/50 p-2">
                      <div className="text-xs text-muted-foreground">{key}</div>
                      <div className="text-sm font-medium text-foreground truncate">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
