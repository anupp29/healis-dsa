'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, User, Calendar, ArrowRight, UserCheck, Plus, Play } from 'lucide-react'

interface Appointment {
  id: number
  patientName: string
  doctorName: string
  specialty: string
  appointmentTime: string
  estimatedDuration: number
  status: 'waiting' | 'in-progress' | 'completed'
  city: string
  age: number
}

interface QueueFlowVisualizerProps {
  isPlaying: boolean
}

export default function QueueFlowVisualizer({ isPlaying }: QueueFlowVisualizerProps) {
  const [queue, setQueue] = useState<Appointment[]>([])
  const [currentPatient, setCurrentPatient] = useState<Appointment | null>(null)
  const [completedPatients, setCompletedPatients] = useState<Appointment[]>([])
  const [processingTime, setProcessingTime] = useState(0)
  const [currentOperation, setCurrentOperation] = useState('')

  // Sample Indian appointment data
  const sampleAppointments: Appointment[] = [
    { id: 1, patientName: "Rajesh Kumar", doctorName: "Dr. Sharma", specialty: "Cardiology", appointmentTime: "09:00", estimatedDuration: 15, status: 'waiting', city: "Mumbai", age: 45 },
    { id: 2, patientName: "Priya Nair", doctorName: "Dr. Patel", specialty: "Dermatology", appointmentTime: "09:15", estimatedDuration: 10, status: 'waiting', city: "Kochi", age: 32 },
    { id: 3, patientName: "Amit Singh", doctorName: "Dr. Gupta", specialty: "Orthopedics", appointmentTime: "09:30", estimatedDuration: 20, status: 'waiting', city: "Delhi", age: 28 },
    { id: 4, patientName: "Sunita Devi", doctorName: "Dr. Reddy", specialty: "General Medicine", appointmentTime: "09:45", estimatedDuration: 12, status: 'waiting', city: "Patna", age: 67 },
    { id: 5, patientName: "Vikram Patel", doctorName: "Dr. Iyer", specialty: "Neurology", appointmentTime: "10:00", estimatedDuration: 25, status: 'waiting', city: "Ahmedabad", age: 35 },
    { id: 6, patientName: "Meera Sharma", doctorName: "Dr. Khan", specialty: "Pediatrics", appointmentTime: "10:15", estimatedDuration: 8, status: 'waiting', city: "Jaipur", age: 29 },
    { id: 7, patientName: "Arjun Reddy", doctorName: "Dr. Verma", specialty: "ENT", appointmentTime: "10:30", estimatedDuration: 15, status: 'waiting', city: "Hyderabad", age: 24 },
    { id: 8, patientName: "Kavya Iyer", doctorName: "Dr. Mehta", specialty: "Gynecology", appointmentTime: "10:45", estimatedDuration: 18, status: 'waiting', city: "Bangalore", age: 31 }
  ]

  const [appointmentPool, setAppointmentPool] = useState<Appointment[]>([...sampleAppointments])

  // Initialize queue
  useEffect(() => {
    const initialQueue = sampleAppointments.slice(0, 5)
    setQueue(initialQueue)
    setAppointmentPool(prev => prev.slice(5))
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      if (currentPatient === null && queue.length > 0) {
        processNextPatient()
      } else if (Math.random() > 0.7 && appointmentPool.length > 0) {
        addNewAppointment()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isPlaying, queue, currentPatient, appointmentPool])

  // Processing timer
  useEffect(() => {
    if (!currentPatient || !isPlaying) return

    const timer = setInterval(() => {
      setProcessingTime(prev => {
        if (prev >= currentPatient.estimatedDuration) {
          completeCurrentPatient()
          return 0
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentPatient, isPlaying])

  const addNewAppointment = () => {
    if (appointmentPool.length === 0) return

    const newAppointment = appointmentPool[0]
    setAppointmentPool(prev => prev.slice(1))
    setQueue(prev => [...prev, newAppointment])
    setCurrentOperation(`New appointment: ${newAppointment.patientName}`)
    
    setTimeout(() => setCurrentOperation(''), 2000)
  }

  const processNextPatient = () => {
    if (queue.length === 0) return

    const nextPatient = queue[0]
    setQueue(prev => prev.slice(1))
    setCurrentPatient(nextPatient)
    setProcessingTime(0)
    setCurrentOperation(`Now consulting: ${nextPatient.patientName}`)
    
    setTimeout(() => setCurrentOperation(''), 2000)
  }

  const completeCurrentPatient = () => {
    if (!currentPatient) return

    const completedPatient = { ...currentPatient, status: 'completed' as const }
    setCompletedPatients(prev => [...prev, completedPatient])
    setCurrentPatient(null)
    setProcessingTime(0)
    setCurrentOperation(`Consultation completed: ${completedPatient.patientName}`)
    
    setTimeout(() => setCurrentOperation(''), 2000)
  }

  const manualAddAppointment = () => {
    addNewAppointment()
  }

  const manualProcessNext = () => {
    if (currentPatient === null) {
      processNextPatient()
    } else {
      completeCurrentPatient()
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
              className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-medium shadow-large"
            >
              {currentOperation}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={manualAddAppointment}
          disabled={appointmentPool.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-medium hover:shadow-large transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Add Appointment</span>
        </button>
        
        <button
          onClick={manualProcessNext}
          disabled={queue.length === 0 && currentPatient === null}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-medium hover:shadow-large transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          <span>{currentPatient ? 'Complete Current' : 'Process Next'}</span>
        </button>
      </div>

      {/* Queue Flow Visualization */}
      <div className="bg-gradient-to-br from-pastel-whisper to-pastel-sky p-8 rounded-2xl border border-border-light">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          
          {/* Waiting Queue */}
          <div className="space-y-4">
            <h4 className="text-lg font-display font-semibold text-text-primary text-center">
              Waiting Queue
            </h4>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-border-light min-h-[300px]">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-blue-600">{queue.length}</div>
                <div className="text-sm text-text-secondary">Patients Waiting</div>
              </div>
              
              <div className="space-y-3">
                <AnimatePresence>
                  {queue.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-text-primary text-sm">
                            {appointment.patientName}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {appointment.specialty}
                          </div>
                          <div className="text-xs text-blue-600">
                            {appointment.appointmentTime}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Flow Arrow */}
          <div className="flex justify-center">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-blue-500"
            >
              <ArrowRight className="w-8 h-8" />
            </motion.div>
          </div>

          {/* Current Consultation */}
          <div className="space-y-4">
            <h4 className="text-lg font-display font-semibold text-text-primary text-center">
              In Consultation
            </h4>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-border-light min-h-[300px]">
              {currentPatient ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-bold text-text-primary">
                      {currentPatient.patientName}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {currentPatient.doctorName}
                    </div>
                    <div className="text-sm text-green-600">
                      {currentPatient.specialty}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {currentPatient.city}, Age {currentPatient.age}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                      <span>Progress</span>
                      <span>{processingTime}/{currentPatient.estimatedDuration} min</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(processingTime / currentPatient.estimatedDuration) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-text-secondary">
                  <div className="text-center">
                    <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No patient in consultation</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Flow Arrow */}
          <div className="flex justify-center">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="text-green-500"
            >
              <ArrowRight className="w-8 h-8" />
            </motion.div>
          </div>
        </div>

        {/* Completed Section */}
        <div className="mt-8 pt-8 border-t border-border-light">
          <h4 className="text-lg font-display font-semibold text-text-primary text-center mb-4">
            Completed Consultations ({completedPatients.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {completedPatients.slice(-8).map((patient) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                >
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-white" />
                    </div>
                    <div className="font-medium text-text-primary text-sm">
                      {patient.patientName}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {patient.specialty}
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Completed
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-border-light">
          <div className="text-2xl font-bold text-blue-600">{queue.length}</div>
          <div className="text-sm text-text-secondary">In Queue</div>
        </div>
        <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-border-light">
          <div className="text-2xl font-bold text-green-600">{currentPatient ? 1 : 0}</div>
          <div className="text-sm text-text-secondary">In Progress</div>
        </div>
        <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-border-light">
          <div className="text-2xl font-bold text-purple-600">{completedPatients.length}</div>
          <div className="text-sm text-text-secondary">Completed</div>
        </div>
        <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-border-light">
          <div className="text-2xl font-bold text-orange-600">{appointmentPool.length}</div>
          <div className="text-sm text-text-secondary">Remaining</div>
        </div>
      </div>
    </div>
  )
}
