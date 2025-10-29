'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, AlertTriangle, Clock, User, Plus, Minus } from 'lucide-react'

interface Patient {
  id: number
  name: string
  condition: string
  priority: number
  severity: 'critical' | 'urgent' | 'moderate' | 'stable'
  waitTime: string
  age: number
  city: string
}

interface PriorityQueueVisualizerProps {
  isPlaying: boolean
}

export default function PriorityQueueVisualizer({ isPlaying }: PriorityQueueVisualizerProps) {
  const [heap, setHeap] = useState<Patient[]>([])
  const [currentOperation, setCurrentOperation] = useState<string>('')
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

  // Sample Indian patient data
  const samplePatients: Patient[] = [
    { id: 1, name: "Rajesh Kumar", condition: "Chest Pain", priority: 9, severity: 'critical', waitTime: "2 min", age: 45, city: "Mumbai" },
    { id: 2, name: "Priya Sharma", condition: "Severe Headache", priority: 7, severity: 'urgent', waitTime: "5 min", age: 32, city: "Delhi" },
    { id: 3, name: "Amit Patel", condition: "High Fever", priority: 6, severity: 'urgent', waitTime: "8 min", age: 28, city: "Ahmedabad" },
    { id: 4, name: "Sunita Devi", condition: "Breathing Issues", priority: 8, severity: 'critical', waitTime: "3 min", age: 67, city: "Patna" },
    { id: 5, name: "Vikram Singh", condition: "Stomach Pain", priority: 4, severity: 'moderate', waitTime: "15 min", age: 35, city: "Jaipur" },
    { id: 6, name: "Meera Nair", condition: "Routine Checkup", priority: 2, severity: 'stable', waitTime: "30 min", age: 29, city: "Kochi" },
    { id: 7, name: "Arjun Reddy", condition: "Injury", priority: 5, severity: 'moderate', waitTime: "12 min", age: 24, city: "Hyderabad" },
    { id: 8, name: "Kavya Iyer", condition: "Allergic Reaction", priority: 6, severity: 'urgent', waitTime: "7 min", age: 31, city: "Bangalore" }
  ]

  const [patientQueue, setPatientQueue] = useState<Patient[]>([...samplePatients])
  const [processedPatients, setProcessedPatients] = useState<Patient[]>([])

  // Initialize with some patients
  useEffect(() => {
    const initialPatients = samplePatients.slice(0, 4)
    setHeap(initialPatients.sort((a, b) => b.priority - a.priority))
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      if (Math.random() > 0.5 && patientQueue.length > 0) {
        addPatient()
      } else if (heap.length > 0) {
        removePatient()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, heap, patientQueue])

  const addPatient = () => {
    if (patientQueue.length === 0) return

    const newPatient = patientQueue[0]
    setPatientQueue(prev => prev.slice(1))
    setCurrentOperation(`Adding ${newPatient.name} (Priority: ${newPatient.priority})`)
    
    // Add to heap and maintain heap property
    const newHeap = [...heap, newPatient]
    heapifyUp(newHeap, newHeap.length - 1)
    setHeap(newHeap)
    
    setTimeout(() => setCurrentOperation(''), 2000)
  }

  const removePatient = () => {
    if (heap.length === 0) return

    const removedPatient = heap[0]
    setCurrentOperation(`Processing ${removedPatient.name} (Highest Priority)`)
    setProcessedPatients(prev => [...prev, removedPatient])
    
    // Remove root and maintain heap property
    const newHeap = [...heap]
    newHeap[0] = newHeap[newHeap.length - 1]
    newHeap.pop()
    
    if (newHeap.length > 0) {
      heapifyDown(newHeap, 0)
    }
    
    setHeap(newHeap)
    setTimeout(() => setCurrentOperation(''), 2000)
  }

  const heapifyUp = (arr: Patient[], index: number) => {
    if (index === 0) return

    const parentIndex = Math.floor((index - 1) / 2)
    if (arr[index].priority > arr[parentIndex].priority) {
      [arr[index], arr[parentIndex]] = [arr[parentIndex], arr[index]]
      heapifyUp(arr, parentIndex)
    }
  }

  const heapifyDown = (arr: Patient[], index: number) => {
    const leftChild = 2 * index + 1
    const rightChild = 2 * index + 2
    let largest = index

    if (leftChild < arr.length && arr[leftChild].priority > arr[largest].priority) {
      largest = leftChild
    }

    if (rightChild < arr.length && arr[rightChild].priority > arr[largest].priority) {
      largest = rightChild
    }

    if (largest !== index) {
      [arr[index], arr[largest]] = [arr[largest], arr[index]]
      heapifyDown(arr, largest)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-500 to-red-600 border-red-300'
      case 'urgent': return 'from-orange-500 to-orange-600 border-orange-300'
      case 'moderate': return 'from-yellow-500 to-yellow-600 border-yellow-300'
      case 'stable': return 'from-green-500 to-green-600 border-green-300'
      default: return 'from-gray-500 to-gray-600 border-gray-300'
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-50 to-red-100'
      case 'urgent': return 'from-orange-50 to-orange-100'
      case 'moderate': return 'from-yellow-50 to-yellow-100'
      case 'stable': return 'from-green-50 to-green-100'
      default: return 'from-gray-50 to-gray-100'
    }
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
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-medium shadow-large"
            >
              {currentOperation}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={addPatient}
          disabled={patientQueue.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-medium hover:shadow-large transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
        
        <button
          onClick={removePatient}
          disabled={heap.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-medium hover:shadow-large transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
          <span>Process Patient</span>
        </button>
      </div>

      {/* Heap Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Heap Display */}
        <div className="lg:col-span-2">
          <h4 className="text-lg font-display font-semibold text-text-primary mb-4 text-center">
            Priority Queue (Min-Heap) - {heap.length} Patients
          </h4>
          
          <div className="relative bg-gradient-to-br from-pastel-whisper to-pastel-sky p-8 rounded-2xl border border-border-light min-h-[400px]">
            {heap.length === 0 ? (
              <div className="flex items-center justify-center h-full text-text-secondary">
                <div className="text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No patients in queue</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Root Level */}
                {heap[0] && (
                  <div className="flex justify-center">
                    <PatientCard patient={heap[0]} index={0} isHighlighted={highlightedIndex === 0} />
                  </div>
                )}
                
                {/* Second Level */}
                {(heap[1] || heap[2]) && (
                  <div className="flex justify-center space-x-8">
                    {heap[1] && <PatientCard patient={heap[1]} index={1} isHighlighted={highlightedIndex === 1} />}
                    {heap[2] && <PatientCard patient={heap[2]} index={2} isHighlighted={highlightedIndex === 2} />}
                  </div>
                )}
                
                {/* Third Level */}
                {(heap[3] || heap[4] || heap[5] || heap[6]) && (
                  <div className="flex justify-center space-x-4">
                    {heap[3] && <PatientCard patient={heap[3]} index={3} isHighlighted={highlightedIndex === 3} />}
                    {heap[4] && <PatientCard patient={heap[4]} index={4} isHighlighted={highlightedIndex === 4} />}
                    {heap[5] && <PatientCard patient={heap[5]} index={5} isHighlighted={highlightedIndex === 5} />}
                    {heap[6] && <PatientCard patient={heap[6]} index={6} isHighlighted={highlightedIndex === 6} />}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Waiting Queue */}
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-border-light">
            <h5 className="font-medium text-text-primary mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Waiting Queue ({patientQueue.length})
            </h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {patientQueue.slice(0, 3).map((patient) => (
                <div key={patient.id} className="text-sm p-2 bg-pastel-cream rounded-lg">
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-text-secondary">{patient.condition}</div>
                </div>
              ))}
              {patientQueue.length > 3 && (
                <div className="text-xs text-text-secondary text-center">
                  +{patientQueue.length - 3} more patients
                </div>
              )}
            </div>
          </div>

          {/* Processed Patients */}
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-border-light">
            <h5 className="font-medium text-text-primary mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Processed ({processedPatients.length})
            </h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {processedPatients.slice(-3).map((patient) => (
                <div key={patient.id} className="text-sm p-2 bg-green-50 rounded-lg">
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-text-secondary">Completed</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PatientCard({ patient, index, isHighlighted }: { patient: Patient, index: number, isHighlighted: boolean }) {
  const severityColor = getSeverityColor(patient.severity)
  const severityBg = getSeverityBg(patient.severity)

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`relative p-4 rounded-xl border-2 shadow-medium hover:shadow-large transition-all duration-300 ${
        isHighlighted ? 'ring-4 ring-blue-300' : ''
      } bg-gradient-to-br ${severityBg} ${severityColor}`}
      style={{ minWidth: '200px' }}
    >
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 bg-white/80 rounded-full flex items-center justify-center">
          {patient.severity === 'critical' ? (
            <AlertTriangle className="w-6 h-6 text-red-600" />
          ) : (
            <Heart className="w-6 h-6 text-blue-600" />
          )}
        </div>
        
        <div className="font-bold text-white text-lg mb-1">{patient.priority}</div>
        <div className="font-medium text-white">{patient.name}</div>
        <div className="text-sm text-white/90">{patient.condition}</div>
        <div className="text-xs text-white/80 mt-1">{patient.city}, Age {patient.age}</div>
        <div className="text-xs text-white/80">{patient.waitTime}</div>
      </div>
      
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-text-primary shadow-medium">
        {index}
      </div>
    </motion.div>
  )
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return 'from-red-500 to-red-600 border-red-300'
    case 'urgent': return 'from-orange-500 to-orange-600 border-orange-300'
    case 'moderate': return 'from-yellow-500 to-yellow-600 border-yellow-300'
    case 'stable': return 'from-green-500 to-green-600 border-green-300'
    default: return 'from-gray-500 to-gray-600 border-gray-300'
  }
}

function getSeverityBg(severity: string) {
  switch (severity) {
    case 'critical': return 'from-red-50 to-red-100'
    case 'urgent': return 'from-orange-50 to-orange-100'
    case 'moderate': return 'from-yellow-50 to-yellow-100'
    case 'stable': return 'from-green-50 to-green-100'
    default: return 'from-gray-50 to-gray-100'
  }
}
