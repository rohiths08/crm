'use client'

import { Upload, X, CheckCircle2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Button } from './ui/button'

interface UploadedFile {
  name: string
  size: number
}

interface UploadCardProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

const supportedSources = [
  'Facebook Leads',
  'Google Ads',
  'HubSpot',
  'Excel',
  'Zoho',
  'Salesforce',
  'Custom CRM',
  'Marketing CSV',
]

const quickBadges = [
  '✓ Instant Preview',
  '✓ AI Mapping',
  '✓ Batch Processing',
  '✓ Smart Validation',
]

export function UploadCard({ onFileSelect, disabled = false }: UploadCardProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setUploadedFile({
          name: file.name,
          size: file.size,
        })
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    disabled: disabled || uploadedFile !== null,
    noClick: true, // We will trigger it via the button
  })

  const handleRemove = () => {
    setUploadedFile(null)
  }

  if (uploadedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-accent/30 bg-gradient-to-br from-card to-card/80 p-6 shadow-md hover:border-accent/50 hover:shadow-lg transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent/10"
            >
              <CheckCircle2 className="h-7 w-7 text-accent" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="font-semibold text-foreground truncate"
              >
                {uploadedFile.name}
              </motion.h3>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mt-2 flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-1">
                  <span className="text-accent">•</span> {(uploadedFile.size / 1024).toFixed(2)} KB
                </span>
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-1 text-accent font-medium"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-accent"
                  />
                  Ready to import
                </motion.span>
              </motion.div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleRemove}
            className="flex-shrink-0 inline-flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted hover:border-accent/50 p-2 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-xl border-2 border-dashed p-12 sm:p-16 text-center transition-all duration-300 ${
          isDragActive
            ? 'border-accent bg-accent/15 shadow-lg shadow-accent/20 scale-[1.01]'
            : 'border-border/60 bg-card/40 hover:border-accent/50 hover:bg-card/60 hover:shadow-md'
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/0 pointer-events-none" />

        <input {...getInputProps()} />

        <div className="relative z-10 space-y-5">
          {/* Icon */}
          <motion.div
            animate={{ y: isDragActive ? -12 : [0, -8, 0] }}
            transition={{ duration: isDragActive ? 0.3 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex justify-center"
          >
            <motion.div 
              whileHover={{ scale: 1.08 }}
              className={`flex h-20 w-20 items-center justify-center rounded-2xl transition-all ${
                isDragActive ? 'bg-accent/30 shadow-lg shadow-accent/30' : 'bg-gradient-to-br from-accent/15 to-accent/5 hover:from-accent/20 hover:to-accent/10'
              }`}
            >
              <Upload className={`h-10 w-10 transition-colors ${
                isDragActive ? 'text-accent scale-110' : 'text-accent/70'
              }`} />
            </motion.div>
          </motion.div>

          {/* Main text */}
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">Drag & Drop CSV</h3>
            <p className="text-sm text-muted-foreground/80">or click to browse your files</p>
          </div>

          {/* Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              disabled={disabled} 
              size="lg"
              onClick={open}
              className="font-medium"
            >
              Choose file
            </Button>
          </motion.div>

          {/* Quick Badges */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2">
            {quickBadges.map((badge, idx) => (
              <motion.div 
                key={badge} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="text-xs font-medium text-muted-foreground/70"
              >
                {badge}
              </motion.div>
            ))}
          </div>
          
          {/* File Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-1 pt-2 text-xs text-muted-foreground/60"
          >
            <p>Supported: CSV only</p>
            <p>Maximum size: 25 MB</p>
          </motion.div>

          {/* Supported Sources */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="space-y-3 pt-4 border-t border-border/30"
          >
            <p className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">Supported Sources</p>
            <div className="flex flex-wrap justify-center gap-2">
              {supportedSources.map((source, idx) => (
                <motion.span
                  key={source}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center rounded-full bg-accent/8 hover:bg-accent/12 px-3 py-1.5 text-xs text-accent/80 font-medium transition-colors cursor-default"
                >
                  {source}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
