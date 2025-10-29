'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, Play, Pause, RotateCcw, Target, MapPin, Zap } from 'lucide-react'

interface Cell {
  row: number
  col: number
  isWall: boolean
  isStart: boolean
  isEnd: boolean
  isVisited: boolean
  isPath: boolean
  distance: number
  previousCell: Cell | null
  id: string
}

interface PathfindingVisualizerProps {
  isPlaying: boolean
  speed?: number
  soundEnabled?: boolean
}

export default function PathfindingVisualizer({ isPlaying, speed = 1, soundEnabled = true }: PathfindingVisualizerProps) {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [algorithm, setAlgorithm] = useState<'dijkstra' | 'astar' | 'bfs' | 'dfs'>('dijkstra')
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentOperation, setCurrentOperation] = useState('')
  const [startCell, setStartCell] = useState<{row: number, col: number}>({row: 5, col: 5})
  const [endCell, setEndCell] = useState<{row: number, col: number}>({row: 15, col: 25})
  const [isDrawing, setIsDrawing] = useState(false)
  const [metrics, setMetrics] = useState({
    visitedNodes: 0,
    pathLength: 0,
    executionTime: 0,
    nodesInQueue: 0
  })

  const ROWS = 20
  const COLS = 30

  useEffect(() => {
    initializeGrid()
  }, [])

  const initializeGrid = () => {
    const newGrid: Cell[][] = []
    for (let row = 0; row < ROWS; row++) {
      const currentRow: Cell[] = []
      for (let col = 0; col < COLS; col++) {
        currentRow.push({
          row,
          col,
          isWall: false,
          isStart: row === startCell.row && col === startCell.col,
          isEnd: row === endCell.row && col === endCell.col,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          previousCell: null,
          id: `cell-${row}-${col}`
        })
      }
      newGrid.push(currentRow)
    }
    setGrid(newGrid)
    resetMetrics()
  }

  const resetMetrics = () => {
    setMetrics({ visitedNodes: 0, pathLength: 0, executionTime: 0, nodesInQueue: 0 })
  }

  const resetGrid = () => {
    const newGrid = grid.map(row =>
      row.map(cell => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previousCell: null
      }))
    )
    setGrid(newGrid)
    resetMetrics()
  }

  const generateMaze = () => {
    const newGrid = [...grid]
    // Create random walls
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!newGrid[row][col].isStart && !newGrid[row][col].isEnd) {
          newGrid[row][col].isWall = Math.random() < 0.3
        }
      }
    }
    setGrid(newGrid)
  }

  const dijkstra = async () => {
    const startTime = Date.now()
    const newGrid = [...grid]
    const unvisitedNodes = getAllNodes(newGrid)
    const startNode = newGrid[startCell.row][startCell.col]
    startNode.distance = 0

    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes)
      const closestNode = unvisitedNodes.shift()!
      
      if (closestNode.isWall) continue
      if (closestNode.distance === Infinity) break

      closestNode.isVisited = true
      setGrid([...newGrid])
      setCurrentOperation(`Visiting node (${closestNode.row}, ${closestNode.col})`)
      setMetrics(prev => ({ 
        ...prev, 
        visitedNodes: prev.visitedNodes + 1,
        nodesInQueue: unvisitedNodes.length
      }))

      await new Promise(resolve => setTimeout(resolve, 50))

      if (closestNode.row === endCell.row && closestNode.col === endCell.col) {
        const path = getShortestPath(closestNode)
        animatePath(path)
        setMetrics(prev => ({ 
          ...prev, 
          pathLength: path.length,
          executionTime: Date.now() - startTime
        }))
        return
      }

      updateUnvisitedNeighbors(closestNode, newGrid)
    }
  }

  const aStar = async () => {
    const startTime = Date.now()
    const newGrid = [...grid]
    const openSet = [newGrid[startCell.row][startCell.col]]
    const closedSet: Cell[] = []
    
    newGrid[startCell.row][startCell.col].distance = 0

    while (openSet.length > 0) {
      let current = openSet[0]
      for (let i = 1; i < openSet.length; i++) {
        const fScore = openSet[i].distance + heuristic(openSet[i], newGrid[endCell.row][endCell.col])
        const currentFScore = current.distance + heuristic(current, newGrid[endCell.row][endCell.col])
        if (fScore < currentFScore) {
          current = openSet[i]
        }
      }

      openSet.splice(openSet.indexOf(current), 1)
      closedSet.push(current)
      current.isVisited = true
      
      setGrid([...newGrid])
      setCurrentOperation(`A* exploring (${current.row}, ${current.col})`)
      setMetrics(prev => ({ 
        ...prev, 
        visitedNodes: prev.visitedNodes + 1,
        nodesInQueue: openSet.length
      }))

      await new Promise(resolve => setTimeout(resolve, 50))

      if (current.row === endCell.row && current.col === endCell.col) {
        const path = getShortestPath(current)
        animatePath(path)
        setMetrics(prev => ({ 
          ...prev, 
          pathLength: path.length,
          executionTime: Date.now() - startTime
        }))
        return
      }

      const neighbors = getNeighbors(current, newGrid)
      for (const neighbor of neighbors) {
        if (closedSet.includes(neighbor) || neighbor.isWall) continue

        const tentativeDistance = current.distance + 1
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor)
        } else if (tentativeDistance >= neighbor.distance) {
          continue
        }

        neighbor.previousCell = current
        neighbor.distance = tentativeDistance
      }
    }
  }

  const heuristic = (nodeA: Cell, nodeB: Cell): number => {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col)
  }

  const getAllNodes = (grid: Cell[][]): Cell[] => {
    const nodes: Cell[] = []
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node)
      }
    }
    return nodes
  }

  const sortNodesByDistance = (unvisitedNodes: Cell[]) => {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance)
  }

  const updateUnvisitedNeighbors = (node: Cell, grid: Cell[][]) => {
    const neighbors = getNeighbors(node, grid)
    for (const neighbor of neighbors) {
      neighbor.distance = node.distance + 1
      neighbor.previousCell = node
    }
  }

  const getNeighbors = (node: Cell, grid: Cell[][]): Cell[] => {
    const neighbors: Cell[] = []
    const { row, col } = node
    
    if (row > 0) neighbors.push(grid[row - 1][col])
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col])
    if (col > 0) neighbors.push(grid[row][col - 1])
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1])
    
    return neighbors.filter(neighbor => !neighbor.isVisited)
  }

  const getShortestPath = (finishNode: Cell): Cell[] => {
    const path: Cell[] = []
    let currentNode: Cell | null = finishNode
    while (currentNode !== null) {
      path.unshift(currentNode)
      currentNode = currentNode.previousCell
    }
    return path
  }

  const animatePath = async (path: Cell[]) => {
    for (let i = 0; i < path.length; i++) {
      setTimeout(() => {
        const newGrid = [...grid]
        newGrid[path[i].row][path[i].col].isPath = true
        setGrid(newGrid)
      }, i * 50)
    }
    setCurrentOperation('Path found!')
  }

  const startPathfinding = async () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    resetGrid()
    
    switch (algorithm) {
      case 'dijkstra':
        await dijkstra()
        break
      case 'astar':
        await aStar()
        break
    }
    
    setIsAnimating(false)
  }

  const handleCellClick = (row: number, col: number) => {
    if (isAnimating) return
    
    const newGrid = [...grid]
    const cell = newGrid[row][col]
    
    if (!cell.isStart && !cell.isEnd) {
      cell.isWall = !cell.isWall
      setGrid(newGrid)
    }
  }

  const getCellClassName = (cell: Cell): string => {
    if (cell.isStart) return 'bg-green-500 border-green-600'
    if (cell.isEnd) return 'bg-red-500 border-red-600'
    if (cell.isPath) return 'bg-yellow-400 border-yellow-500'
    if (cell.isVisited) return 'bg-blue-200 border-blue-300'
    if (cell.isWall) return 'bg-gray-800 border-gray-900'
    return 'bg-white border-gray-300 hover:bg-gray-100'
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
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="astar">A* Search</option>
            <option value="bfs">Breadth-First Search</option>
            <option value="dfs">Depth-First Search</option>
          </select>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Actions</h4>
          <div className="flex space-x-2">
            <button
              onClick={startPathfinding}
              disabled={isAnimating}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              <Play className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={resetGrid}
              disabled={isAnimating}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Generate</h4>
          <button
            onClick={generateMaze}
            disabled={isAnimating}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 mx-auto" />
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Start</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>End</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-800 rounded"></div>
              <span>Wall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Visited Nodes', value: metrics.visitedNodes, color: 'from-blue-500 to-blue-600' },
          { label: 'Path Length', value: metrics.pathLength, color: 'from-green-500 to-green-600' },
          { label: 'Time (ms)', value: metrics.executionTime, color: 'from-purple-500 to-purple-600' },
          { label: 'Queue Size', value: metrics.nodesInQueue, color: 'from-orange-500 to-orange-600' }
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

      {/* Grid Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
            <Navigation className="w-5 h-5 mr-2" />
            {algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Pathfinding
          </h4>
          <div className="text-sm text-gray-600">
            Click cells to toggle walls
          </div>
        </div>
        
        <div className="grid gap-0 border border-gray-400 inline-block" style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`
        }}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <motion.div
                key={cell.id}
                className={`w-4 h-4 border cursor-pointer transition-all duration-200 ${getCellClassName(cell)}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (rowIndex * COLS + colIndex) * 0.001 }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
