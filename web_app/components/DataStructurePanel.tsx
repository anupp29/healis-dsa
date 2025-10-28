'use client'

import { motion } from 'framer-motion'
import { Layers, Database } from 'lucide-react'

interface DataStructurePanelProps {
  mongoConnected: boolean
  onLog: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

export default function DataStructurePanel({ mongoConnected, onLog }: DataStructurePanelProps) {
  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-white flex items-center mb-4">
        <Layers className="w-5 h-5 mr-2 text-blue-400" />
        Live Data Structures
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Patient Array</h4>
          <div className="text-sm text-gray-300">Dynamic size: 1,247</div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Appointment Queue</h4>
          <div className="text-sm text-gray-300">FIFO operations: 23</div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="text-white font-semibold mb-2">Doctor Graph</h4>
          <div className="text-sm text-gray-300">Nodes: 45, Edges: 128</div>
        </div>
      </div>
    </div>
  )
}
