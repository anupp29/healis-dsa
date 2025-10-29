'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Play, Pause, RotateCcw, Shuffle, Code, Zap } from 'lucide-react'

interface SortItem {
  value: number
  id: string
  isComparing?: boolean
  isSwapping?: boolean
  isSorted?: boolean
  isPivot?: boolean
}

interface SortingVisualizerProps {
  isPlaying: boolean
  speed?: number
  soundEnabled?: boolean
}

export default function SortingVisualizer({ isPlaying, speed = 1, soundEnabled = true }: SortingVisualizerProps) {
  const [array, setArray] = useState<SortItem[]>([])
  const [algorithm, setAlgorithm] = useState<'bubble' | 'quick' | 'merge' | 'heap'>('bubble')
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentOperation, setCurrentOperation] = useState<string>('')
  const [arraySize, setArraySize] = useState(20)
  const [animationSpeed, setAnimationSpeed] = useState(100)
  const [showCode, setShowCode] = useState(false)
  const [metrics, setMetrics] = useState({
    comparisons: 0,
    swaps: 0,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)'
  })

  useEffect(() => {
    generateRandomArray()
  }, [arraySize])

  const generateRandomArray = () => {
    const newArray: SortItem[] = []
    for (let i = 0; i < arraySize; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 300) + 10,
        id: `item-${i}-${Date.now()}`
      })
    }
    setArray(newArray)
    resetMetrics()
  }

  const resetMetrics = () => {
    setMetrics(prev => ({ ...prev, comparisons: 0, swaps: 0 }))
  }

  const bubbleSort = async () => {
    const arr = [...array]
    const n = arr.length
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Highlight comparing elements
        arr[j].isComparing = true
        arr[j + 1].isComparing = true
        setArray([...arr])
        setCurrentOperation(`Comparing ${arr[j].value} and ${arr[j + 1].value}`)
        await new Promise(resolve => setTimeout(resolve, animationSpeed / speed))
        
        setMetrics(prev => ({ ...prev, comparisons: prev.comparisons + 1 }))
        
        if (arr[j].value > arr[j + 1].value) {
          // Swap elements
          arr[j].isSwapping = true;
          arr[j + 1].isSwapping = true;
          setArray([...arr]);
          await new Promise(resolve => setTimeout(resolve, animationSpeed / speed));
          
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setMetrics(prev => ({ ...prev, swaps: prev.swaps + 1 }));
          
          arr[j].isSwapping = false;
          arr[j + 1].isSwapping = false;
        }
        
        arr[j].isComparing = false
        arr[j + 1].isComparing = false
        setArray([...arr])
      }
      arr[n - 1 - i].isSorted = true
    }
    arr[0].isSorted = true
    setArray([...arr])
    setCurrentOperation('Sorting complete!')
  }

  const quickSort = async () => {
    const arr = [...array]
    
    const partition = async (low: number, high: number): Promise<number> => {
      const pivot = arr[high]
      pivot.isPivot = true
      setArray([...arr])
      await new Promise(resolve => setTimeout(resolve, animationSpeed / speed))
      
      let i = low - 1
      
      for (let j = low; j < high; j++) {
        arr[j].isComparing = true
        setArray([...arr])
        setCurrentOperation(`Comparing ${arr[j].value} with pivot ${pivot.value}`)
        await new Promise(resolve => setTimeout(resolve, animationSpeed / speed))
        
        setMetrics(prev => ({ ...prev, comparisons: prev.comparisons + 1 }))
        
        if (arr[j].value < pivot.value) {
          i++
          if (i !== j) {
            arr[i].isSwapping = true
            arr[j].isSwapping = true
            setArray([...arr])
            await new Promise(resolve => setTimeout(resolve, animationSpeed / speed))
            
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            setMetrics(prev => ({ ...prev, swaps: prev.swaps + 1 }));
            
            arr[i].isSwapping = false;
            arr[j].isSwapping = false;
          }
        }
        
        arr[j].isComparing = false
        setArray([...arr])
      }
      
      const temp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = temp;
      pivot.isPivot = false;
      arr[i + 1].isSorted = true;
      setArray([...arr]);
      
      return i + 1
    }
    
    const quickSortRecursive = async (low: number, high: number) => {
      if (low < high) {
        const pi = await partition(low, high)
        await quickSortRecursive(low, pi - 1)
        await quickSortRecursive(pi + 1, high)
      }
    }
    
    await quickSortRecursive(0, arr.length - 1)
    arr.forEach(item => item.isSorted = true)
    setArray([...arr])
    setCurrentOperation('Quick sort complete!')
  }

  const startSorting = async () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    resetMetrics()
    
    // Clear all highlights
    const cleanArray = array.map(item => ({
      ...item,
      isComparing: false,
      isSwapping: false,
      isSorted: false,
      isPivot: false
    }))
    setArray(cleanArray)
    
    switch (algorithm) {
      case 'bubble':
        setMetrics(prev => ({ ...prev, timeComplexity: 'O(n²)', spaceComplexity: 'O(1)' }))
        await bubbleSort()
        break
      case 'quick':
        setMetrics(prev => ({ ...prev, timeComplexity: 'O(n log n)', spaceComplexity: 'O(log n)' }))
        await quickSort()
        break
    }
    
    setIsAnimating(false)
  }

  const getBarColor = (item: SortItem) => {
    if (item.isSorted) return 'bg-gradient-to-t from-green-400 to-green-500'
    if (item.isPivot) return 'bg-gradient-to-t from-purple-400 to-purple-500'
    if (item.isSwapping) return 'bg-gradient-to-t from-red-400 to-red-500'
    if (item.isComparing) return 'bg-gradient-to-t from-yellow-400 to-yellow-500'
    return 'bg-gradient-to-t from-blue-400 to-blue-500'
  }

  return (
    <div className="space-y-6">
      {/* Current Operation */}
      <div className="text-center">
        <AnimatePresence>
          {currentOperation && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-medium shadow-lg"
            >
              {currentOperation}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isAnimating}
          >
            <option value="bubble">Bubble Sort</option>
            <option value="quick">Quick Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="heap">Heap Sort</option>
          </select>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Array Size: {arraySize}</label>
          <input
            type="range"
            min="10"
            max="50"
            value={arraySize}
            onChange={(e) => setArraySize(parseInt(e.target.value))}
            className="w-full"
            disabled={isAnimating}
          />
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Speed: {animationSpeed}ms</label>
          <input
            type="range"
            min="10"
            max="500"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
            className="w-full"
            disabled={isAnimating}
          />
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={startSorting}
              disabled={isAnimating}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              <Play className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={generateRandomArray}
              disabled={isAnimating}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Comparisons', value: metrics.comparisons, color: 'from-blue-500 to-blue-600' },
          { label: 'Swaps', value: metrics.swaps, color: 'from-red-500 to-red-600' },
          { label: 'Time', value: metrics.timeComplexity, color: 'from-green-500 to-green-600' },
          { label: 'Space', value: metrics.spaceComplexity, color: 'from-purple-500 to-purple-600' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-r ${metric.color} text-white p-4 rounded-xl shadow-lg`}
          >
            <div className="text-xl font-bold">{metric.value}</div>
            <div className="text-sm opacity-90">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200 min-h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            {algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort Visualization
          </h4>
        </div>
        
        <div className="flex items-end justify-center space-x-1 h-80">
          {array.map((item, index) => (
            <motion.div
              key={item.id}
              className={`${getBarColor(item)} rounded-t-lg shadow-sm relative`}
              style={{
                height: `${(item.value / 300) * 100}%`,
                width: `${Math.max(800 / arraySize - 2, 8)}px`
              }}
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / 300) * 100}%` }}
              transition={{ duration: 0.3 }}
            >
              {arraySize <= 20 && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
                  {item.value}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
