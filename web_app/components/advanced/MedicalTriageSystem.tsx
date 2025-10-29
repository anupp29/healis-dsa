'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, AlertTriangle, Clock, Activity, Brain, Zap } from 'lucide-react'

interface Patient {
  id: string
  name: string
  age: number
  condition: string
  severity: number
  vitalSigns: {
    heartRate: number
    bloodPressure: string
    temperature: number
    oxygenSaturation: number
  }
  arrivalTime: Date
  estimatedWaitTime: number
  city: string
}

interface TriageSystemProps {
  isPlaying: boolean
}

export default function MedicalTriageSystem({ isPlaying }: TriageSystemProps) {
  const [priorityQueue, setPriorityQueue] = useState<Patient[]>([])
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [processedPatients, setProcessedPatients] = useState<Patient[]>([])
  const [operation, setOperation] = useState('')

  // Advanced Priority Calculation using Multiple Factors
  const calculatePriority = (patient: Patient): number => {
    let priority = 0
    
    // Age factor (elderly and children get higher priority)
    if (patient.age > 65 || patient.age < 5) priority += 3
    else if (patient.age > 50 || patient.age < 18) priority += 1
    
    // Vital signs analysis
    if (patient.vitalSigns.heartRate > 120 || patient.vitalSigns.heartRate < 50) priority += 4
    if (patient.vitalSigns.temperature > 39 || patient.vitalSigns.temperature < 35) priority += 3
    if (patient.vitalSigns.oxygenSaturation < 90) priority += 5
    
    // Condition severity
    const criticalConditions = ['chest pain', 'stroke', 'heart attack', 'severe bleeding']
    const urgentConditions = ['high fever', 'severe headache', 'breathing difficulty']
    
    if (criticalConditions.some(cond => patient.condition.toLowerCase().includes(cond))) {
      priority += 8
    } else if (urgentConditions.some(cond => patient.condition.toLowerCase().includes(cond))) {
      priority += 5
    }
    
    // Wait time factor
    const waitHours = (Date.now() - patient.arrivalTime.getTime()) / (1000 * 60 * 60)
    if (waitHours > 2) priority += Math.floor(waitHours)
    
    return Math.min(priority, 20) // Cap at 20
  }

  // Min-Heap Implementation for Priority Queue
  const heapifyUp = (heap: Patient[], index: number) => {
    if (index === 0) return heap
    
    const parentIndex = Math.floor((index - 1) / 2)
    const newHeap = [...heap]
    
    if (calculatePriority(newHeap[index]) > calculatePriority(newHeap[parentIndex])) {
      [newHeap[index], newHeap[parentIndex]] = [newHeap[parentIndex], newHeap[index]]
      return heapifyUp(newHeap, parentIndex)
    }
    
    return newHeap
  }

  const heapifyDown = (heap: Patient[], index: number) => {
    const leftChild = 2 * index + 1
    const rightChild = 2 * index + 2
    let highest = index
    const newHeap = [...heap]
    
    if (leftChild < heap.length && 
        calculatePriority(newHeap[leftChild]) > calculatePriority(newHeap[highest])) {
      highest = leftChild
    }
    
    if (rightChild < heap.length && 
        calculatePriority(newHeap[rightChild]) > calculatePriority(newHeap[highest])) {
      highest = rightChild
    }
    
    if (highest !== index) {
      [newHeap[index], newHeap[highest]] = [newHeap[highest], newHeap[index]]
      return heapifyDown(newHeap, highest)
    }
    
    return newHeap
  }

  const insertPatient = (patient: Patient) => {
    const newHeap = [...priorityQueue, patient]
    setPriorityQueue(heapifyUp(newHeap, newHeap.length - 1))
    setOperation(`Added ${patient.name} - Priority: ${calculatePriority(patient)}`)
  }

  const extractHighestPriority = () => {
    if (priorityQueue.length === 0) return
    
    const highest = priorityQueue[0]
    let newHeap = [...priorityQueue]
    newHeap[0] = newHeap[newHeap.length - 1]
    newHeap.pop()
    
    if (newHeap.length > 0) {
      newHeap = heapifyDown(newHeap, 0)
    }
    
    setPriorityQueue(newHeap)
    setCurrentPatient(highest)
    setOperation(`Processing ${highest.name} - Highest Priority Patient`)
    
    setTimeout(() => {
      setProcessedPatients(prev => [...prev, highest])
      setCurrentPatient(null)
      setOperation('')
    }, 3000)
  }

  // Sample Indian patients with realistic medical data
  const samplePatients: Patient[] = [
    {
      id: 'P001',
      name: 'Rajesh Kumar',
      age: 67,
      condition: 'Chest Pain',
      severity: 9,
      vitalSigns: { heartRate: 135, bloodPressure: '180/110', temperature: 37.8, oxygenSaturation: 88 },
      arrivalTime: new Date(Date.now() - 30 * 60 * 1000),
      estimatedWaitTime: 0,
      city: 'Mumbai'
    },
    {
      id: 'P002',
      name: 'Priya Sharma',
      age: 34,
      condition: 'Severe Headache',
      severity: 6,
      vitalSigns: { heartRate: 95, bloodPressure: '140/90', temperature: 38.5, oxygenSaturation: 96 },
      arrivalTime: new Date(Date.now() - 45 * 60 * 1000),
      estimatedWaitTime: 15,
      city: 'Delhi'
    },
    {
      id: 'P003',
      name: 'Amit Patel',
      age: 4,
      condition: 'High Fever',
      severity: 7,
      vitalSigns: { heartRate: 140, bloodPressure: '90/60', temperature: 39.8, oxygenSaturation: 94 },
      arrivalTime: new Date(Date.now() - 20 * 60 * 1000),
      estimatedWaitTime: 5,
      city: 'Ahmedabad'
    }
  ]

  useEffect(() => {
    // Initialize with sample patients
    samplePatients.forEach(patient => insertPatient(patient))
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      if (Math.random() > 0.6 && priorityQueue.length > 0) {
        extractHighestPriority()
      } else if (Math.random() > 0.3) {
        const newPatient = generateRandomPatient()
        insertPatient(newPatient)
      }
    }, 4000)
    
    return () => clearInterval(interval)
  }, [isPlaying, priorityQueue])

  const generateRandomPatient = (): Patient => {
    const names = ['Sunita Devi', 'Vikram Singh', 'Meera Nair', 'Arjun Reddy', 'Kavya Iyer']
    const conditions = ['Stomach Pain', 'Breathing Difficulty', 'Injury', 'Allergic Reaction', 'Routine Checkup']
    const cities = ['Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata']
    
    return {
      id: `P${Date.now()}`,
      name: names[Math.floor(Math.random() * names.length)],
      age: Math.floor(Math.random() * 80) + 1,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      severity: Math.floor(Math.random() * 10) + 1,
      vitalSigns: {
        heartRate: Math.floor(Math.random() * 60) + 60,
        bloodPressure: `${Math.floor(Math.random() * 40) + 120}/${Math.floor(Math.random() * 20) + 80}`,
        temperature: Math.round((Math.random() * 4 + 36) * 10) / 10,
        oxygenSaturation: Math.floor(Math.random() * 15) + 85
      },
      arrivalTime: new Date(),
      estimatedWaitTime: Math.floor(Math.random() * 60),
      city: cities[Math.floor(Math.random() * cities.length)]
    }
  }

  const getSeverityColor = (priority: number) => {
    if (priority >= 15) return 'from-red-600 to-red-700 border-red-400'
    if (priority >= 10) return 'from-orange-500 to-orange-600 border-orange-400'
    if (priority >= 5) return 'from-yellow-500 to-yellow-600 border-yellow-400'
    return 'from-green-500 to-green-600 border-green-400'
  }

  return (
    <div className="space-y-8">
      {/* Operation Display */}
      <div className="text-center">
        <AnimatePresence>
          {operation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl"
            >
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6" />
                <span>{operation}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Triage Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Priority Queue Heap */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h3 className="text-2xl font-display font-bold text-gray-800 mb-6 text-center">
              Medical Priority Queue (Advanced Min-Heap)
            </h3>
            
            <div className="min-h-96 relative">
              {priorityQueue.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No patients in queue</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Heap Levels Visualization */}
                  {[0, 1, 2].map(level => {
                    const startIndex = Math.pow(2, level) - 1
                    const endIndex = Math.min(Math.pow(2, level + 1) - 1, priorityQueue.length)
                    const levelPatients = priorityQueue.slice(startIndex, endIndex)
                    
                    if (levelPatients.length === 0) return null
                    
                    return (
                      <div key={level} className={`flex justify-center space-x-${8 - level * 2}`}>
                        {levelPatients.map((patient, index) => {
                          const priority = calculatePriority(patient)
                          return (
                            <motion.div
                              key={patient.id}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`relative p-4 rounded-2xl shadow-lg border-2 ${getSeverityColor(priority)} bg-gradient-to-br text-white min-w-48`}
                            >
                              <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                                  {priority >= 15 ? <AlertTriangle className="w-6 h-6" /> : <Heart className="w-6 h-6" />}
                                </div>
                                <div className="font-bold text-lg mb-1">{priority}</div>
                                <div className="font-semibold">{patient.name}</div>
                                <div className="text-sm opacity-90">{patient.condition}</div>
                                <div className="text-xs opacity-80 mt-1">
                                  Age: {patient.age} | {patient.city}
                                </div>
                                
                                {/* Vital Signs */}
                                <div className="mt-2 text-xs space-y-1 bg-black/20 rounded-lg p-2">
                                  <div>HR: {patient.vitalSigns.heartRate} bpm</div>
                                  <div>BP: {patient.vitalSigns.bloodPressure}</div>
                                  <div>Temp: {patient.vitalSigns.temperature}°C</div>
                                  <div>O2: {patient.vitalSigns.oxygenSaturation}%</div>
                                </div>
                              </div>
                              
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-gray-800 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                {startIndex + index}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Control Panel & Stats */}
        <div className="space-y-6">
          {/* Current Patient */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h4 className="font-display font-bold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Currently Treating
            </h4>
            
            {currentPatient ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="font-bold text-lg text-gray-800">{currentPatient.name}</div>
                <div className="text-gray-600">{currentPatient.condition}</div>
                <div className="text-sm text-gray-500 mt-2">
                  Priority: {calculatePriority(currentPatient)}
                </div>
                
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3 }}
                  />
                </div>
              </motion.div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No patient being treated</p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h4 className="font-display font-bold text-gray-800 mb-4">System Statistics</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">In Queue:</span>
                <span className="font-bold text-2xl text-blue-600">{priorityQueue.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processed:</span>
                <span className="font-bold text-2xl text-green-600">{processedPatients.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Critical Cases:</span>
                <span className="font-bold text-2xl text-red-600">
                  {priorityQueue.filter(p => calculatePriority(p) >= 15).length}
                </span>
              </div>
            </div>
          </div>

          {/* Manual Controls */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h4 className="font-display font-bold text-gray-800 mb-4">Manual Controls</h4>
            
            <div className="space-y-3">
              <button
                onClick={() => insertPatient(generateRandomPatient())}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Add New Patient
              </button>
              
              <button
                onClick={extractHighestPriority}
                disabled={priorityQueue.length === 0}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Treat Next Patient
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
