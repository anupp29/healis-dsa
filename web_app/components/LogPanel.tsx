'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface LogPanelProps {
  logs: string[]
}

export default function LogPanel({ logs }: LogPanelProps) {
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const getLogIcon = (log: string) => {
    if (log.includes('✅') || log.includes('success')) return CheckCircle
    if (log.includes('⚠️') || log.includes('warning')) return AlertTriangle
    if (log.includes('❌') || log.includes('error')) return XCircle
    return Info
  }

  const getLogColor = (log: string) => {
    if (log.includes('✅') || log.includes('success')) return 'text-green-400 bg-green-500/10'
    if (log.includes('⚠️') || log.includes('warning')) return 'text-yellow-400 bg-yellow-500/10'
    if (log.includes('❌') || log.includes('error')) return 'text-red-400 bg-red-500/10'
    return 'text-blue-400 bg-blue-500/10'
  }

  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Terminal className="w-5 h-5 mr-2 text-green-400" />
          Real-time Logs
        </h3>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>{logs.length} entries</span>
          <motion.div
            className="w-2 h-2 bg-green-400 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>

      <div 
        ref={logContainerRef}
        className="bg-black/40 rounded-xl p-4 h-64 overflow-y-auto font-mono text-sm space-y-2"
      >
        <AnimatePresence>
          {logs.map((log, index) => {
            const Icon = getLogIcon(log)
            const colorClass = getLogColor(log)
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start space-x-3 p-2 rounded-lg ${colorClass} border border-current/20`}
              >
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="flex-1 break-words">{log}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No logs yet. Start an algorithm to see real-time execution logs.</p>
          </div>
        )}
      </div>
    </div>
  )
}
