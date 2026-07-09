'use client'

import { motion } from 'framer-motion'
import { Upload, Eye, Zap, CheckCircle2 } from 'lucide-react'

const workflowSteps = [
  {
    number: 1,
    title: 'Upload CSV',
    description: 'Upload any valid CSV',
    icon: Upload,
  },
  {
    number: 2,
    title: 'Preview Data',
    description: 'Review and verify records',
    icon: Eye,
  },
  {
    number: 3,
    title: 'AI Field Mapping',
    description: 'AI automatically detects and maps CRM fields',
    icon: Zap,
  },
  {
    number: 4,
    title: 'Import Complete',
    description: 'Review imported and skipped records',
    icon: CheckCircle2,
  },
]

export function WorkflowSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-2">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon
          return (
            <motion.div key={step.number} variants={itemVariants} className="relative">
              {/* Connecting line to next step (hidden on mobile, shown on md+) */}
              {index < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-1 w-full h-0.5 bg-gradient-to-r from-border to-transparent pointer-events-none" />
              )}

              {/* Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-accent/10 transition-colors pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  {/* Step number */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-semibold text-sm">
                      {step.number}
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
