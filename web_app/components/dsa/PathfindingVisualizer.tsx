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
  const [endCell, setEndCell] = useState<{row: number, col: number}>({row: 10, col: 15})
  const [isDrawing, setIsDrawing] = useState(false)
  const [metrics, setMetrics] = useState({
    visitedNodes: 0,
    pathLength: 0,
    executionTime: 0,
    nodesInQueue: 0
  })

  const ROWS = 15
  const COLS = 20

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
    const newGrid = grid.map(row => row.map(cell => ({
      ...cell,
      distance: cell.isStart ? 0 : Infinity,
      isVisited: false,
      isPath: false,
      previousCell: null
    })))
    
    const unvisitedNodes = getAllNodes(newGrid)
    const startNode = newGrid[startCell.row][startCell.col]
    
    setCurrentOperation('Starting Dijkstra\'s Algorithm...')
    setGrid([...newGrid])
    await new Promise(resolve => setTimeout(resolve, 1000))

    while (unvisitedNodes.length) {
      // Sort by distance to get the closest unvisited node
      sortNodesByDistance(unvisitedNodes)
      const currentNode = unvisitedNodes.shift()!
      
      // Skip walls
      if (currentNode.isWall) continue
      
      // If we can't reach any more nodes, stop
      if (currentNode.distance === Infinity) {
        setCurrentOperation('No path exists to remaining nodes')
        break
      }

      // Mark as visited
      currentNode.isVisited = true
      
      // Visual feedback
      setGrid([...newGrid])
      setCurrentOperation(`Exploring node (${currentNode.row}, ${currentNode.col}) - Distance: ${currentNode.distance}`)
      setMetrics(prev => ({ 
        ...prev, 
        visitedNodes: prev.visitedNodes + 1,
        nodesInQueue: unvisitedNodes.length
      }))

      // Slower animation for better visualization
      await new Promise(resolve => setTimeout(resolve, 100 / speed))

      // Found the target!
      if (currentNode.row === endCell.row && currentNode.col === endCell.col) {
        const path = getShortestPath(currentNode)
        await animatePath(path)
        setMetrics(prev => ({ 
          ...prev, 
          pathLength: path.length,
          executionTime: Date.now() - startTime
        }))
        setCurrentOperation(`Path found! Total distance: ${currentNode.distance}`)
        return
      }

      // Update distances to neighbors
      await updateUnvisitedNeighbors(currentNode, newGrid)
    }
    
    setCurrentOperation('Algorithm completed - No path found')
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

  const updateUnvisitedNeighbors = async (node: Cell, grid: Cell[][]) => {
    const neighbors = getNeighbors(node, grid)
    
    for (const neighbor of neighbors) {
      // Calculate new distance (assuming each step costs 1)
      const newDistance = node.distance + 1
      
      // Only update if we found a shorter path
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance
        neighbor.previousCell = node
        
        // Visual feedback for distance update
        setCurrentOperation(`Updated distance to (${neighbor.row}, ${neighbor.col}): ${newDistance}`)
        setGrid([...grid])
        await new Promise(resolve => setTimeout(resolve, 50 / speed))
      }
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
    if (cell.isStart) return 'bg-green-500 border-green-600 text-white font-bold'
    if (cell.isEnd) return 'bg-red-500 border-red-600 text-white font-bold'
    if (cell.isPath) return 'bg-yellow-400 border-yellow-500 text-black font-bold'
    if (cell.isVisited) return 'bg-blue-200 border-blue-300 text-blue-800 font-semibold'
    if (cell.isWall) return 'bg-gray-800 border-gray-900'
    return 'bg-white border-gray-300 hover:bg-gray-100 text-gray-600'
  }

  const getCellContent = (cell: Cell): string => {
    if (cell.isStart) return 'S'
    if (cell.isEnd) return 'E'
    if (cell.isWall) return ''
    if (cell.distance === Infinity) return ''
    return cell.distance.toString()
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
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">S</div>
              <span>Start (Distance: 0)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">E</div>
              <span>End (Target)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-800 rounded"></div>
              <span>Wall (Blocked)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 border border-blue-300 text-blue-800 text-xs flex items-center justify-center font-semibold">3</div>
              <span>Visited (Distance shown)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 border border-yellow-500 text-black text-xs flex items-center justify-center font-bold">2</div>
              <span>Shortest Path</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white border border-gray-300 text-gray-600 text-xs flex items-center justify-center">∞</div>
              <span>Unvisited</span>
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

      {/* Distance Analysis */}
      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <Navigation className="w-5 h-5 mr-2" />
          Distance Analysis
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-green-100 p-3 rounded-lg">
            <div className="font-semibold text-green-800">Start Node</div>
            <div className="text-green-600">({startCell.row}, {startCell.col}) - Distance: 0</div>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <div className="font-semibold text-red-800">End Node</div>
            <div className="text-red-600">({endCell.row}, {endCell.col}) - Distance: {
              grid[endCell.row] && grid[endCell.row][endCell.col] 
                ? (grid[endCell.row][endCell.col].distance === Infinity ? '∞' : grid[endCell.row][endCell.col].distance)
                : '∞'
            }</div>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <div className="font-semibold text-blue-800">Visited Nodes</div>
            <div className="text-blue-600">{metrics.visitedNodes} nodes explored</div>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <div className="font-semibold text-purple-800">Algorithm</div>
            <div className="text-purple-600">{algorithm.charAt(0).toUpperCase() + algorithm.slice(1)}</div>
          </div>
        </div>
      </div>

      {/* Grid Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
            <Navigation className="w-5 h-5 mr-2" />
            {algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Pathfinding Grid
          </h4>
          <div className="text-sm text-gray-600">
            Numbers show distance from start • Click cells to toggle walls
          </div>
        </div>
        
        <div className="grid gap-0 border border-gray-400 inline-block" style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`
        }}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <motion.div
                key={cell.id}
                className={`w-8 h-8 border cursor-pointer transition-all duration-200 flex items-center justify-center text-xs ${getCellClassName(cell)}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (rowIndex * COLS + colIndex) * 0.001 }}
                title={`Position: (${rowIndex}, ${colIndex}), Distance: ${cell.distance === Infinity ? '∞' : cell.distance}`}
              >
                {getCellContent(cell)}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
