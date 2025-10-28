'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, ArrowUpDown, CheckCircle, AlertTriangle } from 'lucide-react'

interface AlgorithmVisualizerProps {
  algorithm: string
  isPlaying: boolean
  currentStep: number
  animationSpeed: number
  onLog: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

export default function AlgorithmVisualizer({ 
  algorithm, 
  isPlaying, 
  currentStep, 
  animationSpeed, 
  onLog 
}: AlgorithmVisualizerProps) {
  const [data, setData] = useState<number[]>([])
  const [comparing, setComparing] = useState<number[]>([])
  const [swapping, setSwapping] = useState<number[]>([])
  const [sorted, setSorted] = useState<number[]>([])
  const [pivot, setPivot] = useState<number>(-1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize data based on algorithm
  useEffect(() => {
    let initialData: number[] = []
    
    switch (algorithm) {
      case 'quicksort':
      case 'mergesort':
        initialData = [64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 43, 35, 67, 89, 23]
        break
      case 'binarysearch':
        initialData = [11, 12, 22, 23, 25, 34, 35, 43, 50, 64, 67, 76, 88, 89, 90]
        break
      case 'dijkstra':
      case 'dfs':
      case 'bfs':
        initialData = [1, 2, 3, 4, 5, 6, 7, 8] // Node IDs for graph
        break
      default:
        initialData = [64, 34, 25, 12, 22, 11, 90]
    }
    
    setData(initialData)
    setComparing([])
    setSwapping([])
    setSorted([])
    setPivot(-1)
    onLog(`📊 Initialized ${algorithm} with ${initialData.length} elements`)
  }, [algorithm])

  // Simulate algorithm steps
  useEffect(() => {
    if (!isPlaying) return

    const stepInterval = setInterval(() => {
      simulateAlgorithmStep()
    }, 1000 / animationSpeed)

    return () => clearInterval(stepInterval)
  }, [isPlaying, currentStep, animationSpeed, algorithm])

  const simulateAlgorithmStep = () => {
    const dataLength = data.length
    
    switch (algorithm) {
      case 'quicksort':
        simulateQuickSortStep()
        break
      case 'mergesort':
        simulateMergeSortStep()
        break
      case 'binarysearch':
        simulateBinarySearchStep()
        break
      case 'dijkstra':
        simulateDijkstraStep()
        break
      default:
        simulateGenericStep()
    }
  }

  const simulateQuickSortStep = () => {
    const step = currentStep % 10
    
    switch (step) {
      case 0:
        setPivot(data.length - 1)
        onLog(`🎯 Selected pivot: ${data[data.length - 1]}`, 'info')
        break
      case 1:
      case 2:
      case 3:
        const compareIndices = [Math.floor(Math.random() * (data.length - 1)), Math.floor(Math.random() * (data.length - 1))]
        setComparing(compareIndices)
        onLog(`🔍 Comparing elements at indices ${compareIndices[0]} and ${compareIndices[1]}`, 'info')
        break
      case 4:
      case 5:
        const swapIndices = [Math.floor(Math.random() * data.length), Math.floor(Math.random() * data.length)]
        setSwapping(swapIndices)
        
        // Actually swap the elements
        const newData = [...data]
        ;[newData[swapIndices[0]], newData[swapIndices[1]]] = [newData[swapIndices[1]], newData[swapIndices[0]]]
        setData(newData)
        
        onLog(`🔄 Swapped elements: ${data[swapIndices[0]]} ↔ ${data[swapIndices[1]]}`, 'warning')
        break
      case 6:
        setComparing([])
        setSwapping([])
        break
      case 7:
        const sortedIndex = Math.floor(Math.random() * data.length)
        setSorted(prev => [...prev, sortedIndex])
        onLog(`✅ Element at index ${sortedIndex} is in correct position`, 'success')
        break
      default:
        setComparing([])
        setSwapping([])
    }
  }

  const simulateMergeSortStep = () => {
    const step = currentStep % 8
    
    switch (step) {
      case 0:
      case 1:
        onLog(`📂 Dividing array into smaller subarrays`, 'info')
        break
      case 2:
      case 3:
        const compareIndices = [Math.floor(Math.random() * data.length), Math.floor(Math.random() * data.length)]
        setComparing(compareIndices)
        onLog(`🔍 Comparing elements for merge: ${data[compareIndices[0]]} vs ${data[compareIndices[1]]}`, 'info')
        break
      case 4:
      case 5:
        onLog(`🔗 Merging sorted subarrays`, 'warning')
        break
      case 6:
        const sortedIndex = Math.floor(Math.random() * data.length)
        setSorted(prev => [...prev, sortedIndex])
        onLog(`✅ Merged element placed in correct position`, 'success')
        break
      default:
        setComparing([])
    }
  }

  const simulateBinarySearchStep = () => {
    const target = 50
    const step = currentStep % 6
    
    switch (step) {
      case 0:
        onLog(`🎯 Searching for target value: ${target}`, 'info')
        break
      case 1:
      case 2:
      case 3:
        const mid = Math.floor(data.length / 2)
        setComparing([mid])
        onLog(`🔍 Checking middle element: ${data[mid]} (target: ${target})`, 'info')
        break
      case 4:
        onLog(`📍 Narrowing search range`, 'warning')
        break
      case 5:
        onLog(`✅ Target found!`, 'success')
        break
    }
  }

  const simulateDijkstraStep = () => {
    const step = currentStep % 7
    
    switch (step) {
      case 0:
        onLog(`🚀 Starting Dijkstra's shortest path algorithm`, 'info')
        break
      case 1:
      case 2:
        const nodeIndex = Math.floor(Math.random() * data.length)
        setComparing([nodeIndex])
        onLog(`🔍 Visiting node ${data[nodeIndex]}`, 'info')
        break
      case 3:
      case 4:
        onLog(`📏 Calculating distances to neighboring nodes`, 'warning')
        break
      case 5:
        const visitedNode = Math.floor(Math.random() * data.length)
        setSorted(prev => [...prev, visitedNode])
        onLog(`✅ Node ${data[visitedNode]} processed - shortest path found`, 'success')
        break
      case 6:
        onLog(`🎯 Updating priority queue with new distances`, 'info')
        break
    }
  }

  const simulateGenericStep = () => {
    const randomIndex = Math.floor(Math.random() * data.length)
    setComparing([randomIndex])
    onLog(`🔄 Processing element at index ${randomIndex}`, 'info')
  }

  const getElementColor = (index: number) => {
    if (sorted.includes(index)) return 'from-green-400 to-green-600'
    if (swapping.includes(index)) return 'from-red-400 to-red-600'
    if (comparing.includes(index)) return 'from-yellow-400 to-yellow-600'
    if (index === pivot) return 'from-purple-400 to-purple-600'
    return 'from-blue-400 to-blue-600'
  }

  const getElementHeight = (value: number) => {
    const maxValue = Math.max(...data)
    return (value / maxValue) * 300 + 20
  }

  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
          {algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Visualization
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded"></div>
            <span className="text-gray-300">Default</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
            <span className="text-gray-300">Comparing</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded"></div>
            <span className="text-gray-300">Swapping</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
            <span className="text-gray-300">Sorted</span>
          </div>
        </div>
      </div>

      {/* Algorithm Visualization */}
      <div className="bg-black/20 rounded-xl p-6 min-h-[400px] flex items-end justify-center space-x-2 overflow-x-auto">
        <AnimatePresence>
          {data.map((value, index) => (
            <motion.div
              key={`${algorithm}-${index}`}
              className={`relative flex flex-col items-center justify-end`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Value Label */}
              <motion.div
                className="text-white text-xs font-mono mb-2 px-2 py-1 bg-black/50 rounded"
                animate={{
                  scale: comparing.includes(index) || swapping.includes(index) ? 1.2 : 1,
                  y: comparing.includes(index) || swapping.includes(index) ? -10 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                {value}
              </motion.div>

              {/* Bar Element */}
              <motion.div
                className={`w-8 bg-gradient-to-t ${getElementColor(index)} rounded-t-lg relative overflow-hidden`}
                style={{ height: `${getElementHeight(value)}px` }}
                animate={{
                  scale: comparing.includes(index) || swapping.includes(index) ? 1.1 : 1,
                  rotateX: swapping.includes(index) ? 180 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Glow effect for active elements */}
                {(comparing.includes(index) || swapping.includes(index) || index === pivot) && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-t-lg"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}

                {/* Special indicators */}
                {index === pivot && (
                  <motion.div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8"
                    animate={{ y: [-5, -10, -5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-purple-400"></div>
                  </motion.div>
                )}

                {sorted.includes(index) && (
                  <motion.div
                    className="absolute top-2 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Index Label */}
              <div className="text-gray-400 text-xs mt-2 font-mono">
                {index}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Algorithm Status */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div
            className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
              isPlaying ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
            }`}
            animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
          >
            {isPlaying ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <ArrowUpDown className="w-4 h-4" />
              </motion.div>
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isPlaying ? 'Running' : 'Paused'}
            </span>
          </motion.div>

          <div className="text-white text-sm">
            <span className="opacity-70">Comparisons:</span>
            <span className="ml-2 font-mono text-yellow-400">{currentStep * 2}</span>
          </div>

          <div className="text-white text-sm">
            <span className="opacity-70">Swaps:</span>
            <span className="ml-2 font-mono text-red-400">{Math.floor(currentStep / 2)}</span>
          </div>
        </div>

        <div className="text-white text-sm">
          <span className="opacity-70">Progress:</span>
          <span className="ml-2 font-mono text-blue-400">
            {Math.min(Math.floor((currentStep / 20) * 100), 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}
