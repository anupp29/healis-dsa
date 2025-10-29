'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Users, Calendar, Brain, Stethoscope } from 'lucide-react'

import Navigation from '../components/Navigation'
import HeroSection from '../components/HeroSection'
import DSAShowcase from '../components/DSAShowcase'
import LiveMetrics from '../components/LiveMetrics'
export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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
    <div className="min-h-screen">
      <Navigation />
      
      <main className="relative">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Live Metrics Dashboard */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-display font-bold text-text-primary mb-4">
                Live Healthcare Analytics
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Real-time visualization of DSA algorithms processing healthcare data
              </p>
            </motion.div>
            
            <LiveMetrics />
          </div>
        </section>

        {/* DSA Showcase */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pastel-whisper/30 to-pastel-sky/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-display font-bold text-text-primary mb-4">
                DSA in Action
              </h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Watch basic data structures and algorithms solve real healthcare challenges
              </p>
            </motion.div>
            
            <DSAShowcase />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="medical-card p-6 text-center group hover:scale-105"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

const features = [
  {
    icon: Heart,
    title: "Priority Queue Triage",
    description: "Emergency room patient prioritization using min-heap algorithms for optimal care delivery"
  },
  {
    icon: Activity,
    title: "Real-time Queue Management",
    description: "FIFO queue visualization for appointment scheduling and patient flow optimization"
  },
  {
    icon: Users,
    title: "Stack-based Records",
    description: "LIFO stack operations for accessing recent medical records and treatment history"
  },
  {
    icon: Calendar,
    title: "Graph Network Analysis",
    description: "Hospital network optimization using graph algorithms for patient transfers"
  },
  {
    icon: Brain,
    title: "Intelligent Analytics",
    description: "Advanced data processing with hash tables and binary search trees for fast lookups"
  },
  {
    icon: Stethoscope,
    title: "Medical Insights",
    description: "Professional healthcare visualizations with Indian hospital data integration"
  }
]
