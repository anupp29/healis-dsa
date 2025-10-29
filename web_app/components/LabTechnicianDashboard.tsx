'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FlaskConical, Clock, Users, AlertCircle, CheckCircle, 
  Play, Pause, BarChart3, TrendingUp, Activity, Timer
} from 'lucide-react'

interface LabTest {
  test_id: string
  patient_name: string
  priority: string
  status: string
  assigned_technician: string
  estimated_duration: number
}

interface TechnicianWorkload {
  current_load: number
  max_concurrent: number
  utilization: number
  tests_today: number
}

interface DashboardData {
  queue_status: {
    priority_queue: {
      total_tests: number
      estimated_completion_time: number
    }
    routine_queue_size: number
    total_pending: number
    in_progress: number
    completed_today: number
  }
  technician_workload: Record<string, TechnicianWorkload>
  throughput_metrics: {
    total_tests: number
    completed_tests: number
    completion_rate: number
    tests_per_hour: number
  }
  priority_distribution: Record<string, number>
  recent_tests: LabTest[]
  bottlenecks: Array<{
    type: string
    severity: string
    description: string
    recommendation: string
  }>
}

export default function LabTechnicianDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [currentTest, setCurrentTest] = useState<LabTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingTest, setProcessingTest] = useState(false)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData: DashboardData = {
        queue_status: {
          priority_queue: {
            total_tests: 8,
            estimated_completion_time: 120
          },
          routine_queue_size: 15,
          total_pending: 23,
          in_progress: 5,
          completed_today: 47
        },
        technician_workload: {
          'TECH001': { current_load: 3, max_concurrent: 4, utilization: 75, tests_today: 12 },
          'TECH002': { current_load: 2, max_concurrent: 3, utilization: 67, tests_today: 8 },
          'TECH003': { current_load: 4, max_concurrent: 5, utilization: 80, tests_today: 15 },
          'TECH004': { current_load: 1, max_concurrent: 3, utilization: 33, tests_today: 6 }
        },
        throughput_metrics: {
          total_tests: 75,
          completed_tests: 47,
          completion_rate: 62.7,
          tests_per_hour: 3.1
        },
        priority_distribution: {
          'EMERGENCY': 3,
          'URGENT': 8,
          'ROUTINE': 35,
          'SCHEDULED': 12
        },
        recent_tests: [
          {
            test_id: 'LAB001',
            patient_name: 'Rajesh Kumar',
            priority: 'EMERGENCY',
            status: 'In Progress',
            assigned_technician: 'TECH001',
            estimated_duration: 15
          },
          {
            test_id: 'LAB002',
            patient_name: 'Priya Sharma',
            priority: 'URGENT',
            status: 'Pending',
            assigned_technician: 'TECH002',
            estimated_duration: 20
          }
        ],
        bottlenecks: [
          {
            type: 'Queue Backlog',
            severity: 'High',
            description: '23 tests waiting in queue',
            recommendation: 'Consider adding more technicians'
          }
        ]
      }
      setDashboardData(mockData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processNextTest = async () => {
    setProcessingTest(true)
    try {
      // Mock processing next test
      const nextTest: LabTest = {
        test_id: 'LAB003',
        patient_name: 'Amit Patel',
        priority: 'URGENT',
        status: 'In Progress',
        assigned_technician: 'TECH001',
        estimated_duration: 25
      }
      setCurrentTest(nextTest)
      
      // Simulate processing time
      setTimeout(() => {
        setCurrentTest(null)
        loadDashboardData()
      }, 3000)
    } catch (error) {
      console.error('Error processing test:', error)
    } finally {
      setProcessingTest(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY': return 'text-red-600 bg-red-100'
      case 'URGENT': return 'text-orange-600 bg-orange-100'
      case 'ROUTINE': return 'text-blue-600 bg-blue-100'
      case 'SCHEDULED': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100'
      case 'In Progress': return 'text-blue-600 bg-blue-100'
      case 'Pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FlaskConical className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Lab Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <FlaskConical className="w-10 h-10 text-purple-600 mr-3" />
            Lab Technician Dashboard
          </h1>
          <p className="text-gray-600">Advanced DSA-powered test queue management</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData && [
            {
              title: 'Tests Pending',
              value: dashboardData.queue_status.total_pending,
              icon: Clock,
              color: 'yellow',
              change: '+5'
            },
            {
              title: 'In Progress',
              value: dashboardData.queue_status.in_progress,
              icon: Activity,
              color: 'blue',
              change: '+2'
            },
            {
              title: 'Completed Today',
              value: dashboardData.queue_status.completed_today,
              icon: CheckCircle,
              color: 'green',
              change: '+12'
            },
            {
              title: 'Completion Rate',
              value: `${dashboardData.throughput_metrics.completion_rate.toFixed(1)}%`,
              icon: TrendingUp,
              color: 'purple',
              change: '+3.2%'
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

        {/* Current Processing & Queue Control */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Current Test Processing */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Current Processing
            </h2>
            
            {currentTest ? (
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{currentTest.patient_name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(currentTest.priority)}`}>
                    {currentTest.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Test ID: {currentTest.test_id}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Technician: {currentTest.assigned_technician}</span>
                  <div className="flex items-center text-sm text-blue-600">
                    <Timer className="w-4 h-4 mr-1" />
                    {currentTest.estimated_duration} min
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Pause className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No test currently being processed</p>
                <button
                  onClick={processNextTest}
                  disabled={processingTest}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {processingTest ? 'Processing...' : 'Process Next Test'}
                </button>
              </div>
            )}
          </motion.div>

          {/* Priority Queue Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Queue Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-800">Priority Queue</span>
                <span className="text-2xl font-bold text-red-600">
                  {dashboardData?.queue_status.priority_queue.total_tests}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-800">Routine Queue</span>
                <span className="text-2xl font-bold text-blue-600">
                  {dashboardData?.queue_status.routine_queue_size}
                </span>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Est. Completion Time</span>
                  <span className="font-semibold text-gray-800">
                    {dashboardData?.queue_status.priority_queue.estimated_completion_time} min
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-red-500 to-blue-500 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Technician Workload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Technician Workload (Load Balancer)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData && Object.entries(dashboardData.technician_workload).map(([techId, workload]) => (
              <div key={techId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">{techId}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    workload.utilization > 80 ? 'bg-red-100 text-red-800' :
                    workload.utilization > 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {workload.utilization.toFixed(0)}%
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Current Load:</span>
                    <span>{workload.current_load}/{workload.max_concurrent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tests Today:</span>
                    <span>{workload.tests_today}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        workload.utilization > 80 ? 'bg-red-500' :
                        workload.utilization > 60 ? 'bg-yellow-500' :
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

        {/* Recent Tests & Bottlenecks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tests */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Tests</h2>
            
            <div className="space-y-3">
              {dashboardData?.recent_tests.map((test) => (
                <div key={test.test_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">{test.patient_name}</h3>
                    <p className="text-sm text-gray-600">{test.test_id} • {test.assigned_technician}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(test.priority)}`}>
                      {test.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottlenecks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              System Bottlenecks
            </h2>
            
            <div className="space-y-3">
              {dashboardData?.bottlenecks.map((bottleneck, index) => (
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
                  <p className="text-xs text-gray-500 italic">{bottleneck.recommendation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
