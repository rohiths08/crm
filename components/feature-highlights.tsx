'use client'

import { motion } from 'framer-motion'
import { Zap, Cpu, BarChart3, Lock } from 'lucide-react'

const features = [
  {
    icon: Cpu,
    title: 'AI Column Detection',
    description: 'Automatically identifies columns even when names differ from standard formats.',
  },
  {
    icon: Zap,
    title: 'Smart Field Mapping',
    description: 'Maps customer information into GrowEasy fields with intelligent matching.',
  },
  {
    icon: BarChart3,
    title: 'Import Analytics',
    description: 'Review imported and skipped records instantly with detailed analytics.',
  },
  {
    icon: Lock,
    title: 'Production Ready',
    description: 'Supports large CSVs with reliable processing and data validation.',
  },
]

export function FeatureHighlights() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.4,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <motion.section
      className="mb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-accent/10 transition-colors pointer-events-none" />

              <div className="relative z-10 space-y-4">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent"
                >
                  <Icon className="h-6 w-6" />
                </motion.div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
