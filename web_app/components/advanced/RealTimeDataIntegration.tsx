'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Wifi, Users, Activity, Heart, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface DatabaseStats {
  users: number
  appointments: number
  medications: number
  labTests: number
  vaccinations: number
  lastUpdated: Date
  isConnected: boolean
}

interface RealTimeDataProps {
  isPlaying: boolean
}

export default function RealTimeDataIntegration({ isPlaying }: RealTimeDataProps) {
  const [stats, setStats] = useState<DatabaseStats>({
    users: 0,
    appointments: 0,
    medications: 0,
    labTests: 0,
    vaccinations: 0,
    lastUpdated: new Date(),
    isConnected: false
  })
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [recentActivity, setRecentActivity] = useState<string[]>([])

  // Simulate real-time MongoDB connection and data fetching
  useEffect(() => {
    const connectToMongoDB = async () => {
      try {
        setConnectionStatus('connecting')
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simulate successful connection
        setConnectionStatus('connected')
        setStats(prev => ({ ...prev, isConnected: true }))
        
        // Initial data load
        loadInitialData()
        
        addActivity('Connected to HEALIS MongoDB successfully')
        addActivity('Loading patient data from users collection')
        addActivity('Syncing appointment records from doctorappointments')
        
      } catch (error) {
        setConnectionStatus('error')
        addActivity('Failed to connect to MongoDB - Check connection')
      }
    }

    connectToMongoDB()
  }, [])

  // Real-time data updates
  useEffect(() => {
    if (!isPlaying || connectionStatus !== 'connected') return

    const interval = setInterval(() => {
      updateStats()
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, connectionStatus])

  const loadInitialData = () => {
    // Simulate loading data from HEALIS collections
    setStats(prev => ({
      ...prev,
      users: 1247,
      appointments: 89,
      medications: 156,
      labTests: 234,
      vaccinations: 67,
      lastUpdated: new Date()
    }))
  }

  const updateStats = () => {
    setStats(prev => ({
      ...prev,
      users: prev.users + Math.floor(Math.random() * 3),
      appointments: prev.appointments + Math.floor(Math.random() * 2),
      medications: prev.medications + Math.floor(Math.random() * 4),
      labTests: prev.labTests + Math.floor(Math.random() * 3),
      vaccinations: prev.vaccinations + Math.floor(Math.random() * 2),
      lastUpdated: new Date()
    }))

    // Add random activity
    const activities = [
      'New patient registered in users collection',
      'Appointment scheduled in doctorappointments',
      'Medication added to medications collection',
      'Lab test result updated in labtests',
      'Vaccination record added to vaccinations',
      'Health checkup completed in healthcheckups',
      'Mental health session booked in mentalhealth',
      'Pharmacy order placed in pharmacyorders'
    ]
    
    addActivity(activities[Math.floor(Math.random() * activities.length)])
  }

  const addActivity = (activity: string) => {
    setRecentActivity(prev => [
      `${new Date().toLocaleTimeString()}: ${activity}`,
      ...prev.slice(0, 9)
    ])
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connecting': return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connecting': return 'Connecting to HEALIS MongoDB...'
      case 'connected': return 'Connected to HEALIS & Admin Databases'
      case 'error': return 'Connection Failed - Check MongoDB'
    }
  }

  const collections = [
    { name: 'users', count: stats.users, icon: Users, color: 'from-blue-500 to-blue-600' },
    { name: 'doctorappointments', count: stats.appointments, icon: Activity, color: 'from-green-500 to-green-600' },
    { name: 'medications', count: stats.medications, icon: Heart, color: 'from-purple-500 to-purple-600' },
    { name: 'labtests', count: stats.labTests, icon: Database, color: 'from-orange-500 to-orange-600' },
    { name: 'vaccinations', count: stats.vaccinations, icon: CheckCircle, color: 'from-teal-500 to-teal-600' }
  ]

  return (
    <div className="space-y-8">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-gray-800">
            HEALIS MongoDB Integration
          </h3>
          <div className="flex items-center space-x-2">
            {getConnectionIcon()}
            <span className={`text-sm font-medium ${
              connectionStatus === 'connected' ? 'text-green-600' :
              connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {getConnectionText()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Configuration */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Database Configuration</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">HEALIS DB:</span>
                <span className="font-mono text-blue-600">mongodb://localhost:27017/healis</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admin DB:</span>
                <span className="font-mono text-blue-600">mongodb://localhost:27017/healis-admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${stats.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.isConnected ? 'Active' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-mono text-gray-800">
                  {stats.lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Activity */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Real-time Activity</h4>
            <div className="bg-gray-50 rounded-lg p-4 h-32 overflow-y-auto">
              <AnimatePresence>
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-xs text-gray-600 mb-1 font-mono"
                  >
                    {activity}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Collection Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center group hover:scale-105 transition-transform duration-300"
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${collection.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <collection.icon className="w-8 h-8 text-white" />
            </div>
            
            <div className="text-3xl font-bold text-gray-800 mb-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={collection.count}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {collection.count.toLocaleString()}
                </motion.span>
              </AnimatePresence>
            </div>
            
            <div className="text-sm text-gray-600 font-medium">
              {collection.name}
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              HEALIS Collection
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data Flow Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <h3 className="text-xl font-display font-bold text-gray-800 mb-6 text-center">
          Real-time Data Flow Architecture
        </h3>
        
        <div className="flex items-center justify-between">
          {/* MongoDB */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
              <Database className="w-10 h-10 text-white" />
            </div>
            <div className="font-semibold text-gray-800">MongoDB</div>
            <div className="text-sm text-gray-600">HEALIS Database</div>
          </div>

          {/* Data Flow Arrow */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <Wifi className="w-6 h-6 text-blue-500" />
              <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </motion.div>
          </div>

          {/* DSA Engine */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <div className="font-semibold text-gray-800">DSA Engine</div>
            <div className="text-sm text-gray-600">Processing Layer</div>
          </div>

          {/* Data Flow Arrow */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <Wifi className="w-6 h-6 text-purple-500" />
              <div className="w-8 h-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
            </motion.div>
          </div>

          {/* Visualization */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <div className="font-semibold text-gray-800">Visualization</div>
            <div className="text-sm text-gray-600">User Interface</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full border border-blue-200">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">
              Real-time synchronization with HEALIS MongoDB collections
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
