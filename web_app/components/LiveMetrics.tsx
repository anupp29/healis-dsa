'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Clock, Activity, TrendingUp, Heart, AlertTriangle } from 'lucide-react'

export default function LiveMetrics() {
  const [metrics, setMetrics] = useState({
    totalPatients: 1247,
    activeQueue: 23,
    avgWaitTime: 12,
    systemLoad: 78,
    criticalCases: 3,
    processedToday: 156
  })

  const [isLive, setIsLive] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        setMetrics(prev => ({
          totalPatients: prev.totalPatients + Math.floor(Math.random() * 3),
          activeQueue: Math.max(15, prev.activeQueue + Math.floor(Math.random() * 5) - 2),
          avgWaitTime: Math.max(5, prev.avgWaitTime + Math.floor(Math.random() * 6) - 3),
          systemLoad: Math.max(60, Math.min(95, prev.systemLoad + Math.floor(Math.random() * 10) - 5)),
          criticalCases: Math.max(0, Math.min(8, prev.criticalCases + Math.floor(Math.random() * 3) - 1)),
          processedToday: prev.processedToday + Math.floor(Math.random() * 2)
        }))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const metricCards = [
    {
      title: "Total Patients",
      value: metrics.totalPatients.toLocaleString(),
      change: "+12 today",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100"
    },
    {
      title: "Active Queue",
      value: metrics.activeQueue,
      change: "Priority Queue",
      icon: Activity,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100"
    },
    {
      title: "Avg Wait Time",
      value: `${metrics.avgWaitTime} min`,
      change: "FIFO Processing",
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100"
    },
    {
      title: "System Load",
      value: `${metrics.systemLoad}%`,
      change: "Hash Table Ops",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100"
    },
    {
      title: "Critical Cases",
      value: metrics.criticalCases,
      change: "Min-Heap Priority",
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100"
    },
    {
      title: "Processed Today",
      value: metrics.processedToday,
      change: "Stack Operations",
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      bgColor: "from-pink-50 to-pink-100"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Live Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium text-text-secondary">
            {isLive ? 'Live Data Stream' : 'Paused'}
          </span>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            isLive 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {isLive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="medical-card p-6 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className={`w-6 h-6 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-text-primary">
                  {metric.value}
                </div>
                <div className="text-sm text-text-secondary">
                  {metric.change}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-text-primary mb-2">
                {metric.title}
              </h3>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.random() * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DSA Operations Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-display font-semibold text-text-primary mb-6">
          DSA Operations Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dsaOperations.map((operation, index) => (
            <div key={operation.name} className="text-center">
              <div className="relative mb-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pastel-sky to-pastel-whisper rounded-2xl flex items-center justify-center">
                  <operation.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  operation.status === 'active' ? 'bg-green-500' : 
                  operation.status === 'processing' ? 'bg-orange-500' : 'bg-gray-400'
                }`}>
                  {operation.count}
                </div>
              </div>
              <div className="font-medium text-text-primary">{operation.name}</div>
              <div className="text-sm text-text-secondary">{operation.description}</div>
              <div className={`text-xs font-medium mt-1 ${
                operation.status === 'active' ? 'text-green-600' : 
                operation.status === 'processing' ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {operation.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

const dsaOperations = [
  {
    name: "Priority Queue",
    description: "Min-Heap Operations",
    icon: Heart,
    status: "active",
    count: 23
  },
  {
    name: "FIFO Queue",
    description: "Appointment Flow",
    icon: Activity,
    status: "processing",
    count: 45
  },
  {
    name: "Stack Records",
    description: "LIFO Access",
    icon: Users,
    status: "active",
    count: 12
  },
  {
    name: "Hash Lookups",
    description: "O(1) Search",
    icon: TrendingUp,
    status: "active",
    count: 89
  }
]
