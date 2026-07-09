'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Zap,
  Database,
  Sparkles,
} from 'lucide-react'

interface SummaryCardsProps {
  isVisible: boolean
  summary: any
}

function AnimatedCounter({ from, to, duration }: { from: number; to: number; duration: number }) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      setCount(Math.round(from + (to - from) * progress))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [from, to, duration])

  return <>{count}</>
}

export function SummaryCards({ isVisible, summary }: SummaryCardsProps) {
  if (!isVisible || !summary) return null

  const stats = [
    {
      icon: CheckCircle2,
      title: 'Successfully Imported',
      value: summary.imported || 0,
      description: 'records',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: XCircle,
      title: 'Skipped Records',
      value: summary.skipped || 0,
      description: 'excluded',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Success Rate',
      value: summary.totalRows > 0 ? `${Math.round(((summary.imported || 0) / summary.totalRows) * 100)}%` : '0%',
      description: 'accuracy',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Zap,
      title: 'Processing Time',
      value: summary.processingTime || '0s',
      description: 'total duration',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Database,
      title: 'Total Rows',
      value: summary.totalRows || 0,
      description: 'processed',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Sparkles,
      title: 'Average AI Confidence',
      value: `${summary.averageConfidence ? Math.round(summary.averageConfidence * 100) : 0}%`,
      description: 'prediction accuracy',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-foreground mb-8"
      >
        Import Summary
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:border-accent/50 hover:bg-card transition-all"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-accent/10 transition-colors pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`rounded-lg p-3 ${stat.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
