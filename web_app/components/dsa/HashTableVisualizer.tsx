'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hash, Plus, Search, Trash2, RotateCcw, Code } from 'lucide-react'

interface HashEntry {
  key: string
  value: string
  id: string
  isHighlighted?: boolean
  isCollision?: boolean
}

interface HashTableVisualizerProps {
  isPlaying: boolean
  speed?: number
  soundEnabled?: boolean
}

export default function HashTableVisualizer({ isPlaying, speed = 1, soundEnabled = true }: HashTableVisualizerProps) {
  const [table, setTable] = useState<(HashEntry[] | null)[]>(Array(10).fill(null))
  const [inputKey, setInputKey] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [currentOperation, setCurrentOperation] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPatientForm, setNewPatientForm] = useState({
    patientId: '',
    name: '',
    department: '',
    doctor: '',
    city: '',
    phone: ''
  })
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [metrics, setMetrics] = useState({
    totalEntries: 0,
    collisions: 0,
    loadFactor: 0,
    operations: 0
  })

  // Sample medical data
  const sampleData = [
    { key: 'P001', value: 'Rajesh Kumar - Cardiology' },
    { key: 'P002', value: 'Priya Sharma - Neurology' },
    { key: 'P003', value: 'Amit Patel - Orthopedics' },
    { key: 'P004', value: 'Sunita Devi - Pediatrics' },
    { key: 'P005', value: 'Vikram Singh - Dermatology' }
  ]

  // Validation functions
  const validatePatientForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!newPatientForm.patientId.trim()) {
      errors.patientId = 'Patient ID is required'
    } else if (!/^P\d{3,}$/.test(newPatientForm.patientId.trim())) {
      errors.patientId = 'Patient ID must be in format P001, P002, etc.'
    }
    
    if (!newPatientForm.name.trim()) {
      errors.name = 'Patient name is required'
    } else if (newPatientForm.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    if (!newPatientForm.department.trim()) {
      errors.department = 'Department is required'
    }
    
    if (!newPatientForm.doctor.trim()) {
      errors.doctor = 'Doctor name is required'
    }
    
    if (!newPatientForm.city.trim()) {
      errors.city = 'City is required'
    }
    
    if (newPatientForm.phone && !/^\d{10}$/.test(newPatientForm.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setNewPatientForm({
      patientId: '',
      name: '',
      department: '',
      doctor: '',
      city: '',
      phone: ''
    })
    setValidationErrors({})
    setShowAddForm(false)
  }

  const addCustomPatient = () => {
    if (!validatePatientForm()) return

    const patientRecord = `${newPatientForm.name} - ${newPatientForm.department} (Dr. ${newPatientForm.doctor}) - ${newPatientForm.city}${newPatientForm.phone ? ` - ${newPatientForm.phone}` : ''}`
    
    insert(newPatientForm.patientId.trim(), patientRecord, true)
    resetForm()
  }

  useEffect(() => {
    // Initialize with sample data
    sampleData.forEach(item => insert(item.key, item.value, false))
  }, [])

  const hashFunction = (key: string): number => {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * (i + 1)) % table.length
    }
    return hash
  }

  const insert = async (key: string, value: string, animated: boolean = true) => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setCurrentOperation(`Inserting ${key}: ${value}`)
    
    const index = hashFunction(key)
    const newEntry: HashEntry = {
      key,
      value,
      id: `entry-${key}-${Date.now()}`,
      isHighlighted: true
    }

    if (animated) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setTable(prevTable => {
      const newTable = [...prevTable]
      
      if (!newTable[index]) {
        newTable[index] = [newEntry]
      } else {
        // Handle collision with chaining
        newEntry.isCollision = true
        newTable[index] = [...newTable[index]!, newEntry]
        setMetrics(prev => ({ ...prev, collisions: prev.collisions + 1 }))
      }
      
      return newTable
    })

    setMetrics(prev => ({
      ...prev,
      totalEntries: prev.totalEntries + 1,
      operations: prev.operations + 1,
      loadFactor: (prev.totalEntries + 1) / table.length
    }))

    setTimeout(() => {
      setTable(prevTable => {
        const newTable = [...prevTable]
        if (newTable[index]) {
          newTable[index] = newTable[index]!.map(entry => ({
            ...entry,
            isHighlighted: false
          }))
        }
        return newTable
      })
      setCurrentOperation('')
      setIsAnimating(false)
    }, 2000)
  }

  const search = async (key: string) => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setCurrentOperation(`Searching for ${key}`)
    
    const index = hashFunction(key)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setTable(prevTable => {
      const newTable = [...prevTable]
      if (newTable[index]) {
        newTable[index] = newTable[index]!.map(entry => ({
          ...entry,
          isHighlighted: entry.key === key
        }))
      }
      return newTable
    })

    const bucket = table[index]
    const found = bucket?.find(entry => entry.key === key)
    
    setCurrentOperation(found ? `Found: ${found.value}` : `Key ${key} not found`)
    setMetrics(prev => ({ ...prev, operations: prev.operations + 1 }))

    setTimeout(() => {
      setTable(prevTable => {
        const newTable = [...prevTable]
        if (newTable[index]) {
          newTable[index] = newTable[index]!.map(entry => ({
            ...entry,
            isHighlighted: false
          }))
        }
        return newTable
      })
      setCurrentOperation('')
      setIsAnimating(false)
    }, 3000)
  }

  const remove = async (key: string) => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setCurrentOperation(`Removing ${key}`)
    
    const index = hashFunction(key)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setTable(prevTable => {
      const newTable = [...prevTable]
      if (newTable[index]) {
        const bucket = newTable[index]!
        const entryIndex = bucket.findIndex(entry => entry.key === key)
        
        if (entryIndex !== -1) {
          bucket.splice(entryIndex, 1)
          if (bucket.length === 0) {
            newTable[index] = null
          }
          setMetrics(prev => ({
            ...prev,
            totalEntries: prev.totalEntries - 1,
            operations: prev.operations + 1,
            loadFactor: (prev.totalEntries - 1) / table.length
          }))
        }
      }
      return newTable
    })

    setTimeout(() => {
      setCurrentOperation('')
      setIsAnimating(false)
    }, 1000)
  }

  const clearTable = () => {
    setTable(Array(10).fill(null))
    setMetrics({ totalEntries: 0, collisions: 0, loadFactor: 0, operations: 0 })
  }

  const handleInsert = () => {
    if (inputKey && inputValue) {
      insert(inputKey, inputValue, true)
      setInputKey('')
      setInputValue('')
    }
  }

  const handleSearch = () => {
    if (searchKey) {
      search(searchKey)
      setSearchKey('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Operation */}
      <div className="text-center">
        <AnimatePresence>
          {currentOperation && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-medium shadow-lg"
            >
              {currentOperation}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Quick Insert
          </h4>
          <div className="space-y-2">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Patient ID (e.g., P006)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Patient Info"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleInsert}
              disabled={isAnimating || !inputKey || !inputValue}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              Quick Insert
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Add New Patient
            </button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Search Entry
          </h4>
          <div className="space-y-2">
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="Enter Patient ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isAnimating || !searchKey}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Actions</h4>
          <div className="space-y-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Code className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={clearTable}
              className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Patient Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-large"
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Patient Record
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID *
                </label>
                <input
                  type="text"
                  value={newPatientForm.patientId}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, patientId: e.target.value }))}
                  placeholder="P001, P002, etc."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.patientId ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.patientId && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.patientId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  value={newPatientForm.department}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, department: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.department ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Emergency">Emergency</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="ENT">ENT</option>
                </select>
                {validationErrors.department && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  value={newPatientForm.doctor}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, doctor: e.target.value }))}
                  placeholder="Dr. Smith"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.doctor ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.doctor && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.doctor}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={newPatientForm.phone}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="10-digit phone number"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCustomPatient}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Add Patient Record
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Entries', value: metrics.totalEntries, color: 'from-blue-500 to-blue-600' },
          { label: 'Collisions', value: metrics.collisions, color: 'from-red-500 to-red-600' },
          { label: 'Load Factor', value: metrics.loadFactor.toFixed(2), color: 'from-green-500 to-green-600' },
          { label: 'Operations', value: metrics.operations, color: 'from-purple-500 to-purple-600' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-r ${metric.color} text-white p-4 rounded-xl shadow-lg`}
          >
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="text-sm opacity-90">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Hash Table Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Hash Table with Chaining (Size: {table.length})
          </h4>
        </div>
        
        <div className="space-y-3">
          {table.map((bucket, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-4 p-3 bg-white/70 rounded-lg border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                {index}
              </div>
              
              <div className="flex-1 flex items-center space-x-2 overflow-x-auto">
                {bucket ? (
                  bucket.map((entry, entryIndex) => (
                    <motion.div
                      key={entry.id}
                      className={`flex-shrink-0 p-3 rounded-lg border-2 shadow-sm ${
                        entry.isHighlighted
                          ? 'bg-yellow-100 border-yellow-400'
                          : entry.isCollision
                          ? 'bg-red-100 border-red-400'
                          : 'bg-green-100 border-green-400'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: entryIndex * 0.1 }}
                    >
                      <div className="font-bold text-sm">{entry.key}</div>
                      <div className="text-xs text-gray-600 max-w-32 truncate">
                        {entry.value}
                      </div>
                      <button
                        onClick={() => remove(entry.key)}
                        className="mt-1 p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-gray-400 italic">Empty</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Code Visualization */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm overflow-hidden"
          >
            <h4 className="text-white font-bold mb-4">Hash Table Implementation</h4>
            <pre className="whitespace-pre-wrap">
{`class HashTable {
  constructor(size = 10) {
    this.table = new Array(size).fill(null);
  }
  
  hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * (i + 1)) % this.table.length;
    }
    return hash;
  }
  
  insert(key, value) {
    const index = this.hash(key);
    if (!this.table[index]) {
      this.table[index] = [];
    }
    this.table[index].push({ key, value });
  }
  
  search(key) {
    const index = this.hash(key);
    const bucket = this.table[index];
    return bucket?.find(entry => entry.key === key);
  }
}`}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
