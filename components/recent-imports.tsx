'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, File } from 'lucide-react'

const recentImports = [
  {
    name: 'Facebook_Leads.csv',
    rows: 245,
    status: 'Completed',
    date: 'Today',
  },
  {
    name: 'GoogleAds.csv',
    rows: 182,
    status: 'Completed',
    date: 'Yesterday',
  },
  {
    name: 'HubSpot.csv',
    rows: 980,
    status: 'Completed',
    date: '2 days ago',
  },
]

export function RecentImports() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Recent Imports</h3>
        <p className="text-sm text-muted-foreground mt-1">Your import history</p>
      </div>

      <div className="space-y-3">
        {recentImports.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 hover:border-accent/50 hover:bg-card transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <File className="h-5 w-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.rows} rows</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs font-medium text-accent flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {item.status}
                </p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
