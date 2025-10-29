'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Minus, Eye, Calendar, User, Activity, Pill, TestTube } from 'lucide-react'

interface MedicalRecord {
  id: number
  patientName: string
  recordType: 'consultation' | 'prescription' | 'lab-result' | 'diagnosis' | 'surgery'
  title: string
  description: string
  doctor: string
  date: string
  priority: 'high' | 'medium' | 'low'
  city: string
}

interface StackRecordsVisualizerProps {
  isPlaying: boolean
  speed?: number
  soundEnabled?: boolean
}

export default function StackRecordsVisualizer({ isPlaying, speed = 1, soundEnabled = true }: StackRecordsVisualizerProps) {
  const [stack, setStack] = useState<MedicalRecord[]>([])
  const [currentRecord, setCurrentRecord] = useState<MedicalRecord | null>(null)
  const [accessedRecords, setAccessedRecords] = useState<MedicalRecord[]>([])
  const [currentOperation, setCurrentOperation] = useState('')

  // Sample Indian medical records data
  const sampleRecords: MedicalRecord[] = [
    { id: 1, patientName: "Rajesh Kumar", recordType: 'consultation', title: "Cardiac Checkup", description: "Regular heart examination, ECG normal", doctor: "Dr. Sharma", date: "2024-10-28", priority: 'high', city: "Mumbai" },
    { id: 2, patientName: "Priya Nair", recordType: 'prescription', title: "Diabetes Medication", description: "Metformin 500mg twice daily", doctor: "Dr. Patel", date: "2024-10-27", priority: 'medium', city: "Kochi" },
    { id: 3, patientName: "Amit Singh", recordType: 'lab-result', title: "Blood Test Results", description: "Complete Blood Count - Normal ranges", doctor: "Dr. Gupta", date: "2024-10-26", priority: 'low', city: "Delhi" },
    { id: 4, patientName: "Sunita Devi", recordType: 'diagnosis', title: "Hypertension Diagnosis", description: "Stage 1 hypertension, lifestyle changes recommended", doctor: "Dr. Reddy", date: "2024-10-25", priority: 'high', city: "Patna" },
    { id: 5, patientName: "Vikram Patel", recordType: 'surgery', title: "Appendectomy", description: "Successful laparoscopic appendectomy", doctor: "Dr. Iyer", date: "2024-10-24", priority: 'high', city: "Ahmedabad" },
    { id: 6, patientName: "Meera Sharma", recordType: 'consultation', title: "Pediatric Checkup", description: "Routine child health examination", doctor: "Dr. Khan", date: "2024-10-23", priority: 'medium', city: "Jaipur" },
    { id: 7, patientName: "Arjun Reddy", recordType: 'prescription', title: "Antibiotic Course", description: "Amoxicillin for throat infection", doctor: "Dr. Verma", date: "2024-10-22", priority: 'medium', city: "Hyderabad" },
    { id: 8, patientName: "Kavya Iyer", recordType: 'lab-result', title: "Pregnancy Test", description: "Positive pregnancy test result", doctor: "Dr. Mehta", date: "2024-10-21", priority: 'high', city: "Bangalore" }
  ]

  const [recordPool, setRecordPool] = useState<MedicalRecord[]>([...sampleRecords])

  // Initialize stack
  useEffect(() => {
    const initialStack = sampleRecords.slice(0, 4)
    setStack(initialStack)
    setRecordPool(prev => prev.slice(4))
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      const action = Math.random()
      if (action > 0.6 && recordPool.length > 0) {
        pushRecord()
      } else if (action > 0.3 && stack.length > 0) {
        popRecord()
      } else if (stack.length > 0) {
        peekRecord()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, stack, recordPool])

  const pushRecord = () => {
    if (recordPool.length === 0) return

    const newRecord = recordPool[0]
    setRecordPool(prev => prev.slice(1))
    setStack(prev => [...prev, newRecord])
    setCurrentOperation(`Pushed: ${newRecord.title}`)
    
    setTimeout(() => setCurrentOperation(''), 2000)
  }

  const popRecord = () => {
    if (stack.length === 0) return

    const poppedRecord = stack[stack.length - 1]
    setStack(prev => prev.slice(0, -1))
    setAccessedRecords(prev => [...prev, poppedRecord])
    setCurrentRecord(poppedRecord)
    setCurrentOperation(`Popped: ${poppedRecord.title}`)
    
    setTimeout(() => {
      setCurrentRecord(null)
      setCurrentOperation('')
    }, 3000)
  }

  const peekRecord = () => {
    if (stack.length === 0) return

    const topRecord = stack[stack.length - 1]
    setCurrentRecord(topRecord)
    setCurrentOperation(`Peeking: ${topRecord.title}`)
    
    setTimeout(() => {
      setCurrentRecord(null)
      setCurrentOperation('')
    }, 2500)
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'consultation': return User
      case 'prescription': return Pill
      case 'lab-result': return TestTube
      case 'diagnosis': return Activity
      case 'surgery': return FileText
      default: return FileText
    }
  }

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'from-blue-500 to-blue-600'
      case 'prescription': return 'from-green-500 to-green-600'
      case 'lab-result': return 'from-purple-500 to-purple-600'
      case 'diagnosis': return 'from-orange-500 to-orange-600'
      case 'surgery': return 'from-red-500 to-red-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getRecordBg = (type: string) => {
    switch (type) {
      case 'consultation': return 'from-blue-50 to-blue-100'
      case 'prescription': return 'from-green-50 to-green-100'
      case 'lab-result': return 'from-purple-50 to-purple-100'
      case 'diagnosis': return 'from-orange-50 to-orange-100'
      case 'surgery': return 'from-red-50 to-red-100'
      default: return 'from-gray-50 to-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
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
              className="inline-block bg-gradient-to-r from-purple-500 to-violet-500 text-white px-6 py-3 rounded-full font-medium shadow-large"
            >
              {currentOperation}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={pushRecord}
          disabled={recordPool.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-medium hover:shadow-large transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Push Record</span>
        </button>
        
        <button
          onClick={popRecord}
          disabled={stack.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-medium hover:shadow-large transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
          <span>Pop Record</span>
        </button>

        <button
          onClick={peekRecord}
          disabled={stack.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-medium hover:shadow-large transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4" />
          <span>Peek Top</span>
        </button>
      </div>

      {/* Stack Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stack Display */}
        <div className="lg:col-span-2">
          <h4 className="text-lg font-display font-semibold text-text-primary mb-4 text-center">
            Medical Records Stack (LIFO) - {stack.length} Records
          </h4>
          
          <div className="relative bg-gradient-to-br from-pastel-whisper to-pastel-sky p-8 rounded-2xl border border-border-light min-h-[500px]">
            {stack.length === 0 ? (
              <div className="flex items-center justify-center h-full text-text-secondary">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No medical records in stack</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-sm text-text-secondary mb-6">
                  ↑ Top of Stack (Most Recent)
                </div>
                
                <AnimatePresence>
                  {stack.slice().reverse().map((record, index) => {
                    const actualIndex = stack.length - 1 - index
                    const RecordIcon = getRecordIcon(record.recordType)
                    
                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          zIndex: stack.length - index
                        }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`relative p-4 rounded-xl border-2 shadow-medium hover:shadow-large transition-all duration-300 ${
                          actualIndex === stack.length - 1 ? 'ring-4 ring-purple-300 scale-105' : ''
                        } bg-gradient-to-br ${getRecordBg(record.recordType)} border-purple-200`}
                        style={{ 
                          marginTop: index === 0 ? '0' : '-8px',
                          transform: `translateY(${index * -2}px)`
                        }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRecordColor(record.recordType)} flex items-center justify-center flex-shrink-0`}>
                            <RecordIcon className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-bold text-text-primary text-lg">
                                  {record.title}
                                </h5>
                                <p className="text-text-secondary text-sm mb-2">
                                  {record.description}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-text-secondary">
                                  <span className="flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    {record.patientName}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {record.date}
                                  </span>
                                  <span>{record.city}</span>
                                </div>
                                <div className="text-xs text-text-secondary mt-1">
                                  Dr. {record.doctor}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end space-y-2">
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(record.priority)}`}></div>
                                <div className="text-xs font-bold text-purple-600">
                                  #{actualIndex}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {actualIndex === stack.length - 1 && (
                          <div className="absolute -top-2 -right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            TOP
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                
                <div className="text-center text-sm text-text-secondary mt-6">
                  ↓ Bottom of Stack (Oldest)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Current Record View */}
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-border-light">
            <h5 className="font-medium text-text-primary mb-3 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Current View
            </h5>
            
            {currentRecord ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className={`p-3 rounded-lg bg-gradient-to-r ${getRecordBg(currentRecord.recordType)}`}>
                  <div className="font-medium text-text-primary">
                    {currentRecord.title}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {currentRecord.patientName}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {currentRecord.date}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center text-text-secondary py-8">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No record selected</p>
              </div>
            )}
          </div>

          {/* Available Records */}
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-border-light">
            <h5 className="font-medium text-text-primary mb-3 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Available Records ({recordPool.length})
            </h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recordPool.slice(0, 3).map((record) => (
                <div key={record.id} className="text-sm p-2 bg-pastel-cream rounded-lg">
                  <div className="font-medium">{record.title}</div>
                  <div className="text-text-secondary">{record.patientName}</div>
                </div>
              ))}
              {recordPool.length > 3 && (
                <div className="text-xs text-text-secondary text-center">
                  +{recordPool.length - 3} more records
                </div>
              )}
            </div>
          </div>

          {/* Accessed Records */}
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-border-light">
            <h5 className="font-medium text-text-primary mb-3 flex items-center">
              <Minus className="w-4 h-4 mr-2" />
              Accessed ({accessedRecords.length})
            </h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {accessedRecords.slice(-3).map((record) => (
                <div key={record.id} className="text-sm p-2 bg-green-50 rounded-lg">
                  <div className="font-medium">{record.title}</div>
                  <div className="text-text-secondary">Processed</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-border-light">
          <div className="text-2xl font-bold text-purple-600">{stack.length}</div>
          <div className="text-sm text-text-secondary">In Stack</div>
        </div>
        <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-border-light">
          <div className="text-2xl font-bold text-green-600">{accessedRecords.length}</div>
          <div className="text-sm text-text-secondary">Accessed</div>
        </div>
        <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-border-light">
          <div className="text-2xl font-bold text-blue-600">{recordPool.length}</div>
          <div className="text-sm text-text-secondary">Available</div>
        </div>
        <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-border-light">
          <div className="text-2xl font-bold text-orange-600">
            {stack.length > 0 ? stack.length - 1 : 0}
          </div>
          <div className="text-sm text-text-secondary">Stack Index</div>
        </div>
      </div>
    </div>
  )
}
