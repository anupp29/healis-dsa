'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TreePine, Plus, Minus, Search, RotateCcw, Play, Pause, Code, Zap } from 'lucide-react'

interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
  id: string
  x?: number
  y?: number
  isHighlighted?: boolean
  isComparing?: boolean
  isFound?: boolean
}

interface BinarySearchTreeVisualizerProps {
  isPlaying: boolean
  speed?: number
  soundEnabled?: boolean
}

export default function BinarySearchTreeVisualizer({ isPlaying, speed = 1, soundEnabled = true }: BinarySearchTreeVisualizerProps) {
  const [root, setRoot] = useState<TreeNode | null>(null)
  const [currentOperation, setCurrentOperation] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [algorithmSteps, setAlgorithmSteps] = useState<string[]>([])
  const [executionTrace, setExecutionTrace] = useState<string[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState({
    operations: 0,
    comparisons: 0,
    height: 0,
    nodes: 0
  })

  // Initialize with sample data
  useEffect(() => {
    const sampleValues = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]
    sampleValues.forEach(value => insertNode(value, false))
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || isAnimating) return

    const interval = setInterval(() => {
      const randomValue = Math.floor(Math.random() * 100) + 1
      if (Math.random() > 0.3) {
        insertNode(randomValue, true)
      } else if (root) {
        const nodeToDelete = getRandomNodeValue(root)
        if (nodeToDelete) deleteNode(nodeToDelete, true)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [isPlaying, isAnimating, root])

  const createNode = (value: number): TreeNode => ({
    value,
    left: null,
    right: null,
    id: `node-${value}-${Date.now()}`,
    isHighlighted: false,
    isComparing: false,
    isFound: false
  })

  // Perfect BST utility functions
  const calculateHeight = (node: TreeNode | null): number => {
    if (!node) return 0
    return 1 + Math.max(calculateHeight(node.left), calculateHeight(node.right))
  }

  const countNodes = (node: TreeNode | null): number => {
    if (!node) return 0
    return 1 + countNodes(node.left) + countNodes(node.right)
  }

  const isValidBST = (node: TreeNode | null, min: number = -Infinity, max: number = Infinity): boolean => {
    if (!node) return true
    if (node.value <= min || node.value >= max) return false
    return isValidBST(node.left, min, node.value) && isValidBST(node.right, node.value, max)
  }

  const findMin = (node: TreeNode | null): TreeNode | null => {
    if (!node) return null
    while (node.left) node = node.left
    return node
  }

  const findMax = (node: TreeNode | null): TreeNode | null => {
    if (!node) return null
    while (node.right) node = node.right
    return node
  }

  const insertNode = useCallback(async (value: number, animated: boolean = true) => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setCurrentOperation(`Inserting ${value}`)
    setExecutionTrace(prev => [...prev, `INSERT(${value})`])
    
    const steps = [`Starting insertion of ${value}`, `Traversing tree to find correct position`]
    setAlgorithmSteps(steps)
    setCurrentStep(0)

    const insertRecursive = async (node: TreeNode | null, parent: TreeNode | null = null, isLeft: boolean = true): Promise<TreeNode> => {
      // Base case: found insertion point
      if (!node) {
        const newNode = createNode(value)
        setPerformanceMetrics(prev => ({ 
          ...prev, 
          operations: prev.operations + 1,
          nodes: prev.nodes + 1,
          height: Math.max(prev.height, calculateHeight(root) + 1)
        }))
        return newNode
      }

      // Handle duplicate values
      if (node.value === value) {
        setCurrentOperation(`Value ${value} already exists in tree`)
        return node
      }

      if (animated) {
        node.isComparing = true
        setRoot(prevRoot => ({ ...prevRoot! }))
        setCurrentOperation(`Comparing ${value} with ${node.value}`)
        await new Promise(resolve => setTimeout(resolve, 800 / speed))
      }

      setPerformanceMetrics(prev => ({ ...prev, comparisons: prev.comparisons + 1 }))

      if (value < node.value) {
        setAlgorithmSteps(prev => [...prev, `${value} < ${node.value}, go left`])
        node.left = await insertRecursive(node.left, node, true)
      } else if (value > node.value) {
        setAlgorithmSteps(prev => [...prev, `${value} > ${node.value}, go right`])
        node.right = await insertRecursive(node.right, node, false)
      }

      node.isComparing = false
      return node
    }

    const newRoot = await insertRecursive(root)
    setRoot(newRoot)
    calculatePositions(newRoot)
    
    setCurrentOperation('')
    setIsAnimating(false)
    updateHeight()
  }, [root, isAnimating])

  const deleteNode = useCallback(async (value: number, animated: boolean = true) => {
    if (isAnimating || !root) return
    
    setIsAnimating(true)
    setCurrentOperation(`Deleting ${value}`)
    setExecutionTrace(prev => [...prev, `DELETE(${value})`])

    const deleteRecursive = async (node: TreeNode | null): Promise<TreeNode | null> => {
      if (!node) return null

      if (animated) {
        node.isComparing = true
        setRoot(prevRoot => ({ ...prevRoot! }))
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      if (value < node.value) {
        node.left = await deleteRecursive(node.left)
      } else if (value > node.value) {
        node.right = await deleteRecursive(node.right)
      } else {
        // Node to delete found
        if (!node.left) return node.right
        if (!node.right) return node.left

        // Node with two children
        const minRight = findMin(node.right)
        node.value = minRight.value
        node.right = await deleteRecursive(node.right)
      }

      node.isComparing = false
      return node
    }

    const newRoot = await deleteRecursive(root)
    setRoot(newRoot)
    if (newRoot) calculatePositions(newRoot)
    
    setPerformanceMetrics(prev => ({ 
      ...prev, 
      operations: prev.operations + 1,
      nodes: Math.max(0, prev.nodes - 1)
    }))
    
    setCurrentOperation('')
    setIsAnimating(false)
    updateHeight()
  }, [root, isAnimating])

  const searchNode = useCallback(async (value: number) => {
    if (isAnimating || !root) return
    
    setIsAnimating(true)
    setCurrentOperation(`Searching for ${value}`)
    setExecutionTrace(prev => [...prev, `SEARCH(${value})`])

    const searchRecursive = async (node: TreeNode | null): Promise<boolean> => {
      if (!node) return false

      node.isComparing = true
      setRoot(prevRoot => ({ ...prevRoot! }))
      await new Promise(resolve => setTimeout(resolve, 1000))

      setPerformanceMetrics(prev => ({ ...prev, comparisons: prev.comparisons + 1 }))

      if (value === node.value) {
        node.isFound = true
        setCurrentOperation(`Found ${value}!`)
        return true
      }

      node.isComparing = false

      if (value < node.value) {
        return await searchRecursive(node.left)
      } else {
        return await searchRecursive(node.right)
      }
    }

    const found = await searchRecursive(root)
    
    setTimeout(() => {
      clearHighlights(root)
      setCurrentOperation('')
      setIsAnimating(false)
    }, 2000)
  }, [root, isAnimating])


  const getRandomNodeValue = (node: TreeNode | null): number | null => {
    if (!node) return null
    const values: number[] = []
    const collectValues = (n: TreeNode | null) => {
      if (n) {
        values.push(n.value)
        collectValues(n.left)
        collectValues(n.right)
      }
    }
    collectValues(node)
    return values[Math.floor(Math.random() * values.length)]
  }

  const clearHighlights = (node: TreeNode | null) => {
    if (node) {
      node.isHighlighted = false
      node.isComparing = false
      node.isFound = false
      clearHighlights(node.left)
      clearHighlights(node.right)
    }
  }

  const calculatePositions = (node: TreeNode | null, x: number = 400, y: number = 50, level: number = 0) => {
    if (!node) return
    
    const horizontalSpacing = Math.max(80, 200 / (level + 1))
    
    node.x = x
    node.y = y
    
    if (node.left) {
      calculatePositions(node.left, x - horizontalSpacing, y + 80, level + 1)
    }
    if (node.right) {
      calculatePositions(node.right, x + horizontalSpacing, y + 80, level + 1)
    }
  }

  const updateHeight = () => {
    const getHeight = (node: TreeNode | null): number => {
      if (!node) return 0
      return 1 + Math.max(getHeight(node.left), getHeight(node.right))
    }
    setPerformanceMetrics(prev => ({ ...prev, height: getHeight(root) }))
  }

  const resetTree = () => {
    setRoot(null)
    setCurrentOperation('')
    setExecutionTrace([])
    setPerformanceMetrics({ operations: 0, comparisons: 0, height: 0, nodes: 0 })
  }

  const handleInsert = () => {
    const value = parseInt(inputValue)
    if (!isNaN(value)) {
      insertNode(value, true)
      setInputValue('')
    }
  }

  const handleDelete = () => {
    const value = parseInt(inputValue)
    if (!isNaN(value)) {
      deleteNode(value, true)
      setInputValue('')
    }
  }

  const handleSearch = () => {
    const value = parseInt(searchValue)
    if (!isNaN(value)) {
      searchNode(value)
      setSearchValue('')
    }
  }

  const renderTree = (node: TreeNode | null): JSX.Element | null => {
    if (!node) return null

    return (
      <g key={node.id}>
        {/* Edges */}
        {node.left && (
          <motion.line
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            stroke="#94a3b8"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
        {node.right && (
          <motion.line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="#94a3b8"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Node */}
        <motion.circle
          cx={node.x}
          cy={node.y}
          r="25"
          fill={node.isFound ? '#10b981' : node.isComparing ? '#f59e0b' : '#3b82f6'}
          stroke={node.isHighlighted ? '#ef4444' : '#1e40af'}
          strokeWidth="3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="cursor-pointer hover:stroke-red-500"
          onClick={() => deleteNode(node.value, true)}
        />
        
        <motion.text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {node.value}
        </motion.text>

        {/* Recursively render children */}
        {renderTree(node.left)}
        {renderTree(node.right)}
      </g>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Operation Display */}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insert Controls */}
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Insert Node
          </h4>
          <div className="flex space-x-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter value"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleInsert()}
            />
            <button
              onClick={handleInsert}
              disabled={isAnimating || !inputValue}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Search Controls */}
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Search Node
          </h4>
          <div className="flex space-x-2">
            <input
              type="number"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search value"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isAnimating || !searchValue}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              Find
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Actions
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Code className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={resetTree}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Operations', value: performanceMetrics.operations, color: 'from-blue-500 to-blue-600' },
          { label: 'Comparisons', value: performanceMetrics.comparisons, color: 'from-green-500 to-green-600' },
          { label: 'Tree Height', value: performanceMetrics.height, color: 'from-purple-500 to-purple-600' },
          { label: 'Total Nodes', value: performanceMetrics.nodes, color: 'from-orange-500 to-orange-600' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-r ${metric.color} text-white p-4 rounded-xl shadow-lg`}
          >
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="text-sm opacity-90">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tree Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200 min-h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
            <TreePine className="w-5 h-5 mr-2" />
            Binary Search Tree Visualization
          </h4>
          <div className="text-sm text-gray-600">
            Click nodes to delete • Tree Height: {performanceMetrics.height}
          </div>
        </div>
        
        {root ? (
          <svg width="800" height="400" className="mx-auto">
            {renderTree(root)}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <TreePine className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Tree is empty. Add some nodes to get started!</p>
            </div>
          </div>
        )}
      </div>

      {/* Code Visualization */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm overflow-hidden"
          >
            <h4 className="text-white font-bold mb-4">BST Implementation</h4>
            <pre className="whitespace-pre-wrap">
{`class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function insert(root, value) {
  if (!root) return new TreeNode(value);
  
  if (value < root.value) {
    root.left = insert(root.left, value);
  } else if (value > root.value) {
    root.right = insert(root.right, value);
  }
  
  return root;
}

function search(root, value) {
  if (!root || root.value === value) return root;
  
  if (value < root.value) {
    return search(root.left, value);
  }
  
  return search(root.right, value);
}`}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution Trace */}
      {executionTrace.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Execution Trace</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {executionTrace.slice(-10).map((trace, index) => (
              <div key={index} className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {trace}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
