'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, AlertTriangle, Clock, User, Plus, Minus, UserPlus } from 'lucide-react'

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
  speed?: number
  soundEnabled?: boolean
}

export default function PriorityQueueVisualizer({ isPlaying, speed = 1, soundEnabled = true }: PriorityQueueVisualizerProps) {
  const [heap, setHeap] = useState<Patient[]>([])
  const [currentOperation, setCurrentOperation] = useState<string>('')
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    condition: '',
    priority: 5,
    severity: 'moderate' as 'critical' | 'urgent' | 'moderate' | 'stable',
    age: '',
    city: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

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

  // Validation functions
  const validatePatientForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!newPatientForm.name.trim()) {
      errors.name = 'Patient name is required'
    } else if (newPatientForm.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    if (!newPatientForm.condition.trim()) {
      errors.condition = 'Medical condition is required'
    }
    
    if (!newPatientForm.age || parseInt(newPatientForm.age) < 1 || parseInt(newPatientForm.age) > 120) {
      errors.age = 'Please enter a valid age (1-120)'
    }
    
    if (!newPatientForm.city.trim()) {
      errors.city = 'City is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setNewPatientForm({
      name: '',
      condition: '',
      priority: 5,
      severity: 'moderate',
      age: '',
      city: ''
    })
    setValidationErrors({})
    setShowAddForm(false)
  }

  const addCustomPatient = () => {
    if (!validatePatientForm()) return

    const newPatient: Patient = {
      id: Date.now(),
      name: newPatientForm.name.trim(),
      condition: newPatientForm.condition.trim(),
      priority: newPatientForm.priority,
      severity: newPatientForm.severity,
      waitTime: "0 min",
      age: parseInt(newPatientForm.age),
      city: newPatientForm.city.trim()
    }

    // Use perfect heap insertion
    const newHeap = insertPatient(newPatient, heap)
    setHeap(newHeap)
    
    // Validate heap property
    if (!isValidHeap(newHeap)) {
      console.error('Heap property violated after custom patient insertion!')
    }
    
    setCurrentOperation(`Added ${newPatient.name} to emergency queue`)
    setTimeout(() => setCurrentOperation(''), 2000)
    
    resetForm()
  }

  // Perfect Min-Heap Implementation with all edge cases
  const heapifyUp = (heap: Patient[], index: number) => {
    if (index === 0) return heap // Root reached
    
    const parentIndex = Math.floor((index - 1) / 2)
    
    // Min-heap: parent should have higher priority (lower number = higher priority)
    if (heap[parentIndex].priority > heap[index].priority) {
      // Swap with parent
      [heap[parentIndex], heap[index]] = [heap[index], heap[parentIndex]]
      return heapifyUp(heap, parentIndex)
    }
    
    return heap
  }

  const heapifyDown = (heap: Patient[], index: number) => {
    const leftChild = 2 * index + 1
    const rightChild = 2 * index + 2
    let smallest = index

    // Find the smallest among parent and children
    if (leftChild < heap.length && heap[leftChild].priority < heap[smallest].priority) {
      smallest = leftChild
    }
    
    if (rightChild < heap.length && heap[rightChild].priority < heap[smallest].priority) {
      smallest = rightChild
    }

    // If smallest is not the parent, swap and continue heapifying
    if (smallest !== index) {
      [heap[index], heap[smallest]] = [heap[smallest], heap[index]]
      return heapifyDown(heap, smallest)
    }
    
    return heap
  }

  const buildHeap = (patients: Patient[]) => {
    const heap = [...patients]
    // Start from last non-leaf node and heapify down
    for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) {
      heapifyDown(heap, i)
    }
    return heap
  }

  const insertPatient = (patient: Patient, heap: Patient[]) => {
    const newHeap = [...heap, patient]
    return heapifyUp(newHeap, newHeap.length - 1)
  }

  const extractMin = (heap: Patient[]) => {
    if (heap.length === 0) return { newHeap: [], extractedPatient: null }
    if (heap.length === 1) return { newHeap: [], extractedPatient: heap[0] }

    const extractedPatient = heap[0]
    const newHeap = [...heap]
    
    // Move last element to root
    newHeap[0] = newHeap[newHeap.length - 1]
    newHeap.pop()
    
    // Heapify down from root
    heapifyDown(newHeap, 0)
    
    return { newHeap, extractedPatient }
  }

  const isValidHeap = (heap: Patient[]) => {
    for (let i = 0; i < heap.length; i++) {
      const leftChild = 2 * i + 1
      const rightChild = 2 * i + 2
      
      if (leftChild < heap.length && heap[i].priority > heap[leftChild].priority) {
        return false
      }
      if (rightChild < heap.length && heap[i].priority > heap[rightChild].priority) {
        return false
      }
    }
    return true
  }

  // Initialize with some patients
  useEffect(() => {
    const initialPatients = samplePatients.slice(0, 4)
    const builtHeap = buildHeap(initialPatients)
    setHeap(builtHeap)
    setPatientQueue(samplePatients.slice(4))
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
    
    // Use perfect heap insertion
    const newHeap = insertPatient(newPatient, heap)
    setHeap(newHeap)
    
    // Validate heap property
    if (!isValidHeap(newHeap)) {
      console.error('Heap property violated after insertion!')
    }
    
    setTimeout(() => setCurrentOperation(''), 2000)
  }

  const removePatient = () => {
    if (heap.length === 0) return

    const { newHeap, extractedPatient } = extractMin(heap)
    
    if (extractedPatient) {
      setCurrentOperation(`Processing ${extractedPatient.name} (Highest Priority)`)
      setProcessedPatients(prev => [...prev, extractedPatient])
      setHeap(newHeap)
      
      // Validate heap property
      if (newHeap.length > 0 && !isValidHeap(newHeap)) {
        console.error('Heap property violated after extraction!')
      }
    }
    
    setTimeout(() => setCurrentOperation(''), 2000)
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
          <span>Add from Queue</span>
        </button>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-medium hover:shadow-large transition-all duration-300"
        >
          <User className="w-4 h-4" />
          <span>Add New Patient</span>
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

      {/* Add New Patient Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-border-light shadow-large"
          >
            <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Add New Patient to Emergency Queue
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter patient's full name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Medical Condition *
                </label>
                <input
                  type="text"
                  value={newPatientForm.condition}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, condition: e.target.value }))}
                  placeholder="e.g., Chest Pain, Fever, Injury"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.condition ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.condition && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.condition}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  value={newPatientForm.age}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Patient's age"
                  min="1"
                  max="120"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.age ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.age && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.age}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={newPatientForm.city}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Patient's city"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.city ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.city && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Severity Level
                </label>
                <select
                  value={newPatientForm.severity}
                  onChange={(e) => {
                    const severity = e.target.value as 'critical' | 'urgent' | 'moderate' | 'stable'
                    const priority = severity === 'critical' ? 9 : 
                                   severity === 'urgent' ? 7 : 
                                   severity === 'moderate' ? 5 : 3
                    setNewPatientForm(prev => ({ ...prev, severity, priority }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="critical">Critical (Priority 9)</option>
                  <option value="urgent">Urgent (Priority 7)</option>
                  <option value="moderate">Moderate (Priority 5)</option>
                  <option value="stable">Stable (Priority 3)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Priority Score: {newPatientForm.priority}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newPatientForm.priority}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>Low (1)</span>
                  <span>High (10)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-text-secondary border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCustomPatient}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-medium hover:shadow-large transition-all duration-300"
              >
                Add Patient to Queue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
