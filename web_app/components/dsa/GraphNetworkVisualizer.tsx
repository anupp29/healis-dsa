'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Route, Clock, Users, Activity, Navigation, Zap, Building } from 'lucide-react'

interface Hospital {
  id: string
  name: string
  city: string
  specialties: string[]
  capacity: number
  currentLoad: number
  coordinates: { x: number; y: number }
  type: 'government' | 'private' | 'specialty'
}

interface Connection {
  from: string
  to: string
  distance: number
  time: number
  cost: number
}

interface PathStep {
  hospitalId: string
  distance: number
  totalDistance: number
}

interface GraphNetworkVisualizerProps {
  isPlaying: boolean
  speed?: number
  soundEnabled?: boolean
}

export default function GraphNetworkVisualizer({ isPlaying, speed = 1, soundEnabled = true }: GraphNetworkVisualizerProps) {
  const [selectedStart, setSelectedStart] = useState<string>('')
  const [selectedEnd, setSelectedEnd] = useState<string>('')
  const [shortestPath, setShortestPath] = useState<PathStep[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [currentOperation, setCurrentOperation] = useState('')
  const [animationStep, setAnimationStep] = useState(0)

  // Indian Hospital Network Data
  const hospitals: Hospital[] = [
    { id: 'AIIMS_DEL', name: 'AIIMS Delhi', city: 'New Delhi', specialties: ['Cardiology', 'Neurology', 'Oncology'], capacity: 2500, currentLoad: 85, coordinates: { x: 300, y: 150 }, type: 'government' },
    { id: 'APOLLO_CHN', name: 'Apollo Chennai', city: 'Chennai', specialties: ['Cardiac Surgery', 'Transplant'], capacity: 1000, currentLoad: 72, coordinates: { x: 400, y: 400 }, type: 'private' },
    { id: 'FORTIS_MUM', name: 'Fortis Mumbai', city: 'Mumbai', specialties: ['Emergency', 'Trauma'], capacity: 800, currentLoad: 90, coordinates: { x: 200, y: 300 }, type: 'private' },
    { id: 'PGIMER_CHD', name: 'PGIMER Chandigarh', city: 'Chandigarh', specialties: ['Neurosurgery', 'Pediatrics'], capacity: 1200, currentLoad: 78, coordinates: { x: 280, y: 100 }, type: 'government' },
    { id: 'NIMHANS_BLR', name: 'NIMHANS Bangalore', city: 'Bangalore', specialties: ['Neurology', 'Psychiatry'], capacity: 600, currentLoad: 65, coordinates: { x: 350, y: 350 }, type: 'specialty' },
    { id: 'SGPGI_LKO', name: 'SGPGI Lucknow', city: 'Lucknow', specialties: ['Gastroenterology', 'Nephrology'], capacity: 900, currentLoad: 70, coordinates: { x: 320, y: 200 }, type: 'government' },
    { id: 'TATA_MUM', name: 'Tata Memorial Mumbai', city: 'Mumbai', specialties: ['Oncology', 'Cancer Care'], capacity: 700, currentLoad: 88, coordinates: { x: 180, y: 320 }, type: 'specialty' },
    { id: 'CMC_VEL', name: 'CMC Vellore', city: 'Vellore', specialties: ['Multi-specialty'], capacity: 1100, currentLoad: 82, coordinates: { x: 380, y: 380 }, type: 'private' }
  ]

  const connections: Connection[] = [
    { from: 'AIIMS_DEL', to: 'PGIMER_CHD', distance: 250, time: 4, cost: 5000 },
    { from: 'AIIMS_DEL', to: 'SGPGI_LKO', distance: 550, time: 8, cost: 8000 },
    { from: 'FORTIS_MUM', to: 'TATA_MUM', distance: 25, time: 1, cost: 1000 },
    { from: 'FORTIS_MUM', to: 'APOLLO_CHN', distance: 1200, time: 18, cost: 15000 },
    { from: 'APOLLO_CHN', to: 'CMC_VEL', distance: 140, time: 3, cost: 3000 },
    { from: 'APOLLO_CHN', to: 'NIMHANS_BLR', distance: 350, time: 6, cost: 6000 },
    { from: 'NIMHANS_BLR', to: 'CMC_VEL', distance: 220, time: 4, cost: 4000 },
    { from: 'SGPGI_LKO', to: 'AIIMS_DEL', distance: 550, time: 8, cost: 8000 },
    { from: 'PGIMER_CHD', to: 'SGPGI_LKO', distance: 600, time: 9, cost: 9000 },
    { from: 'TATA_MUM', to: 'NIMHANS_BLR', distance: 850, time: 12, cost: 12000 }
  ]

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      const randomStart = hospitals[Math.floor(Math.random() * hospitals.length)]
      const randomEnd = hospitals[Math.floor(Math.random() * hospitals.length)]
      
      if (randomStart.id !== randomEnd.id) {
        setSelectedStart(randomStart.id)
        setSelectedEnd(randomEnd.id)
        setTimeout(() => findShortestPath(randomStart.id, randomEnd.id), 500)
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const findShortestPath = async (startId: string, endId: string) => {
    if (!startId || !endId || startId === endId) return

    setIsCalculating(true)
    setCurrentOperation('Calculating shortest path using Dijkstra\'s algorithm...')
    setAnimationStep(0)

    // Simulate algorithm steps
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Dijkstra's algorithm implementation
    const distances: { [key: string]: number } = {}
    const previous: { [key: string]: string | null } = {}
    const unvisited = new Set<string>()

    // Initialize distances
    hospitals.forEach(hospital => {
      distances[hospital.id] = hospital.id === startId ? 0 : Infinity
      previous[hospital.id] = null
      unvisited.add(hospital.id)
    })

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current = ''
      let minDistance = Infinity
      
      for (const nodeId of Array.from(unvisited)) {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId]
          current = nodeId
        }
      }

      if (current === '' || distances[current] === Infinity) break

      unvisited.delete(current)

      if (current === endId) break

      // Update distances to neighbors
      const neighbors = connections.filter(conn => 
        conn.from === current || conn.to === current
      )

      for (const connection of neighbors) {
        const neighbor = connection.from === current ? connection.to : connection.from
        if (!unvisited.has(neighbor)) continue

        const newDistance = distances[current] + connection.distance
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance
          previous[neighbor] = current
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300))
      setAnimationStep(prev => prev + 1)
    }

    // Reconstruct path
    const path: PathStep[] = []
    let current = endId
    let totalDistance = 0

    while (current !== null) {
      const connection = connections.find(conn => 
        (conn.from === previous[current] && conn.to === current) ||
        (conn.to === previous[current] && conn.from === current)
      )
      
      path.unshift({
        hospitalId: current,
        distance: connection?.distance || 0,
        totalDistance: distances[current]
      })
      
      current = previous[current]
    }

    setShortestPath(path)
    setIsCalculating(false)
    setCurrentOperation(`Shortest path found! Total distance: ${distances[endId]}km`)
    
    setTimeout(() => setCurrentOperation(''), 3000)
  }

  const getHospitalColor = (type: string) => {
    switch (type) {
      case 'government': return 'from-blue-500 to-blue-600'
      case 'private': return 'from-green-500 to-green-600'
      case 'specialty': return 'from-purple-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getHospitalBg = (type: string) => {
    switch (type) {
      case 'government': return 'from-blue-50 to-blue-100'
      case 'private': return 'from-green-50 to-green-100'
      case 'specialty': return 'from-purple-50 to-purple-100'
      default: return 'from-gray-50 to-gray-100'
    }
  }

  const isInPath = (hospitalId: string) => {
    return shortestPath.some(step => step.hospitalId === hospitalId)
  }

  const getConnectionOpacity = (connection: Connection) => {
    const isInShortestPath = shortestPath.some((step, index) => {
      if (index === 0) return false
      const prevStep = shortestPath[index - 1]
      return (step.hospitalId === connection.from && prevStep.hospitalId === connection.to) ||
             (step.hospitalId === connection.to && prevStep.hospitalId === connection.from)
    })
    return isInShortestPath ? 1 : 0.3
  }

  return (
    <div className="space-y-8">
      {/* Current Operation Display */}
      <div className="text-center">
        <AnimatePresence>
          {currentOperation && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full font-medium shadow-large"
            >
              {currentOperation}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hospital Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-border-light">
          <h5 className="font-medium text-text-primary mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-green-600" />
            Source Hospital
          </h5>
          <select
            value={selectedStart}
            onChange={(e) => setSelectedStart(e.target.value)}
            className="w-full p-2 border border-border-light rounded-lg bg-white"
          >
            <option value="">Select source hospital</option>
            {hospitals.map(hospital => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name} - {hospital.city}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-border-light">
          <h5 className="font-medium text-text-primary mb-3 flex items-center">
            <Navigation className="w-4 h-4 mr-2 text-red-600" />
            Destination Hospital
          </h5>
          <select
            value={selectedEnd}
            onChange={(e) => setSelectedEnd(e.target.value)}
            className="w-full p-2 border border-border-light rounded-lg bg-white"
          >
            <option value="">Select destination hospital</option>
            {hospitals.map(hospital => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name} - {hospital.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Find Path Button */}
      <div className="text-center">
        <button
          onClick={() => findShortestPath(selectedStart, selectedEnd)}
          disabled={!selectedStart || !selectedEnd || selectedStart === selectedEnd || isCalculating}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-medium hover:shadow-large transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
        >
          <Route className="w-5 h-5" />
          <span>{isCalculating ? 'Calculating...' : 'Find Shortest Path'}</span>
        </button>
      </div>

      {/* Graph Visualization */}
      <div className="bg-gradient-to-br from-pastel-whisper to-pastel-sky p-8 rounded-2xl border border-border-light">
        <h4 className="text-lg font-display font-semibold text-text-primary mb-6 text-center">
          Indian Hospital Network Graph
        </h4>
        
        <div className="relative w-full h-96 bg-white/50 rounded-xl border border-border-light overflow-hidden">
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full">
            {connections.map((connection, index) => {
              const fromHospital = hospitals.find(h => h.id === connection.from)
              const toHospital = hospitals.find(h => h.id === connection.to)
              
              if (!fromHospital || !toHospital) return null

              return (
                <motion.line
                  key={`${connection.from}-${connection.to}`}
                  x1={fromHospital.coordinates.x}
                  y1={fromHospital.coordinates.y}
                  x2={toHospital.coordinates.x}
                  y2={toHospital.coordinates.y}
                  stroke={getConnectionOpacity(connection) === 1 ? "#8B5CF6" : "#CBD5E1"}
                  strokeWidth={getConnectionOpacity(connection) === 1 ? "3" : "1"}
                  opacity={getConnectionOpacity(connection)}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              )
            })}
          </svg>

          {/* Hospitals */}
          {hospitals.map((hospital, index) => (
            <motion.div
              key={hospital.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                isInPath(hospital.id) ? 'z-20' : 'z-10'
              }`}
              style={{
                left: hospital.coordinates.x,
                top: hospital.coordinates.y
              }}
            >
              <div className={`relative p-3 rounded-xl border-2 shadow-medium hover:shadow-large transition-all duration-300 cursor-pointer ${
                hospital.id === selectedStart ? 'ring-4 ring-green-300 border-green-400' :
                hospital.id === selectedEnd ? 'ring-4 ring-red-300 border-red-400' :
                isInPath(hospital.id) ? 'ring-4 ring-purple-300 border-purple-400' :
                'border-border-light'
              } bg-gradient-to-br ${getHospitalBg(hospital.type)}`}>
                
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br ${getHospitalColor(hospital.type)} flex items-center justify-center`}>
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="font-bold text-text-primary text-xs">
                    {hospital.name.split(' ')[0]}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {hospital.city}
                  </div>
                  
                  {/* Load indicator */}
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          hospital.currentLoad > 85 ? 'bg-red-500' :
                          hospital.currentLoad > 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${hospital.currentLoad}%` }}
                      />
                    </div>
                    <div className="text-xs text-text-secondary">
                      {hospital.currentLoad}%
                    </div>
                  </div>
                </div>

                {/* Selection indicators */}
                {hospital.id === selectedStart && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                )}
                {hospital.id === selectedEnd && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Navigation className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Path Details */}
      {shortestPath.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-border-light"
        >
          <h4 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center">
            <Route className="w-5 h-5 mr-2" />
            Shortest Path Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-text-primary mb-3">Path Sequence</h5>
              <div className="space-y-2">
                {shortestPath.map((step, index) => {
                  const hospital = hospitals.find(h => h.id === step.hospitalId)
                  return (
                    <div key={step.hospitalId} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">
                          {hospital?.name}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {hospital?.city}
                        </div>
                      </div>
                      {index < shortestPath.length - 1 && (
                        <div className="text-sm text-purple-600">
                          → {step.distance}km
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-text-primary mb-3">Summary</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Distance:</span>
                  <span className="font-bold text-text-primary">
                    {shortestPath[shortestPath.length - 1]?.totalDistance}km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Number of Hops:</span>
                  <span className="font-bold text-text-primary">
                    {shortestPath.length - 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Estimated Time:</span>
                  <span className="font-bold text-text-primary">
                    {Math.ceil(shortestPath[shortestPath.length - 1]?.totalDistance / 60)} hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hospital Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <Building className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <div className="font-medium text-blue-800">Government</div>
          <div className="text-sm text-blue-600">Public Healthcare</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
          <Building className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <div className="font-medium text-green-800">Private</div>
          <div className="text-sm text-green-600">Private Healthcare</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <Building className="w-8 h-8 mx-auto mb-2 text-purple-600" />
          <div className="font-medium text-purple-800">Specialty</div>
          <div className="text-sm text-purple-600">Specialized Care</div>
        </div>
      </div>
    </div>
  )
}
