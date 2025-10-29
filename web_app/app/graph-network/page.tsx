'use client'

import { useState } from 'react'
import Navigation from '../../components/Navigation'
import GraphNetworkVisualizer from '../../components/dsa/GraphNetworkVisualizer'

export default function GraphNetworkPage() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Graph Network Visualization
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover hospital network pathfinding using Dijkstra's algorithm. 
              Find the shortest routes between Indian hospitals for optimal patient transfers.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                isPlaying
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isPlaying ? 'Pause Animation' : 'Start Animation'}
            </button>
          </div>

          <GraphNetworkVisualizer isPlaying={isPlaying} />
        </div>
      </main>
    </div>
  )
}
