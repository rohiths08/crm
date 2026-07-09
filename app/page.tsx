'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { UploadCard } from '@/components/upload-card'
import { CSVPreviewTable } from '@/components/csv-preview-table'
import { ImportProgress } from '@/components/import-progress'
import { SummaryCards } from '@/components/summary-cards'
import { CRMResultsTable } from '@/components/crm-results-table'
import { SkippedRecords } from '@/components/skipped-records'
import { AuthModal } from '@/components/auth-modal'
import { Button } from '@/components/ui/button'
import { CapabilityBadges } from '@/components/capability-badges'
import Papa from 'papaparse'

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUploaded, setFileUploaded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<any[]>([])
  
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [recentImports, setRecentImports] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        setUser({ email: 'user@groweasy.com' })
      }
    }
  }, [])

  useEffect(() => {
    if (user) {
      const storedImports = localStorage.getItem(`recent_imports_${user.email}`)
      if (storedImports) {
        try {
          setRecentImports(JSON.parse(storedImports))
        } catch (e) {
          console.error(e)
        }
      } else {
        setRecentImports([])
      }
    } else {
      setRecentImports([])
    }
  }, [user])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setFileUploaded(true)
    setShowPreview(true)
    setImportError(null)

    // Parse the entire file for preview and pagination
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields) {
          setPreviewHeaders(results.meta.fields)
          setPreviewRows(results.data)
        }
      },
    })
  }

  const handleConfirmImport = async () => {
    if (!selectedFile) return
    setIsImporting(true)
    setImportError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsAuthModalOpen(true)
        setIsImporting(false)
        return
      }

      const formData = new FormData()
      formData.append('file', selectedFile)

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to import file: ${response.statusText}`)
      }

      const data = await response.json()
      setImportResults(data)
      setIsImporting(false)
      setImportComplete(true)

      // Save import to history
      const newImport = {
        fileName: selectedFile.name,
        timestamp: new Date().toISOString(),
        totalRecords: data.data?.summary?.totalRows || 0,
        successfulRecords: data.data?.summary?.imported || 0,
        failedRecords: data.data?.summary?.skipped || 0,
      }
      if (user) {
        const updatedHistory = [newImport, ...recentImports].slice(0, 10)
        setRecentImports(updatedHistory)
        localStorage.setItem(`recent_imports_${user.email}`, JSON.stringify(updatedHistory))
      }
    } catch (err) {
      console.error(err)
      setImportError(err instanceof Error ? err.message : 'An unknown error occurred')
      setIsImporting(false)
    }
  }

  const handleUploadAnother = () => {
    setSelectedFile(null)
    setFileUploaded(false)
    setShowPreview(false)
    setIsImporting(false)
    setImportComplete(false)
    setImportResults(null)
    setImportError(null)
    setPreviewHeaders([])
    setPreviewRows([])
  }

  const handleExportResults = () => {
    if (!importResults?.data?.records?.length && !importResults?.data?.skipped?.length) return

    // We can export the successfully imported records
    const records = importResults.data.records || []
    if (records.length === 0) {
      alert("No successfully imported records to export.")
      return
    }

    const csv = Papa.unparse(records)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'groweasy_crm_import.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors">
      <Header 
        user={user} 
        onLoginClick={() => setIsAuthModalOpen(true)} 
        onLogout={() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Page Header */}
        {!fileUploaded && !isImporting && !importComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full mb-16"
          >
            <HeroSection 
              onStartClick={() => {
                if (user) {
                  document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
                } else {
                  setIsAuthModalOpen(true)
                }
              }}
            />
          </motion.div>
        )}

        {/* Capabilities on Home Page */}
        {!fileUploaded && !isImporting && !importComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl bg-white dark:bg-[#111111]/80 border border-black/5 dark:border-white/10 rounded-[32px] p-8 md:p-12 mb-16 backdrop-blur-3xl shadow-sm transition-colors"
          >
            <CapabilityBadges gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" />
          </motion.div>
        )}

        {/* Dashboard Wrapper */}
        {user && (
          <motion.div
            id="upload-section"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative w-full max-w-6xl rounded-[32px] border border-black/5 dark:border-white/10 bg-white dark:bg-[#111111]/80 shadow-2xl dark:shadow-2xl overflow-hidden backdrop-blur-3xl p-8 md:p-12 mb-32 transition-colors"
            style={{ boxShadow: '0 0 80px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)' }}
          >
            {/* Dashboard Window Header (Fake Mac buttons) */}
            <div className="flex gap-2 mb-8 items-center border-b border-black/5 dark:border-white/5 pb-4">
               <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
               <div className="ml-4 text-xs text-gray-500 font-medium">GrowEasy</div>
            </div>

        {/* Upload Card - Main Focus */}
        {(!isImporting && !importComplete) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12 relative"
          >
            {!user && (
              <div 
                className="absolute inset-0 z-50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsAuthModalOpen(true)
                }}
              />
            )}
            <UploadCard onFileSelect={handleFileSelect} disabled={fileUploaded} />
          </motion.div>
        )}

        {importError && (
          <div className="mb-6 p-4 rounded-md bg-destructive/15 text-destructive text-sm font-medium border border-destructive/20">
            Error: {importError}
          </div>
        )}

        {/* CSV Preview */}
        {(fileUploaded && !isImporting && !importComplete) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3 mb-6"
          >
            <h3 className="text-sm font-semibold text-foreground">Preview</h3>
            <CSVPreviewTable isVisible={true} headers={previewHeaders} rows={previewRows} />
          </motion.div>
        )}

        {/* Confirm Import Button */}
        {fileUploaded && !isImporting && !importComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 mb-12"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadAnother}
            >
              Choose Another
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmImport}
            >
              Confirm Import
            </Button>
          </motion.div>
        )}

        {/* Import Progress */}
        {isImporting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <ImportProgress isVisible={true} isImporting={isImporting} />
          </motion.div>
        )}

        {/* Results Dashboard */}
        {importComplete && importResults && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <SummaryCards isVisible={true} summary={importResults.data?.summary} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-3 mb-12"
            >
              <h3 className="text-sm font-semibold text-foreground">Imported Records</h3>
              <CRMResultsTable isVisible={true} records={importResults.data?.records || []} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <SkippedRecords isVisible={true} skipped={importResults.data?.skipped || []} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2 pb-12"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadAnother}
              >
                Upload Another
              </Button>
              <Button size="sm" onClick={handleExportResults}>Export Results</Button>
            </motion.div>
          </>
        )}

          </motion.div>
        )}

        {/* Recent Uploaded Files & Capabilities Side-by-Side (Logged In) */}
        {user && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24 items-start">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#111111]/80 border border-black/5 dark:border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-3xl shadow-sm transition-colors"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-black dark:text-white">Recent Uploaded Files</h3>
                  {recentImports.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 hover:text-red-500"
                      onClick={() => {
                        setRecentImports([])
                        localStorage.removeItem(`recent_imports_${user.email}`)
                      }}
                    >
                      Clear History
                    </Button>
                  )}
                </div>
                
                {recentImports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No recent uploads found.
                  </div>
                ) : (
                  <div className="overflow-x-auto font-sans">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-black/5 dark:border-white/5 text-gray-500 font-medium">
                          <th className="py-3 px-4 whitespace-nowrap">File Name</th>
                          <th className="py-3 px-4 whitespace-nowrap">Uploaded At</th>
                          <th className="py-3 px-4 whitespace-nowrap">Total Rows</th>
                          <th className="py-3 px-4 whitespace-nowrap text-green-600 dark:text-green-400">Successful</th>
                          <th className="py-3 px-4 whitespace-nowrap text-red-500">Failed</th>
                          <th className="py-3 px-4 whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {recentImports.map((imp, idx) => (
                          <tr key={idx} className="text-gray-700 dark:text-gray-300 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-4 font-medium text-black dark:text-white whitespace-nowrap">{imp.fileName}</td>
                            <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{new Date(imp.timestamp).toLocaleString()}</td>
                            <td className="py-3 px-4 whitespace-nowrap">{imp.totalRecords}</td>
                            <td className="py-3 px-4 text-green-600 dark:text-green-400 font-medium whitespace-nowrap">{imp.successfulRecords}</td>
                            <td className="py-3 px-4 text-red-500 font-medium whitespace-nowrap">{imp.failedRecords}</td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </div>

            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#111111]/80 border border-black/5 dark:border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-3xl shadow-sm transition-colors"
              >
                <CapabilityBadges gridClassName="grid-cols-1 gap-4" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Marketing Sections */}
        {true && (
          <div className="w-full max-w-5xl space-y-32 py-16">
            <motion.section 
              id="features"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-8"
            >
              <h2 className="text-4xl font-bold text-black dark:text-white">Features that change the game</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="p-8 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/10 shadow-sm transition-colors">
                  <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mb-6 font-bold text-xl">1</div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">AI Field Mapping</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">No more manual column mapping. Our intelligent AI pipelines scan your unstructured data and dynamically map it directly to proper CRM objects, understanding semantic meaning instantly.</p>
                </div>
                <div className="p-8 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/10 shadow-sm transition-colors">
                  <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mb-6 font-bold text-xl">2</div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">Dual-AI Failover</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Powered primarily by Google's Gemini, but intelligently backed by Groq's Llama models. If a rate limit is hit, the system hot-swaps to the secondary provider mid-batch so you never drop a single record.</p>
                </div>
                <div className="p-8 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/10 shadow-sm transition-colors">
                  <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mb-6 font-bold text-xl">3</div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">Instant Standardization</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Phone numbers are cleaned, emails are validated, and names are properly capitalized. Bad leads are automatically filtered out using strict business logic, leaving you with perfect data.</p>
                </div>
              </div>
            </motion.section>

            <motion.section 
              id="solution"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-16"
            >
              <div className="flex-1 space-y-6">
                <h2 className="text-4xl font-bold text-black dark:text-white leading-tight">The ultimate solution to fragmented lead data.</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Sales teams spend 20% of their time just formatting excel spreadsheets. We built GrowEasy to eliminate data entry entirely. By leveraging the latest Large Language Models, our importer can read almost any format—from Facebook Ads to scattered event lists—and seamlessly digest it into clean, actionable leads.
                </p>
              </div>
              <div className="flex-1 h-64 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-[#111] dark:to-black border border-black/5 dark:border-white/10 relative overflow-hidden flex items-center justify-center shadow-2xl">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                 <div className="text-3xl font-bold text-black/30 dark:text-white/50 tracking-widest z-10">GROWEASY</div>
              </div>
            </motion.section>

            <motion.section 
              id="about"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto space-y-6 pb-16"
            >
              <h2 className="text-4xl font-bold text-black dark:text-white">Our Mission</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                We believe that software should work for you, not the other way around. GrowEasy is dedicated to providing enterprise-grade AI tools packaged in stunning, minimalist interfaces that just work out of the box.
              </p>
            </motion.section>
          </div>
        )}

        {/* Enhanced Footer */}
        <footer className="border-t border-black/10 dark:border-white/10 mt-24 pt-16 pb-8 w-full transition-colors">
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8 px-4 md:px-0">
            <div className="space-y-4 max-w-xs">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 text-black dark:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hexagon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
                <span className="text-xl font-bold tracking-tight text-black dark:text-white">GrowEasy</span>
              </div>
              <p className="text-sm text-gray-500">
                Revolutionizing data import with AI. We make bringing your leads into your CRM effortless and intelligent.
              </p>
            </div>
            
            <div className="flex gap-16">
              <div className="space-y-4">
                <h4 className="font-semibold text-black dark:text-white">Product</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a></li>
                  <li><a href="#solution" className="hover:text-black dark:hover:text-white transition-colors">Solution</a></li>
                  <li><a href="#about" className="hover:text-black dark:hover:text-white transition-colors">About Us</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-black dark:text-white">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-black/5 dark:border-white/5 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} GrowEasy. All rights reserved.
            </p>
          </div>
        </footer>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={(token, user) => {
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          setUser(user)
          setIsAuthModalOpen(false)
          setTimeout(() => {
            document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }} 
      />
    </div>
  )
}
