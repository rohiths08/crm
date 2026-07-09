'use client'

import { motion } from 'framer-motion'
import { HeroSection } from './hero-section'
import { StatisticsSection } from './statistics-section'
import { WorkflowSection } from './workflow-section'
import { FeatureHighlights } from './feature-highlights'
import { Button } from './ui/button'

interface EmptyStateProps {
  onGetStarted?: () => void
}

export function EmptyState({ onGetStarted }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-24"
    >
      {/* Hero */}
      <HeroSection />

      {/* Statistics */}
      <StatisticsSection />

      {/* Workflow */}
      <WorkflowSection />

      {/* Features */}
      <FeatureHighlights />

      {/* CTA */}
      {onGetStarted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center pt-8"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="px-8 py-6 text-lg"
          >
            Get Started
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
