'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, Users, Activity, TrendingUp, AlertTriangle, 
  Clock, DollarSign, Heart, FlaskConical, Pill, Shield,
  Calendar, UserCheck, Building, Zap
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SystemMetrics {
  total_patients_today: number
  active_patients: number
  completed_consultations: number
  revenue_today: number
  medicine_inventory_value: number
  lab_tests_completed: number
  critical_alerts: number
  system_uptime: number
}

interface PerformanceData {
  hour: string
  patients: number
  revenue: number
  lab_tests: number
}

interface DepartmentMetrics {
  department: string
  patients: number
  revenue: number
  utilization: number
}

interface AlertData {
  id: string
  type: string
  severity: 'High' | 'Medium' | 'Low'
  message: string
  timestamp: string
  department: string
}

export default function AdministratorDashboard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetrics[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [selectedTimeRange])

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockSystemMetrics: SystemMetrics = {
        total_patients_today: 156,
        active_patients: 28,
        completed_consultations: 128,
        revenue_today: 245000,
        medicine_inventory_value: 3200000,
        lab_tests_completed: 89,
        critical_alerts: 5,
        system_uptime: 99.8
      }

      const mockPerformanceData: PerformanceData[] = [
        { hour: '06:00', patients: 8, revenue: 12000, lab_tests: 5 },
        { hour: '08:00', patients: 15, revenue: 22000, lab_tests: 12 },
        { hour: '10:00', patients: 22, revenue: 35000, lab_tests: 18 },
        { hour: '12:00', patients: 28, revenue: 42000, lab_tests: 25 },
        { hour: '14:00', patients: 25, revenue: 38000, lab_tests: 22 },
        { hour: '16:00', patients: 20, revenue: 30000, lab_tests: 15 },
        { hour: '18:00', patients: 18, revenue: 28000, lab_tests: 12 },
        { hour: '20:00', patients: 12, revenue: 18000, lab_tests: 8 }
      ]

      const mockDepartmentMetrics: DepartmentMetrics[] = [
        { department: 'Emergency', patients: 45, revenue: 85000, utilization: 92 },
        { department: 'General Medicine', patients: 38, revenue: 65000, utilization: 78 },
        { department: 'Cardiology', patients: 22, revenue: 55000, utilization: 85 },
        { department: 'Laboratory', patients: 89, revenue: 35000, utilization: 88 },
        { department: 'Pharmacy', patients: 156, revenue: 45000, utilization: 75 }
      ]

      const mockAlerts: AlertData[] = [
        {
          id: '1',
          type: 'Critical Patient',
          severity: 'High',
          message: '2 critical patients waiting in emergency',
          timestamp: '2 min ago',
          department: 'Emergency'
        },
        {
          id: '2',
          type: 'Low Stock',
          severity: 'Medium',
          message: 'Paracetamol stock below minimum threshold',
          timestamp: '15 min ago',
          department: 'Pharmacy'
        },
        {
          id: '3',
          type: 'Equipment',
          severity: 'Medium',
          message: 'Lab equipment maintenance due',
          timestamp: '1 hour ago',
          department: 'Laboratory'
        }
      ]

      setSystemMetrics(mockSystemMetrics)
      setPerformanceData(mockPerformanceData)
      setDepartmentMetrics(mockDepartmentMetrics)
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Administrator Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                <Shield className="w-10 h-10 text-indigo-600 mr-3" />
                Administrator Dashboard
              </h1>
              <p className="text-gray-600">Comprehensive hospital management analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <div className="flex items-center text-sm text-green-600">
                <Zap className="w-4 h-4 mr-1" />
                System Uptime: {systemMetrics?.system_uptime}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemMetrics && [
            {
              title: 'Patients Today',
              value: systemMetrics.total_patients_today,
              icon: Users,
              color: 'blue',
              change: '+12%',
              subtitle: `${systemMetrics.active_patients} currently active`
            },
            {
              title: 'Revenue Today',
              value: `₹${(systemMetrics.revenue_today / 1000).toFixed(0)}K`,
              icon: DollarSign,
              color: 'green',
              change: '+8.5%',
              subtitle: `${systemMetrics.completed_consultations} consultations`
            },
            {
              title: 'Lab Tests',
              value: systemMetrics.lab_tests_completed,
              icon: FlaskConical,
              color: 'purple',
              change: '+15%',
              subtitle: 'Completed today'
            },
            {
              title: 'Critical Alerts',
              value: systemMetrics.critical_alerts,
              icon: AlertTriangle,
              color: 'red',
              change: '-2',
              subtitle: 'Require attention'
            }
          ].map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                  <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${
                  kpi.change.startsWith('+') ? 'text-green-600' : 
                  kpi.change.startsWith('-') && kpi.color === 'red' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{kpi.value}</h3>
              <p className="text-gray-600 text-sm mb-1">{kpi.title}</p>
              <p className="text-gray-500 text-xs">{kpi.subtitle}</p>
            </motion.div>
          ))}
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Patient Flow Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Patient Flow & Revenue
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="patients"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Patients"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Revenue (₹)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Department Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Department Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="patients" fill="#3B82F6" name="Patients" />
                <Bar dataKey="utilization" fill="#10B981" name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Department Metrics & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Department Revenue Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Revenue Distribution
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={departmentMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({department, revenue}) => `${department}: ₹${(revenue/1000).toFixed(0)}K`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {departmentMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Real-time Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Real-time System Alerts
            </h2>
            
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        alert.severity === 'High' ? 'bg-red-500' :
                        alert.severity === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <h3 className="font-semibold">{alert.type}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">{alert.department}</span>
                      <p className="text-xs text-gray-400">{alert.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Detailed Department Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Department Statistics
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-left py-3 px-4">Patients</th>
                  <th className="text-left py-3 px-4">Revenue</th>
                  <th className="text-left py-3 px-4">Utilization</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {departmentMetrics.map((dept, index) => (
                  <tr key={dept.department} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {dept.department === 'Emergency' && <Heart className="w-4 h-4 mr-2 text-red-500" />}
                        {dept.department === 'Laboratory' && <FlaskConical className="w-4 h-4 mr-2 text-purple-500" />}
                        {dept.department === 'Pharmacy' && <Pill className="w-4 h-4 mr-2 text-green-500" />}
                        {dept.department === 'General Medicine' && <UserCheck className="w-4 h-4 mr-2 text-blue-500" />}
                        {dept.department === 'Cardiology' && <Activity className="w-4 h-4 mr-2 text-red-500" />}
                        <span className="font-medium">{dept.department}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{dept.patients}</td>
                    <td className="py-3 px-4">₹{(dept.revenue / 1000).toFixed(0)}K</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              dept.utilization > 90 ? 'bg-red-500' :
                              dept.utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{width: `${dept.utilization}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{dept.utilization}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        dept.utilization > 90 ? 'bg-red-100 text-red-800' :
                        dept.utilization > 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {dept.utilization > 90 ? 'High Load' :
                         dept.utilization > 75 ? 'Moderate' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
