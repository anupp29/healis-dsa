'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Activity, Users, Network, Database, Cpu, Play, Pause, RotateCcw, TreePine, BarChart3, Hash, Navigation, Volume2, VolumeX, Settings, Download, Maximize2 } from 'lucide-react'
import PriorityQueueVisualizer from './dsa/PriorityQueueVisualizer'
import QueueFlowVisualizer from './dsa/QueueFlowVisualizer'
import StackRecordsVisualizer from './dsa/StackRecordsVisualizer'
import GraphNetworkVisualizer from './dsa/GraphNetworkVisualizer'
import BinarySearchTreeVisualizer from './dsa/BinarySearchTreeVisualizer'
import SortingVisualizer from './dsa/SortingVisualizer'
import HashTableVisualizer from './dsa/HashTableVisualizer'
import PathfindingVisualizer from './dsa/PathfindingVisualizer'
import SoundSystem from './dsa/SoundSystem'

export default function DSAShowcase() {
  const [activeTab, setActiveTab] = useState('binary-search-tree')
  const [isPlaying, setIsPlaying] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const dsaTabs = [
    {
      id: 'priority-queue',
      name: 'Priority Queue',
      description: 'Emergency Triage System using Min-Heap',
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50',
      component: PriorityQueueVisualizer
    },
    {
      id: 'binary-search-tree',
      name: 'Binary Search Tree',
      description: 'Patient Records BST with Real-time Operations',
      icon: TreePine,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
      component: BinarySearchTreeVisualizer
    },
    {
      id: 'sorting-algorithms',
      name: 'Sorting Algorithms',
      description: 'Interactive Sorting Visualizations',
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      component: SortingVisualizer
    },
    {
      id: 'hash-table',
      name: 'Hash Table',
      description: 'Patient Database with Collision Handling',
      icon: Hash,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-50 to-purple-50',
      component: HashTableVisualizer
    },
    {
      id: 'pathfinding',
      name: 'Pathfinding',
      description: 'Hospital Navigation with A* & Dijkstra',
      icon: Navigation,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'from-teal-50 to-cyan-50',
      component: PathfindingVisualizer
    },
    {
      id: 'queue-flow',
      name: 'Queue Flow',
      description: 'FIFO Appointment Processing',
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      component: QueueFlowVisualizer
    },
    {
      id: 'stack-records',
      name: 'Stack Records',
      description: 'LIFO Medical History Access',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      component: StackRecordsVisualizer
    },
    {
      id: 'graph-network',
      name: 'Graph Network',
      description: 'Hospital Network Pathfinding',
      icon: Network,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50',
      component: GraphNetworkVisualizer
    }
  ]

  const activeTabData = dsaTabs.find(tab => tab.id === activeTab)
  const ActiveComponent = activeTabData?.component

  return (
    <div className="space-y-8">
      <SoundSystem enabled={soundEnabled} />
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-4 justify-center">
        {dsaTabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative p-4 rounded-2xl border-2 transition-all duration-300 group ${
              activeTab === tab.id
                ? 'border-blue-300 bg-gradient-to-br from-white to-blue-50 shadow-large'
                : 'border-border-light bg-white/50 hover:border-blue-200 hover:shadow-medium'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tab.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <tab.icon className={`w-6 h-6 bg-gradient-to-r ${tab.color} bg-clip-text text-transparent`} />
              </div>
              <div className="text-left">
                <div className="font-display font-semibold text-text-primary">
                  {tab.name}
                </div>
                <div className="text-sm text-text-secondary">
                  {tab.description}
                </div>
              </div>
            </div>
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border-2 border-blue-300"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Enhanced Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Algorithm Controls</h3>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                soundEnabled
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
            >
              <Maximize2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Playback Control</label>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isPlaying
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Animation Speed: {speed}x</label>
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Export & Share</label>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </motion.button>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Healthcare Theme</option>
                    <option>Dark Mode</option>
                    <option>High Contrast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Size</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Small (10-20 items)</option>
                    <option>Medium (50-100 items)</option>
                    <option>Large (200+ items)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Visualization Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 min-h-[600px]"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-display font-bold text-text-primary mb-2">
              {activeTabData?.name} Visualization
            </h3>
            <p className="text-text-secondary">
              {activeTabData?.description} - Watch the algorithm in action
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-text-secondary">Live Simulation</span>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-text-secondary">Complexity</div>
              <div className="font-mono font-bold text-text-primary">
                {getComplexity(activeTab)}
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Component */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {ActiveComponent && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ActiveComponent isPlaying={isPlaying} speed={speed} soundEnabled={soundEnabled} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Algorithm Explanation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-gradient-to-r from-pastel-whisper to-pastel-sky rounded-xl border border-border-light"
        >
          <h4 className="font-display font-semibold text-text-primary mb-3">
            How it Works
          </h4>
          <p className="text-text-secondary leading-relaxed">
            {getAlgorithmExplanation(activeTab)}
          </p>
          
          <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-border-light">
            <div className="text-center">
              <div className="text-sm text-text-secondary">Time Complexity</div>
              <div className="font-mono font-bold text-text-primary">{getTimeComplexity(activeTab)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-text-secondary">Space Complexity</div>
              <div className="font-mono font-bold text-text-primary">{getSpaceComplexity(activeTab)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-text-secondary">Use Case</div>
              <div className="font-medium text-text-primary">{getUseCase(activeTab)}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function getComplexity(tab: string) {
  const complexities = {
    'priority-queue': 'O(log n)',
    'binary-search-tree': 'O(log n)',
    'sorting-algorithms': 'O(n log n)',
    'hash-table': 'O(1)',
    'pathfinding': 'O(V log V)',
    'queue-flow': 'O(1)',
    'stack-records': 'O(1)',
    'graph-network': 'O(V + E)'
  }
  return complexities[tab as keyof typeof complexities] || 'O(n)'
}

function getTimeComplexity(tab: string) {
  const complexities = {
    'priority-queue': 'O(log n)',
    'binary-search-tree': 'O(log n)',
    'sorting-algorithms': 'O(n²) - O(n log n)',
    'hash-table': 'O(1) avg',
    'pathfinding': 'O(V log V + E)',
    'queue-flow': 'O(1)',
    'stack-records': 'O(1)',
    'graph-network': 'O(V log V)'
  }
  return complexities[tab as keyof typeof complexities] || 'O(n)'
}

function getSpaceComplexity(tab: string) {
  const complexities = {
    'priority-queue': 'O(n)',
    'binary-search-tree': 'O(n)',
    'sorting-algorithms': 'O(1) - O(n)',
    'hash-table': 'O(n)',
    'pathfinding': 'O(V)',
    'queue-flow': 'O(n)',
    'stack-records': 'O(n)',
    'graph-network': 'O(V + E)'
  }
  return complexities[tab as keyof typeof complexities] || 'O(n)'
}

function getUseCase(tab: string) {
  const useCases = {
    'priority-queue': 'Emergency Triage',
    'binary-search-tree': 'Patient Records',
    'sorting-algorithms': 'Data Organization',
    'hash-table': 'Fast Patient Lookup',
    'pathfinding': 'Hospital Navigation',
    'queue-flow': 'Appointment Scheduling',
    'stack-records': 'Medical History',
    'graph-network': 'Hospital Navigation'
  }
  return useCases[tab as keyof typeof useCases] || 'Healthcare'
}

function getAlgorithmExplanation(tab: string) {
  const explanations = {
    'priority-queue': 'The Priority Queue uses a Min-Heap data structure to ensure that patients with the highest medical priority (lowest priority number) are always processed first. Each insertion and extraction maintains the heap property, guaranteeing optimal emergency care delivery.',
    'binary-search-tree': 'The Binary Search Tree maintains patient records in a sorted hierarchical structure. Each node contains a patient ID, with smaller IDs on the left and larger IDs on the right. This enables O(log n) search, insertion, and deletion operations for efficient patient data management.',
    'sorting-algorithms': 'Interactive visualization of fundamental sorting algorithms including Bubble Sort, Quick Sort, Merge Sort, and Heap Sort. Watch how different algorithms organize patient data with varying time complexities and performance characteristics.',
    'hash-table': 'The Hash Table provides O(1) average-case lookup time for patient records using a hash function. Collisions are handled through chaining, ensuring all patient data is accessible even when multiple records hash to the same index.',
    'pathfinding': 'Advanced pathfinding algorithms including Dijkstra\'s Algorithm and A* Search for optimal hospital navigation. Visualize how different algorithms explore the search space to find the shortest path between locations, with real-time metrics and interactive maze generation.',
    'queue-flow': 'The FIFO Queue processes appointments in the order they were scheduled, ensuring fairness in non-emergency situations. Patients enter the queue when booking appointments and are served in chronological order, maintaining system integrity.',
    'stack-records': 'The Stack structure provides LIFO access to medical records, allowing healthcare providers to quickly access the most recent patient information. This is ideal for reviewing recent treatments, medications, and diagnostic results.',
    'graph-network': 'The Graph Network uses Dijkstra\'s algorithm to find the shortest path between hospitals for patient transfers. Each hospital is a node, and connections represent transfer routes with associated costs (time, distance, resources).'
  }
  return explanations[tab as keyof typeof explanations] || 'Advanced algorithm visualization for healthcare applications.'
}
