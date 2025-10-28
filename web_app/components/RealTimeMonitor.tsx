'use client'

import { motion } from 'framer-motion'
import { Database, Activity, Users, FileText } from 'lucide-react'

interface RealTimeMonitorProps {
  mongoConnected: boolean
  realTimeData: any[]
  onLog: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

export default function RealTimeMonitor({ mongoConnected, realTimeData, onLog }: RealTimeMonitorProps) {
  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-white flex items-center mb-4">
        <Activity className="w-5 h-5 mr-2 text-green-400" />
        Real-time MongoDB Monitor
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Patients</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">1,247</div>
          <div className="text-xs text-green-400">↑ 15 new today</div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Records</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">8,932</div>
          <div className="text-xs text-green-400">↑ 23 updated</div>
        </div>
      </div>
    </div>
  )
}
