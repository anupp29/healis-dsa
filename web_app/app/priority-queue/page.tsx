'use client'

import { useState } from 'react'
import Navigation from '../../components/Navigation'
import PriorityQueueVisualizer from '../../components/dsa/PriorityQueueVisualizer'

export default function PriorityQueuePage() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Priority Queue Visualization
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience emergency room triage using Min-Heap data structure. 
              Watch how patients are prioritized based on medical severity for optimal care delivery.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                isPlaying
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isPlaying ? 'Pause Animation' : 'Start Animation'}
            </button>
          </div>

          <PriorityQueueVisualizer isPlaying={isPlaying} />
        </div>
      </main>
    </div>
  )
}
