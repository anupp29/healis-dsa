'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Activity, Users, Network, Database, Cpu, Play, Pause, RotateCcw } from 'lucide-react'
import PriorityQueueVisualizer from './dsa/PriorityQueueVisualizer'
import QueueFlowVisualizer from './dsa/QueueFlowVisualizer'
import StackRecordsVisualizer from './dsa/StackRecordsVisualizer'
import GraphNetworkVisualizer from './dsa/GraphNetworkVisualizer'

export default function DSAShowcase() {
  const [activeTab, setActiveTab] = useState('priority-queue')
  const [isPlaying, setIsPlaying] = useState(false)

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

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center space-x-4"
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            isPlaying
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-medium hover:shadow-large'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-medium hover:shadow-large'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isPlaying ? 'Pause Animation' : 'Start Animation'}</span>
        </button>
        
        <button className="flex items-center space-x-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-medium hover:shadow-large transition-all duration-300">
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>
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
                <ActiveComponent isPlaying={isPlaying} />
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
    'queue-flow': 'O(1)',
    'stack-records': 'O(1)',
    'graph-network': 'O(V + E)'
  }
  return complexities[tab as keyof typeof complexities] || 'O(n)'
}

function getTimeComplexity(tab: string) {
  const complexities = {
    'priority-queue': 'O(log n)',
    'queue-flow': 'O(1)',
    'stack-records': 'O(1)',
    'graph-network': 'O(V log V)'
  }
  return complexities[tab as keyof typeof complexities] || 'O(n)'
}

function getSpaceComplexity(tab: string) {
  const complexities = {
    'priority-queue': 'O(n)',
    'queue-flow': 'O(n)',
    'stack-records': 'O(n)',
    'graph-network': 'O(V + E)'
  }
  return complexities[tab as keyof typeof complexities] || 'O(n)'
}

function getUseCase(tab: string) {
  const useCases = {
    'priority-queue': 'Emergency Triage',
    'queue-flow': 'Appointment Scheduling',
    'stack-records': 'Medical History',
    'graph-network': 'Hospital Navigation'
  }
  return useCases[tab as keyof typeof useCases] || 'Healthcare'
}

function getAlgorithmExplanation(tab: string) {
  const explanations = {
    'priority-queue': 'The Priority Queue uses a Min-Heap data structure to ensure that patients with the highest medical priority (lowest priority number) are always processed first. Each insertion and extraction maintains the heap property, guaranteeing optimal emergency care delivery.',
    'queue-flow': 'The FIFO Queue processes appointments in the order they were scheduled, ensuring fairness in non-emergency situations. Patients enter the queue when booking appointments and are served in chronological order, maintaining system integrity.',
    'stack-records': 'The Stack structure provides LIFO access to medical records, allowing healthcare providers to quickly access the most recent patient information. This is ideal for reviewing recent treatments, medications, and diagnostic results.',
    'graph-network': 'The Graph Network uses Dijkstra\'s algorithm to find the shortest path between hospitals for patient transfers. Each hospital is a node, and connections represent transfer routes with associated costs (time, distance, resources).'
  }
  return explanations[tab as keyof typeof explanations] || 'Advanced algorithm visualization for healthcare applications.'
}
