'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Database, 
  Activity,
  Brain,
  Code,
  BarChart3,
  Network,
  TreePine,
  Layers,
  Shuffle,
  Search,
  Route,
  Timer,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

import AlgorithmVisualizer from '../components/AlgorithmVisualizer'
import DataStructurePanel from '../components/DataStructurePanel'
import RealTimeMonitor from '../components/RealTimeMonitor'
import PerformanceMetrics from '../components/PerformanceMetrics'
import CodeViewer from '../components/CodeViewer'
import LogPanel from '../components/LogPanel'

export default function Home() {
  const [currentAlgorithm, setCurrentAlgorithm] = useState('quicksort')
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [mongoConnected, setMongoConnected] = useState(false)
  const [realTimeData, setRealTimeData] = useState<any[]>([])

  // Algorithm options
  const algorithms = [
    { id: 'quicksort', name: 'Quick Sort', icon: Shuffle, complexity: 'O(n log n)', category: 'Sorting' },
    { id: 'mergesort', name: 'Merge Sort', icon: Layers, complexity: 'O(n log n)', category: 'Sorting' },
    { id: 'dijkstra', name: 'Dijkstra', icon: Route, complexity: 'O(V log V)', category: 'Graph' },
    { id: 'binarysearch', name: 'Binary Search', icon: Search, complexity: 'O(log n)', category: 'Search' },
    { id: 'dfs', name: 'DFS Traversal', icon: TreePine, complexity: 'O(V + E)', category: 'Graph' },
    { id: 'bfs', name: 'BFS Traversal', icon: Network, complexity: 'O(V + E)', category: 'Graph' },
  ]

  const currentAlgorithmData = algorithms.find(alg => alg.id === currentAlgorithm)

  // Add log entry
  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    setLogs(prev => [...prev.slice(-49), logEntry]) // Keep last 50 logs
  }

  // Handle algorithm execution
  const handlePlay = () => {
    setIsPlaying(true)
    addLog(`🚀 Starting ${currentAlgorithmData?.name} algorithm execution`, 'info')
    
    // Simulate algorithm steps
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1
        if (nextStep >= totalSteps) {
          setIsPlaying(false)
          addLog(`✅ ${currentAlgorithmData?.name} completed successfully!`, 'success')
          clearInterval(interval)
          return totalSteps
        }
        addLog(`📊 Executing step ${nextStep}/${totalSteps}`, 'info')
        return nextStep
      })
    }, 1000 / animationSpeed)
  }

  const handlePause = () => {
    setIsPlaying(false)
    addLog(`⏸️ Algorithm execution paused at step ${currentStep}`, 'warning')
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    addLog(`🔄 Algorithm reset to initial state`, 'info')
  }

  // Initialize with sample data
  useEffect(() => {
    setTotalSteps(Math.floor(Math.random() * 20) + 10)
    addLog('🧠 HEAL Platform initialized successfully', 'success')
    addLog('📡 Connecting to MongoDB databases...', 'info')
    
    // Simulate MongoDB connection
    setTimeout(() => {
      setMongoConnected(true)
      addLog('✅ Connected to MongoDB - Real-time monitoring active', 'success')
    }, 2000)
  }, [currentAlgorithm])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-white">HEAL Platform</h1>
                  <p className="text-blue-200">Next-Generation DSA Visualization</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <motion.div 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    mongoConnected ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                  animate={{ scale: mongoConnected ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 2, repeat: mongoConnected ? Infinity : 0 }}
                >
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {mongoConnected ? 'MongoDB Connected' : 'Connecting...'}
                  </span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">Real-time Active</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Algorithm Selection */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Code className="w-6 h-6 mr-3 text-blue-400" />
              Algorithm Selection
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {algorithms.map((algorithm) => {
                const Icon = algorithm.icon
                return (
                  <motion.button
                    key={algorithm.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      currentAlgorithm === algorithm.id
                        ? 'border-blue-400 bg-blue-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:border-blue-400/50 hover:bg-blue-500/10'
                    }`}
                    onClick={() => {
                      setCurrentAlgorithm(algorithm.id)
                      addLog(`🔄 Switched to ${algorithm.name} algorithm`, 'info')
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">{algorithm.name}</div>
                    <div className="text-xs opacity-70">{algorithm.complexity}</div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.section>

        {/* Control Panel */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Zap className="w-6 h-6 mr-3 text-yellow-400" />
                Algorithm Control Center
              </h2>
              
              <div className="flex items-center space-x-4">
                <div className="text-white">
                  <span className="text-sm opacity-70">Step:</span>
                  <span className="ml-2 font-mono text-lg">{currentStep}/{totalSteps}</span>
                </div>
                
                <div className="w-32 bg-white/20 rounded-full h-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.button
                  className="btn-primary flex items-center space-x-2"
                  onClick={isPlaying ? handlePause : handlePlay}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentStep >= totalSteps}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </motion.button>
                
                <motion.button
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center space-x-2 transition-all"
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </motion.button>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-white text-sm">Speed:</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="w-24 accent-blue-500"
                />
                <span className="text-white text-sm font-mono">{animationSpeed}x</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Main Visualization Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Algorithm Visualizer */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <AlgorithmVisualizer 
              algorithm={currentAlgorithm}
              isPlaying={isPlaying}
              currentStep={currentStep}
              animationSpeed={animationSpeed}
              onLog={addLog}
            />
          </motion.div>
          
          {/* Side Panel */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <CodeViewer algorithm={currentAlgorithm} currentStep={currentStep} />
            <PerformanceMetrics algorithm={currentAlgorithm} currentStep={currentStep} />
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Real-time Monitor */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <RealTimeMonitor 
              mongoConnected={mongoConnected}
              realTimeData={realTimeData}
              onLog={addLog}
            />
          </motion.div>
          
          {/* Log Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <LogPanel logs={logs} />
          </motion.div>
        </div>

        {/* Data Structures Panel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <DataStructurePanel 
            mongoConnected={mongoConnected}
            onLog={addLog}
          />
        </motion.div>

      </main>
    </div>
  )
}
