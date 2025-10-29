'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, Heart, FlaskConical, Pill, Navigation, 
  BarChart3, Users, Activity, TrendingUp
} from 'lucide-react'
import AdministratorDashboard from '../../components/AdministratorDashboard'
import PatientManagementDashboard from '../../components/PatientManagementDashboard'
import LabTechnicianDashboard from '../../components/LabTechnicianDashboard'
import MedicineManagement from '../../components/MedicineManagement'

type DashboardView = 'admin' | 'patient' | 'lab' | 'medicine' | 'navigation'

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<DashboardView>('admin')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const dashboardOptions = [
    {
      id: 'admin' as DashboardView,
      title: 'Administrator Dashboard',
      description: 'Comprehensive hospital management analytics',
      icon: Shield,
      color: 'indigo',
      features: ['Real-time Analytics', 'Department Performance', 'Revenue Tracking', 'System Alerts']
    },
    {
      id: 'patient' as DashboardView,
      title: 'Patient Management',
      description: 'Advanced priority queue triage system',
      icon: Heart,
      color: 'red',
      features: ['Priority Queue', 'Triage System', 'Doctor Assignment', 'Wait Time Optimization']
    },
    {
      id: 'lab' as DashboardView,
      title: 'Lab Technician',
      description: 'Test queue management and workflow',
      icon: FlaskConical,
      color: 'purple',
      features: ['Test Queue', 'Workload Balancing', 'Priority Processing', 'Bottleneck Analysis']
    },
    {
      id: 'medicine' as DashboardView,
      title: 'Medicine Management',
      description: 'Inventory tracking and optimization',
      icon: Pill,
      color: 'blue',
      features: ['Inventory Tracking', 'Stock Alerts', 'Search Engine', 'Reorder Management']
    }
  ]

  const renderDashboard = () => {
    switch (activeView) {
      case 'admin':
        return <AdministratorDashboard />
      case 'patient':
        return <PatientManagementDashboard />
      case 'lab':
        return <LabTechnicianDashboard />
      case 'medicine':
        return <MedicineManagement />
      default:
        return <AdministratorDashboard />
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading HEAL Platform...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">HEAL Platform</h1>
                <p className="text-sm text-gray-600">Healthcare DSA Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {dashboardOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveView(option.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeView === option.id
                      ? `bg-${option.color}-100 text-${option.color}-700 border-2 border-${option.color}-300`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  <span className="font-medium">{option.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {renderDashboard()}
      </motion.div>

      {/* Feature Overview Modal - Show when no specific dashboard is active */}
      {activeView === 'navigation' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">HEAL Platform Features</h2>
                <button
                  onClick={() => setActiveView('admin')}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {dashboardOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-br from-${option.color}-50 to-${option.color}-100 rounded-xl p-6 border border-${option.color}-200 hover:shadow-lg transition-shadow cursor-pointer`}
                    onClick={() => setActiveView(option.id)}
                  >
                    <div className={`w-16 h-16 bg-${option.color}-200 rounded-xl flex items-center justify-center mb-4`}>
                      <option.icon className={`w-8 h-8 text-${option.color}-600`} />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Key Features:</h4>
                      <ul className="space-y-1">
                        {option.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <div className={`w-2 h-2 bg-${option.color}-500 rounded-full mr-2`}></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                  DSA Algorithms Implemented
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Data Structures</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Priority Queues (Min/Max Heap)</li>
                      <li>• Hash Tables for O(1) lookup</li>
                      <li>• Binary Search Trees</li>
                      <li>• Graphs for navigation</li>
                      <li>• FIFO/LIFO Queues</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Search & Sort</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Binary Search</li>
                      <li>• Fuzzy String Matching</li>
                      <li>• Quick Sort</li>
                      <li>• Merge Sort</li>
                      <li>• Heap Sort</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Graph Algorithms</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Dijkstra's Shortest Path</li>
                      <li>• A* Pathfinding</li>
                      <li>• BFS/DFS Traversal</li>
                      <li>• Load Balancing</li>
                      <li>• Network Flow</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
