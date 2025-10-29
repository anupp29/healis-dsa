'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Pill, Search, AlertTriangle, TrendingUp, Package, 
  Calendar, DollarSign, Filter, Plus, RefreshCw 
} from 'lucide-react'

interface Medicine {
  medicine_id: string
  name: string
  generic_name: string
  category: string
  current_stock: number
  min_threshold: number
  selling_price: number
  status: string
  expiry_date?: string
}

interface DashboardData {
  total_medicines: number
  active_medicines: number
  low_stock_count: number
  expiring_count: number
  out_of_stock_count: number
  inventory_value: {
    total_cost_value: number
    total_selling_value: number
    potential_profit: number
  }
  critical_medicines: Medicine[]
  expiring_medicines: Medicine[]
}

export default function MedicineManagement() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Medicine[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  const categories = [
    'All', 'Antibiotic', 'Painkiller', 'Vitamin', 'Cardiac', 
    'Diabetes', 'Respiratory', 'Neurological', 'Other'
  ]

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual backend
      const mockData: DashboardData = {
        total_medicines: 1250,
        active_medicines: 1180,
        low_stock_count: 45,
        expiring_count: 23,
        out_of_stock_count: 12,
        inventory_value: {
          total_cost_value: 2500000,
          total_selling_value: 3200000,
          potential_profit: 700000
        },
        critical_medicines: [
          {
            medicine_id: 'MED000001',
            name: 'Paracetamol 500mg',
            generic_name: 'Acetaminophen',
            category: 'Painkiller',
            current_stock: 5,
            min_threshold: 50,
            selling_price: 2.50,
            status: 'Active'
          },
          {
            medicine_id: 'MED000002',
            name: 'Amoxicillin 250mg',
            generic_name: 'Amoxicillin',
            category: 'Antibiotic',
            current_stock: 0,
            min_threshold: 30,
            selling_price: 15.00,
            status: 'Out of Stock'
          }
        ],
        expiring_medicines: [
          {
            medicine_id: 'MED000003',
            name: 'Vitamin D3 1000IU',
            generic_name: 'Cholecalciferol',
            category: 'Vitamin',
            current_stock: 120,
            min_threshold: 25,
            selling_price: 8.50,
            status: 'Active',
            expiry_date: '2024-12-15'
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    // Simulate search API call
    const mockResults: Medicine[] = [
      {
        medicine_id: 'MED000004',
        name: 'Aspirin 75mg',
        generic_name: 'Acetylsalicylic Acid',
        category: 'Cardiac',
        current_stock: 200,
        min_threshold: 50,
        selling_price: 3.25,
        status: 'Active'
      }
    ]
    setSearchResults(mockResults)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Medicine Management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <Pill className="w-10 h-10 text-blue-600 mr-3" />
            Medicine Management System
          </h1>
          <p className="text-gray-600">Advanced DSA-powered inventory management</p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData && [
            {
              title: 'Total Medicines',
              value: dashboardData.total_medicines,
              icon: Package,
              color: 'blue',
              change: '+12%'
            },
            {
              title: 'Low Stock Alert',
              value: dashboardData.low_stock_count,
              icon: AlertTriangle,
              color: 'red',
              change: '-5%'
            },
            {
              title: 'Expiring Soon',
              value: dashboardData.expiring_count,
              icon: Calendar,
              color: 'yellow',
              change: '+3%'
            },
            {
              title: 'Inventory Value',
              value: `₹${(dashboardData.inventory_value.total_selling_value / 100000).toFixed(1)}L`,
              icon: DollarSign,
              color: 'green',
              change: '+8%'
            }
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
                <span className={`text-sm font-medium text-${card.color === 'red' ? 'red' : 'green'}-600`}>
                  {card.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{card.value}</h3>
              <p className="text-gray-600 text-sm">{card.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Medicine Search & Filter
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search medicines by name, generic name, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </button>
          </div>
        </motion.div>

        {/* Critical Medicines Alert */}
        {dashboardData?.critical_medicines && dashboardData.critical_medicines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Critical Stock Alerts (Priority Queue)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.critical_medicines.map((medicine, index) => (
                <div key={medicine.medicine_id} className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{medicine.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      medicine.status === 'Out of Stock' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {medicine.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{medicine.generic_name}</p>
                  <div className="flex justify-between text-sm">
                    <span>Stock: <strong>{medicine.current_stock}</strong></span>
                    <span>Min: <strong>{medicine.min_threshold}</strong></span>
                    <span>Price: <strong>₹{medicine.selling_price}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Medicine</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Stock</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((medicine) => (
                    <tr key={medicine.medicine_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-800">{medicine.name}</p>
                          <p className="text-sm text-gray-600">{medicine.generic_name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{medicine.category}</td>
                      <td className="py-3 px-4">{medicine.current_stock}</td>
                      <td className="py-3 px-4">₹{medicine.selling_price}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          medicine.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {medicine.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
