'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Heart, AlertTriangle, Clock, UserCheck, 
  Activity, Stethoscope, TrendingUp, Bell, UserPlus
} from 'lucide-react'

interface Patient {
  patient_id: string
  name: string
  priority: string
  wait_time: number
  chief_complaint?: string
  assigned_doctor?: string
  vital_signs?: {
    temperature: number
    blood_pressure: string
    heart_rate: number
    oxygen_saturation: number
  }
}

interface DoctorWorkload {
  current_load: number
  max_patients: number
  utilization: number
  patients_today: number
}

interface DashboardData {
  queue_statistics: {
    total_patients: number
    priority_breakdown: Record<string, number>
    average_wait_time: number
    critical_patients: number
    longest_waiting?: {
      patient_id: string
      name: string
      wait_time_minutes: number
      priority: string
    }
  }
  doctor_workload: Record<string, DoctorWorkload>
  triage_accuracy: {
    total_patients: number
    priority_distribution: Record<string, number>
    critical_percentage: number
    emergency_percentage: number
  }
  status_distribution: Record<string, number>
  critical_alerts: Patient[]
  bottlenecks: Array<{
    type: string
    severity: string
    description: string
    recommendation: string
  }>
  total_patients_today: number
  active_patients: number
}

export default function PatientManagementDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [nextPatient, setNextPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [callingPatient, setCallingPatient] = useState(false)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData: DashboardData = {
        queue_statistics: {
          total_patients: 28,
          priority_breakdown: {
            'CRITICAL': 2,
            'EMERGENCY': 5,
            'URGENT': 8,
            'SEMI_URGENT': 7,
            'NON_URGENT': 6
          },
          average_wait_time: 45,
          critical_patients: 2,
          longest_waiting: {
            patient_id: 'PAT001',
            name: 'Rajesh Kumar',
            wait_time_minutes: 120,
            priority: 'URGENT'
          }
        },
        doctor_workload: {
          'DR001': { current_load: 4, max_patients: 6, utilization: 67, patients_today: 15 },
          'DR002': { current_load: 3, max_patients: 4, utilization: 75, patients_today: 12 },
          'DR003': { current_load: 5, max_patients: 5, utilization: 100, patients_today: 18 },
          'DR004': { current_load: 2, max_patients: 5, utilization: 40, patients_today: 8 },
          'DR005': { current_load: 3, max_patients: 4, utilization: 75, patients_today: 11 }
        },
        triage_accuracy: {
          total_patients: 28,
          priority_distribution: {
            'CRITICAL': 2,
            'EMERGENCY': 5,
            'URGENT': 8,
            'SEMI_URGENT': 7,
            'NON_URGENT': 6
          },
          critical_percentage: 7.1,
          emergency_percentage: 17.9
        },
        status_distribution: {
          'Waiting': 18,
          'In Consultation': 5,
          'Under Treatment': 3,
          'Discharged': 45,
          'Admitted': 2
        },
        critical_alerts: [
          {
            patient_id: 'PAT002',
            name: 'Priya Sharma',
            priority: 'CRITICAL',
            wait_time: 15,
            chief_complaint: 'Chest pain and difficulty breathing'
          },
          {
            patient_id: 'PAT003',
            name: 'Amit Patel',
            priority: 'CRITICAL',
            wait_time: 8,
            chief_complaint: 'Severe abdominal pain'
          }
        ],
        bottlenecks: [
          {
            type: 'Critical Patient Backlog',
            severity: 'High',
            description: '2 critical patients waiting',
            recommendation: 'Immediate attention required'
          }
        ],
        total_patients_today: 73,
        active_patients: 26
      }
      setDashboardData(mockData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const callNextPatient = async () => {
    setCallingPatient(true)
    try {
      // Mock calling next patient
      const patient: Patient = {
        patient_id: 'PAT004',
        name: 'Sunita Devi',
        priority: 'EMERGENCY',
        wait_time: 35,
        chief_complaint: 'High fever and severe headache',
        assigned_doctor: 'DR002',
        vital_signs: {
          temperature: 103.2,
          blood_pressure: '160/95',
          heart_rate: 110,
          oxygen_saturation: 96
        }
      }
      setNextPatient(patient)
      
      // Simulate consultation start
      setTimeout(() => {
        setNextPatient(null)
        loadDashboardData()
      }, 5000)
    } catch (error) {
      console.error('Error calling next patient:', error)
    } finally {
      setCallingPatient(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-700 bg-red-100 border-red-300'
      case 'EMERGENCY': return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'URGENT': return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'SEMI_URGENT': return 'text-blue-700 bg-blue-100 border-blue-300'
      case 'NON_URGENT': return 'text-green-700 bg-green-100 border-green-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <Heart className="w-4 h-4" />
      case 'EMERGENCY': return <AlertTriangle className="w-4 h-4" />
      case 'URGENT': return <Clock className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="w-8 h-8 animate-pulse text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Patient Management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <Heart className="w-10 h-10 text-red-600 mr-3" />
            Patient Management & Triage
          </h1>
          <p className="text-gray-600">Advanced DSA-powered priority queue system</p>
        </motion.div>

        {/* Critical Alerts */}
        {dashboardData?.critical_alerts && dashboardData.critical_alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 animate-pulse" />
              Critical Patient Alerts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.critical_alerts.map((patient) => (
                <div key={patient.patient_id} className="bg-white rounded-lg p-4 border-l-4 border-red-500 shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                      {patient.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{patient.chief_complaint}</p>
                  <div className="flex justify-between text-sm">
                    <span>ID: <strong>{patient.patient_id}</strong></span>
                    <span className="text-red-600 font-medium">
                      Waiting: {patient.wait_time} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData && [
            {
              title: 'Total in Queue',
              value: dashboardData.queue_statistics.total_patients,
              icon: Users,
              color: 'blue',
              change: '+3'
            },
            {
              title: 'Critical Patients',
              value: dashboardData.queue_statistics.critical_patients,
              icon: Heart,
              color: 'red',
              change: '+1'
            },
            {
              title: 'Avg Wait Time',
              value: `${dashboardData.queue_statistics.average_wait_time} min`,
              icon: Clock,
              color: 'yellow',
              change: '-5 min'
            },
            {
              title: 'Active Patients',
              value: dashboardData.active_patients,
              icon: Activity,
              color: 'green',
              change: '+7'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                  <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
                <span className="text-sm font-medium text-green-600">
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{metric.value}</h3>
              <p className="text-gray-600 text-sm">{metric.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Current Patient & Queue Control */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Next Patient */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Next Patient
            </h2>
            
            {nextPatient ? (
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800">{nextPatient.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(nextPatient.priority)}`}>
                    {getPriorityIcon(nextPatient.priority)}
                    <span className="ml-1">{nextPatient.priority}</span>
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{nextPatient.chief_complaint}</p>
                
                {nextPatient.vital_signs && (
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white rounded p-2 mb-3">
                    <div>Temp: <strong>{nextPatient.vital_signs.temperature}°F</strong></div>
                    <div>BP: <strong>{nextPatient.vital_signs.blood_pressure}</strong></div>
                    <div>HR: <strong>{nextPatient.vital_signs.heart_rate} bpm</strong></div>
                    <div>O2: <strong>{nextPatient.vital_signs.oxygen_saturation}%</strong></div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dr: {nextPatient.assigned_doctor}</span>
                  <span className="text-sm text-blue-600 font-medium">
                    Wait: {nextPatient.wait_time} min
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Ready to call next patient</p>
                <button
                  onClick={callNextPatient}
                  disabled={callingPatient}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {callingPatient ? 'Calling...' : 'Call Next Patient'}
                </button>
              </div>
            )}
          </motion.div>

          {/* Priority Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Priority Queue Distribution
            </h2>
            
            <div className="space-y-3">
              {dashboardData && Object.entries(dashboardData.queue_statistics.priority_breakdown).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getPriorityIcon(priority)}
                    <span className="ml-2 font-medium text-gray-700">{priority}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className={`h-2 rounded-full ${
                          priority === 'CRITICAL' ? 'bg-red-500' :
                          priority === 'EMERGENCY' ? 'bg-orange-500' :
                          priority === 'URGENT' ? 'bg-yellow-500' :
                          priority === 'SEMI_URGENT' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{width: `${(count / dashboardData.queue_statistics.total_patients) * 100}%`}}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-800 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Doctor Workload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Stethoscope className="w-5 h-5 mr-2" />
            Doctor Workload Distribution
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {dashboardData && Object.entries(dashboardData.doctor_workload).map(([doctorId, workload]) => (
              <div key={doctorId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">{doctorId}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    workload.utilization > 90 ? 'bg-red-100 text-red-800' :
                    workload.utilization > 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {workload.utilization.toFixed(0)}%
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Load:</span>
                    <span>{workload.current_load}/{workload.max_patients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today:</span>
                    <span>{workload.patients_today}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        workload.utilization > 90 ? 'bg-red-500' :
                        workload.utilization > 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{width: `${workload.utilization}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottlenecks */}
        {dashboardData?.bottlenecks && dashboardData.bottlenecks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              System Bottlenecks & Recommendations
            </h2>
            
            <div className="space-y-4">
              {dashboardData.bottlenecks.map((bottleneck, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  bottleneck.severity === 'High' ? 'bg-red-50 border-red-500' :
                  bottleneck.severity === 'Medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{bottleneck.type}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      bottleneck.severity === 'High' ? 'bg-red-100 text-red-800' :
                      bottleneck.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {bottleneck.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{bottleneck.description}</p>
                  <p className="text-xs text-gray-500 italic">💡 {bottleneck.recommendation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
