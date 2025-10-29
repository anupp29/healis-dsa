'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Route, Clock, Infinity, CheckCircle, ArrowRight } from 'lucide-react'

interface Node {
  id: string
  name: string
  city: string
  x: number
  y: number
  distance: number
  visited: boolean
  previous: string | null
}

interface Edge {
  from: string
  to: string
  weight: number
  isInPath: boolean
  isExploring: boolean
}

interface TextbookDijkstraProps {
  isPlaying: boolean
}

export default function TextbookDijkstraGraph({ isPlaying }: TextbookDijkstraProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [currentNode, setCurrentNode] = useState<string>('')
  const [startNode, setStartNode] = useState<string>('A')
  const [endNode, setEndNode] = useState<string>('F')
  const [step, setStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [shortestPath, setShortestPath] = useState<string[]>([])
  const [algorithm, setAlgorithm] = useState<string>('')

  // Traditional Textbook Graph - Indian Hospitals Network
  const initializeGraph = () => {
    const initialNodes: Node[] = [
      { id: 'A', name: 'AIIMS Delhi', city: 'New Delhi', x: 200, y: 100, distance: Infinity, visited: false, previous: null },
      { id: 'B', name: 'PGIMER Chandigarh', city: 'Chandigarh', x: 150, y: 200, distance: Infinity, visited: false, previous: null },
      { id: 'C', name: 'SGPGI Lucknow', city: 'Lucknow', x: 350, y: 150, distance: Infinity, visited: false, previous: null },
      { id: 'D', name: 'Fortis Mumbai', city: 'Mumbai', x: 100, y: 350, distance: Infinity, visited: false, previous: null },
      { id: 'E', name: 'Apollo Chennai', city: 'Chennai', x: 400, y: 400, distance: Infinity, visited: false, previous: null },
      { id: 'F', name: 'NIMHANS Bangalore', city: 'Bangalore', x: 300, y: 300, distance: Infinity, visited: false, previous: null }
    ]

    const initialEdges: Edge[] = [
      { from: 'A', to: 'B', weight: 4, isInPath: false, isExploring: false },
      { from: 'A', to: 'C', weight: 2, isInPath: false, isExploring: false },
      { from: 'B', to: 'C', weight: 1, isInPath: false, isExploring: false },
      { from: 'B', to: 'D', weight: 5, isInPath: false, isExploring: false },
      { from: 'C', to: 'E', weight: 10, isInPath: false, isExploring: false },
      { from: 'C', to: 'F', weight: 3, isInPath: false, isExploring: false },
      { from: 'D', to: 'F', weight: 2, isInPath: false, isExploring: false },
      { from: 'E', to: 'F', weight: 1, isInPath: false, isExploring: false }
    ]

    setNodes(initialNodes)
    setEdges(initialEdges)
  }

  useEffect(() => {
    initializeGraph()
  }, [])

  const resetAlgorithm = () => {
    setNodes(prev => prev.map(node => ({
      ...node,
      distance: node.id === startNode ? 0 : Infinity,
      visited: false,
      previous: null
    })))
    setEdges(prev => prev.map(edge => ({
      ...edge,
      isInPath: false,
      isExploring: false
    })))
    setCurrentNode('')
    setStep(0)
    setIsRunning(false)
    setShortestPath([])
    setAlgorithm('')
  }

  const runDijkstraStep = async () => {
    if (isRunning) return
    setIsRunning(true)

    // Initialize start node
    if (step === 0) {
      setNodes(prev => prev.map(node => ({
        ...node,
        distance: node.id === startNode ? 0 : Infinity,
        visited: false,
        previous: null
      })))
      setAlgorithm('Initializing: Set start node distance to 0, all others to ∞')
      setStep(1)
      setIsRunning(false)
      return
    }

    // Find unvisited node with minimum distance
    const unvisitedNodes = nodes.filter(node => !node.visited)
    if (unvisitedNodes.length === 0) {
      // Algorithm complete - reconstruct path
      reconstructPath()
      setIsRunning(false)
      return
    }

    const currentNodeObj = unvisitedNodes.reduce((min, node) => 
      node.distance < min.distance ? node : min
    )

    if (currentNodeObj.distance === Infinity) {
      setAlgorithm('No path exists to remaining nodes')
      setIsRunning(false)
      return
    }

    setCurrentNode(currentNodeObj.id)
    setAlgorithm(`Visiting node ${currentNodeObj.id} (${currentNodeObj.name}) with distance ${currentNodeObj.distance}`)

    // Mark current node as visited
    setNodes(prev => prev.map(node => 
      node.id === currentNodeObj.id ? { ...node, visited: true } : node
    ))

    // Update distances to neighbors
    const neighbors = edges.filter(edge => 
      edge.from === currentNodeObj.id || edge.to === currentNodeObj.id
    )

    for (const edge of neighbors) {
      const neighborId = edge.from === currentNodeObj.id ? edge.to : edge.from
      const neighbor = nodes.find(n => n.id === neighborId)
      
      if (neighbor && !neighbor.visited) {
        const newDistance = currentNodeObj.distance + edge.weight
        
        // Highlight exploring edge
        setEdges(prev => prev.map(e => 
          e === edge ? { ...e, isExploring: true } : { ...e, isExploring: false }
        ))

        if (newDistance < neighbor.distance) {
          setNodes(prev => prev.map(node => 
            node.id === neighborId 
              ? { ...node, distance: newDistance, previous: currentNodeObj.id }
              : node
          ))
          
          setAlgorithm(prev => prev + ` | Updated ${neighborId}: ${neighbor.distance} → ${newDistance}`)
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Clear exploring edges
    setEdges(prev => prev.map(edge => ({ ...edge, isExploring: false })))

    if (currentNodeObj.id === endNode) {
      reconstructPath()
    }

    setStep(prev => prev + 1)
    setIsRunning(false)
  }

  const reconstructPath = () => {
    const path: string[] = []
    let current = endNode
    
    while (current !== null) {
      path.unshift(current)
      const node = nodes.find(n => n.id === current)
      current = node?.previous || null
    }
    
    setShortestPath(path)
    
    // Highlight path edges
    setEdges(prev => prev.map(edge => {
      const isInPath = path.some((nodeId, index) => {
        if (index === 0) return false
        const prevNodeId = path[index - 1]
        return (edge.from === prevNodeId && edge.to === nodeId) ||
               (edge.to === prevNodeId && edge.from === nodeId)
      })
      return { ...edge, isInPath }
    }))
    
    const endNodeObj = nodes.find(n => n.id === endNode)
    setAlgorithm(`Shortest path found! Distance: ${endNodeObj?.distance} | Path: ${path.join(' → ')}`)
  }

  const runCompleteAlgorithm = async () => {
    resetAlgorithm()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    while (step < 20) { // Safety limit
      await runDijkstraStep()
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const unvisited = nodes.filter(n => !n.visited)
      if (unvisited.length === 0 || unvisited.every(n => n.distance === Infinity)) {
        break
      }
    }
  }

  useEffect(() => {
    if (isPlaying && !isRunning) {
      const interval = setInterval(() => {
        runDijkstraStep()
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [isPlaying, isRunning, step])

  const getNodeColor = (node: Node) => {
    if (node.id === startNode) return 'from-green-500 to-green-600 border-green-400'
    if (node.id === endNode) return 'from-red-500 to-red-600 border-red-400'
    if (node.id === currentNode) return 'from-yellow-500 to-yellow-600 border-yellow-400'
    if (node.visited) return 'from-blue-500 to-blue-600 border-blue-400'
    return 'from-gray-400 to-gray-500 border-gray-300'
  }

  const getEdgeColor = (edge: Edge) => {
    if (edge.isInPath) return '#10B981' // Green for shortest path
    if (edge.isExploring) return '#F59E0B' // Yellow for exploring
    return '#9CA3AF' // Gray for normal
  }

  const getEdgeWidth = (edge: Edge) => {
    if (edge.isInPath) return 4
    if (edge.isExploring) return 3
    return 2
  }

  return (
    <div className="space-y-8">
      {/* Algorithm Status */}
      <div className="text-center">
        <AnimatePresence>
          {algorithm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-mono text-sm shadow-2xl max-w-4xl"
            >
              {algorithm}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Start:</label>
          <select
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isRunning}
          >
            {nodes.map(node => (
              <option key={node.id} value={node.id}>{node.id} - {node.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">End:</label>
          <select
            value={endNode}
            onChange={(e) => setEndNode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isRunning}
          >
            {nodes.map(node => (
              <option key={node.id} value={node.id}>{node.id} - {node.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={runDijkstraStep}
          disabled={isRunning}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          Next Step
        </button>

        <button
          onClick={runCompleteAlgorithm}
          disabled={isRunning}
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          Run Complete
        </button>

        <button
          onClick={resetAlgorithm}
          className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Reset
        </button>
      </div>

      {/* Traditional Textbook Graph Visualization */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <h3 className="text-2xl font-display font-bold text-gray-800 mb-6 text-center">
          Dijkstra's Algorithm - Traditional Graph Representation
        </h3>
        
        <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-gray-200 overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#9CA3AF" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full">
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from)
              const toNode = nodes.find(n => n.id === edge.to)
              
              if (!fromNode || !toNode) return null

              const midX = (fromNode.x + toNode.x) / 2
              const midY = (fromNode.y + toNode.y) / 2

              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <motion.line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={getEdgeColor(edge)}
                    strokeWidth={getEdgeWidth(edge)}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                  
                  {/* Edge Weight */}
                  <motion.circle
                    cx={midX}
                    cy={midY}
                    r="15"
                    fill="white"
                    stroke={getEdgeColor(edge)}
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                  />
                  <text
                    x={midX}
                    y={midY + 5}
                    textAnchor="middle"
                    className="text-sm font-bold fill-gray-800"
                  >
                    {edge.weight}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                node.id === currentNode ? 'z-30' : 'z-20'
              }`}
              style={{ left: node.x, top: node.y }}
            >
              <div className={`relative p-4 rounded-2xl border-3 shadow-xl ${getNodeColor(node)} bg-gradient-to-br text-white min-w-32 ${
                node.id === currentNode ? 'ring-4 ring-yellow-300 scale-110' : ''
              } transition-all duration-300`}>
                
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{node.id}</div>
                  <div className="text-xs font-semibold opacity-90">{node.name}</div>
                  <div className="text-xs opacity-80">{node.city}</div>
                  
                  {/* Distance Display */}
                  <div className="mt-2 bg-black/20 rounded-lg p-2">
                    <div className="text-xs opacity-80">Distance:</div>
                    <div className="font-mono font-bold">
                      {node.distance === Infinity ? '∞' : node.distance}
                    </div>
                  </div>
                  
                  {/* Previous Node */}
                  {node.previous && (
                    <div className="mt-1 text-xs opacity-80">
                      via {node.previous}
                    </div>
                  )}
                </div>

                {/* Status Indicators */}
                {node.visited && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {node.id === startNode && (
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {node.id === endNode && (
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <Route className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Distance Table - Traditional Textbook Style */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h4 className="text-xl font-display font-bold text-gray-800 mb-4 text-center">
          Distance Table (Traditional Textbook Format)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 font-mono font-bold">Node</th>
                <th className="border border-gray-300 px-4 py-2 font-mono font-bold">Hospital</th>
                <th className="border border-gray-300 px-4 py-2 font-mono font-bold">Distance</th>
                <th className="border border-gray-300 px-4 py-2 font-mono font-bold">Previous</th>
                <th className="border border-gray-300 px-4 py-2 font-mono font-bold">Visited</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map(node => (
                <tr key={node.id} className={`${
                  node.id === currentNode ? 'bg-yellow-100' : 
                  node.visited ? 'bg-blue-50' : 'bg-white'
                } transition-colors duration-300`}>
                  <td className="border border-gray-300 px-4 py-2 font-mono font-bold text-center">
                    {node.id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {node.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-mono text-center font-bold">
                    {node.distance === Infinity ? '∞' : node.distance}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-mono text-center">
                    {node.previous || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {node.visited ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shortest Path Result */}
      {shortestPath.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <h4 className="text-2xl font-display font-bold mb-4">Shortest Path Found!</h4>
          <div className="flex items-center justify-center space-x-2 text-xl font-mono">
            {shortestPath.map((nodeId, index) => (
              <div key={nodeId} className="flex items-center">
                <span className="bg-white/20 px-3 py-1 rounded-lg font-bold">
                  {nodeId}
                </span>
                {index < shortestPath.length - 1 && (
                  <ArrowRight className="w-6 h-6 mx-2" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-lg">
            Total Distance: <span className="font-bold text-2xl">
              {nodes.find(n => n.id === endNode)?.distance}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
