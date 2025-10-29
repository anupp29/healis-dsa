'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Users, Calendar, Brain, Stethoscope, Pill, FlaskConical, BarChart3, Navigation as NavigationIcon } from 'lucide-react'
import Link from 'next/link'
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
                <Link
                  key={feature.title}
                  href={getFeatureHref(feature.title)}
                  className="medical-card p-6 text-center group hover:scale-105"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
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
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

const getFeatureHref = (title: string): string => {
  switch (title) {
    case "Patient Triage System": return "/dashboard?view=patient"
    case "Medicine Management": return "/dashboard?view=medicine"
    case "Lab Workflow Engine": return "/dashboard?view=lab"
    case "Administrator Analytics": return "/dashboard?view=admin"
    case "Hospital Navigation": return "/dashboard?view=navigation"
    default: return "/dashboard"
  }
}

const features = [
  {
    icon: Heart,
    title: "Patient Triage System",
    description: "Medical-grade priority queue with 5-level triage, vital signs integration, and real-time priority adjustment"
  },
  {
    icon: Pill,
    title: "Medicine Management",
    description: "Advanced inventory tracking with hash tables, fuzzy search, and predictive reorder recommendations"
  },
  {
    icon: FlaskConical,
    title: "Lab Workflow Engine",
    description: "Multi-dimensional priority queues for test processing with intelligent workload balancing"
  },
  {
    icon: BarChart3,
    title: "Administrator Analytics",
    description: "Comprehensive hospital analytics with real-time KPIs, revenue tracking, and bottleneck detection"
  },
  {
    icon: NavigationIcon,
    title: "Hospital Navigation",
    description: "Graph-based pathfinding with Dijkstra's algorithm, accessibility support, and emergency evacuation"
  },
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Live data visualization with beautiful UI, interactive charts, and instant system updates"
  }
]
