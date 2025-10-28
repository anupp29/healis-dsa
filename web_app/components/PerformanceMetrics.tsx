'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock, Zap, BarChart3 } from 'lucide-react'

interface PerformanceMetricsProps {
  algorithm: string
  currentStep: number
}

export default function PerformanceMetrics({ algorithm, currentStep }: PerformanceMetricsProps) {
  const metrics = {
    operations: currentStep * 2,
    comparisons: Math.floor(currentStep * 1.5),
    swaps: Math.floor(currentStep / 2),
    timeComplexity: algorithm === 'quicksort' ? 'O(n log n)' : 'O(n log n)',
    spaceComplexity: algorithm === 'mergesort' ? 'O(n)' : 'O(log n)'
  }

  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-xl font-bold text-white flex items-center mb-4">
        <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
        Performance Metrics
      </h3>

      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Operations</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.operations}</div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Comparisons</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.comparisons}</div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Swaps</span>
            <Clock className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.swaps}</div>
        </div>
      </div>
    </div>
  )
}
