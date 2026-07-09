'use client'

import { motion } from 'framer-motion'

const stats = [
  {
    label: 'CSV Formats Supported',
    value: '20+',
  },
  {
    label: 'CRM Fields',
    value: '15',
  },
  {
    label: 'Average Import Accuracy',
    value: '98%',
  },
  {
    label: 'Files Processed',
    value: '10K+',
  },
]

export function StatisticsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center hover:bg-card/80 transition-colors"
          >
            <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">{stat.value}</div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
