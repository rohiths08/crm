'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const capabilities = [
  'AI Column Detection',
  'Smart Field Mapping',
  'Duplicate Detection',
  'CSV Validation',
  'Batch Processing',
  'Import Analytics',
]

export function CompactCapabilities() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="text-sm font-semibold text-foreground">AI Capabilities</h3>
      <div className="grid grid-cols-1 gap-2">
        {capabilities.map((capability, index) => (
          <motion.div
            key={capability}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center gap-2 py-1.5"
          >
            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
            <span className="text-xs text-foreground">{capability}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
