'use client'

import { motion } from 'framer-motion'

interface HeroSectionProps {
  onStartClick?: () => void
}

export function HeroSection({ onStartClick }: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-16">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-4xl text-5xl font-bold tracking-tight text-black dark:text-white sm:text-7xl leading-tight transition-colors"
      >
        Modern CRM Data Import reimagined
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        className="max-w-2xl text-lg text-gray-600 dark:text-gray-400 transition-colors"
      >
        Import leads from any CSV into GrowEasy using intelligent AI field mapping.
        Supports Facebook Leads, Google Ads, HubSpot, Excel exports, and custom CSV files.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      >
        <button 
          onClick={onStartClick}
          className="inline-block rounded-full bg-black dark:bg-white px-8 py-3 text-sm font-semibold text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          Start Importing
        </button>
      </motion.div>
    </div>
  )
}
