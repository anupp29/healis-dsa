'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, Database, Cpu, Heart } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-200/20 to-orange-200/20 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-100 mb-6">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Professional DSA Visualization</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold text-gray-800 mb-6 leading-tight">
                Where{' '}
                <span className="text-gradient">Basic DSA</span>
                <br />
                Meets{' '}
                <span className="text-gradient">Healthcare</span>
                <br />
                Excellence
              </h1>
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-8">
                Experience the beauty of fundamental data structures and algorithms through 
                professional healthcare visualizations. Watch heaps, queues, stacks, and graphs 
                solve real medical challenges with stunning clarity.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button className="btn-primary group">
                <span>Start Exploring</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              
              <button className="btn-secondary group">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-border-light"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">5+</div>
                <div className="text-sm text-text-secondary">DSA Concepts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">1000+</div>
                <div className="text-sm text-text-secondary">Patient Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">Real-time</div>
                <div className="text-sm text-text-secondary">Visualization</div>
              </div>
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-display font-semibold text-text-primary">
                      Emergency Triage System
                    </h3>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>

                  {/* Priority Queue Visualization Preview */}
                  <div className="space-y-3">
                    {priorityPatients.map((patient, index) => (
                      <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`p-3 rounded-lg border-l-4 ${patient.priorityClass} transition-all duration-300 hover:scale-105`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-text-primary">{patient.name}</div>
                            <div className="text-sm text-text-secondary">{patient.condition}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-text-primary">Priority: {patient.priority}</div>
                            <div className="text-xs text-text-secondary">{patient.waitTime}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* DSA Icons */}
                  <div className="flex items-center justify-center space-x-6 mt-8 pt-6 border-t border-border-light">
                    <div className="text-center group">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-xs text-text-secondary">Heap</div>
                    </div>
                    <div className="text-center group">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                        <Cpu className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-xs text-text-secondary">Queue</div>
                    </div>
                    <div className="text-center group">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                        <Heart className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-xs text-text-secondary">Stack</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-2xl flex items-center justify-center shadow-medium"
              >
                <Sparkles className="w-8 h-8 text-orange-600" />
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-200 to-blue-200 rounded-xl flex items-center justify-center shadow-medium"
              >
                <Heart className="w-6 h-6 text-blue-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const priorityPatients = [
  {
    id: 1,
    name: "Rajesh Kumar",
    condition: "Chest Pain",
    priority: 9,
    waitTime: "2 min",
    priorityClass: "priority-critical"
  },
  {
    id: 2,
    name: "Priya Sharma",
    condition: "Severe Headache",
    priority: 7,
    waitTime: "8 min",
    priorityClass: "priority-urgent"
  },
  {
    id: 3,
    name: "Amit Patel",
    condition: "Routine Checkup",
    priority: 3,
    waitTime: "25 min",
    priorityClass: "priority-stable"
  }
]
