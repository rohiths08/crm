'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const capabilities = [
  'AI Column Detection',
  'Smart Field Mapping',
  'Batch Processing',
  'Duplicate Detection',
  'CSV Validation',
  'Import Analytics',
]

interface CapabilityBadgesProps {
  gridClassName?: string
}

export function CapabilityBadges({ gridClassName = "grid-cols-1 sm:grid-cols-2" }: CapabilityBadgesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Capabilities</h3>
        <p className="text-sm text-muted-foreground mt-1">What makes our importer powerful</p>
      </div>

      <div className={`grid gap-3 ${gridClassName}`}>
        {capabilities.map((capability, index) => (
          <motion.div
            key={capability}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3 hover:border-accent/50 hover:bg-card transition-all"
          >
            <Check className="h-5 w-5 text-accent flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">{capability}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
