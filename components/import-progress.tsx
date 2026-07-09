'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Check, ChevronRight, UploadCloud, FileType, Search, BrainCircuit, ShieldCheck, Database } from 'lucide-react'
import RadialOrbitalTimeline, { TimelineData } from './ui/radial-orbital-timeline'

interface ImportProgressProps {
  isVisible: boolean
  isImporting: boolean
}

const processingStages = [
  { id: 1, label: 'Uploading CSV...', icon: '📤' },
  { id: 2, label: 'Parsing CSV...', icon: '📋' },
  { id: 3, label: 'Detecting Column Names...', icon: '🔍' },
  { id: 4, label: 'Understanding Data Structure...', icon: '📊' },
  { id: 5, label: 'Identifying Customer Fields...', icon: '👤' },
  { id: 6, label: 'Extracting Emails...', icon: '📧' },
  { id: 7, label: 'Extracting Phone Numbers...', icon: '☎️' },
  { id: 8, label: 'Mapping CRM Fields...', icon: '🔗' },
  { id: 9, label: 'Detecting Duplicate Leads...', icon: '🔄' },
  { id: 10, label: 'Validating Records...', icon: '✅' },
  { id: 11, label: 'Generating CRM Objects...', icon: '⚙️' },
  { id: 12, label: 'Preparing Import Summary...', icon: '📈' },
  { id: 13, label: 'Finalizing...', icon: '🎯' },
]

const fieldMappings = [
  { detected: 'Customer Name', mapped: 'Name', confidence: 98 },
  { detected: 'Primary Contact', mapped: 'Mobile', confidence: 96 },
  { detected: 'Email Address', mapped: 'Email', confidence: 99 },
  { detected: 'Comments', mapped: 'CRM Notes', confidence: 91 },
]

export function ImportProgress({ isVisible, isImporting }: ImportProgressProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [fieldIndex, setFieldIndex] = useState(0)

  useEffect(() => {
    if (!isVisible || !isImporting) return

    setProgress(0)

    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < processingStages.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 400)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const remaining = 95 - prev
        const increment = Math.max(0.5, remaining * 0.1)
        return Math.min(prev + increment, 95)
      })
    }, 500)

    const fieldInterval = setInterval(() => {
      setFieldIndex((prev) => (prev + 1) % fieldMappings.length)
    }, 2000)

    return () => {
      clearInterval(stageInterval)
      clearInterval(progressInterval)
      clearInterval(fieldInterval)
    }
  }, [isVisible, isImporting])

  useEffect(() => {
    if (isVisible && !isImporting) {
      setProgress(100)
    }
  }, [isVisible, isImporting])

  if (!isVisible) return null

  const displayProgress = progress
  const currentStage = processingStages[currentStageIndex]

  // Map the 13 micro-stages to 5 macro-stages for the orbital timeline
  const macroStages: TimelineData[] = [
    {
      id: 1,
      title: 'Parse & Upload',
      category: 'Data Ingestion',
      icon: UploadCloud,
      status: currentStageIndex > 1 ? 'completed' : currentStageIndex >= 0 ? 'in-progress' : 'pending',
      energy: currentStageIndex >= 0 ? 100 : 0,
    },
    {
      id: 2,
      title: 'Structure Detection',
      category: 'Schema Analysis',
      icon: FileType,
      status: currentStageIndex > 4 ? 'completed' : currentStageIndex >= 2 ? 'in-progress' : 'pending',
      energy: currentStageIndex >= 2 ? 80 : 0,
    },
    {
      id: 3,
      title: 'AI Extraction',
      category: 'Data Mining',
      icon: Search,
      status: currentStageIndex > 7 ? 'completed' : currentStageIndex >= 5 ? 'in-progress' : 'pending',
      energy: currentStageIndex >= 5 ? 60 : 0,
    },
    {
      id: 4,
      title: 'Field Mapping',
      category: 'AI Pipeline',
      icon: BrainCircuit,
      status: currentStageIndex > 9 ? 'completed' : currentStageIndex >= 8 ? 'in-progress' : 'pending',
      energy: currentStageIndex >= 8 ? 40 : 0,
    },
    {
      id: 5,
      title: 'Validation & Sync',
      category: 'Database',
      icon: Database,
      status: currentStageIndex >= 12 ? 'completed' : currentStageIndex >= 10 ? 'in-progress' : 'pending',
      energy: currentStageIndex >= 10 ? 20 : 0,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orbital Timeline Animation */}
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/80 p-4 shadow-sm hover:border-border/80 transition-all flex flex-col items-center justify-center min-h-[450px]">
          <RadialOrbitalTimeline timelineData={macroStages} />
          
          <div className="mt-8 w-full max-w-sm mx-auto space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overall Progress</span>
              <motion.span 
                className="text-sm font-bold text-accent"
                key={Math.round(displayProgress)}
              >
                {Math.round(displayProgress)}%
              </motion.span>
            </div>
            <div className="relative h-2.5 rounded-full bg-border/50 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent via-accent to-accent/80 rounded-full shadow-lg shadow-accent/20"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(displayProgress, 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <div className="text-center mt-4">
              <p className="text-sm font-medium text-foreground">{currentStage.icon} {currentStage.label}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Field Detection Panel */}
          <div className="rounded-xl border border-border/50 bg-card/30 p-6 h-full flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-6">AI Field Mapping Detection</h3>
            
            <div className="space-y-4">
              <motion.div
                key={fieldIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="rounded-lg border border-border/50 bg-card/50 p-6 space-y-4 shadow-inner"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Detected Column</p>
                    <p className="font-mono text-sm text-foreground bg-background/50 p-2 rounded border border-border">{fieldMappings[fieldIndex].detected}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-accent mt-6 animate-pulse" />
                  <div className="flex-1 text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Mapped CRM Field</p>
                    <p className="font-semibold text-sm text-accent bg-accent/10 p-2 rounded border border-accent/20">{fieldMappings[fieldIndex].mapped}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                      AI Confidence Match
                    </span>
                    <span className="font-bold text-accent text-sm">{fieldMappings[fieldIndex].confidence}%</span>
                  </div>
                  <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${fieldMappings[fieldIndex].confidence}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-accent/50 to-accent rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-8">
              {isImporting ? 'Our AI is actively analyzing your data structure and standardizing records on the fly.' : 'Import complete. Data standardized.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
