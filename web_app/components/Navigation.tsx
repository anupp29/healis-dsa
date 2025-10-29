'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Heart, Activity, Users, BarChart3, Brain, 
  Pill, FlaskConical, Navigation as NavigationIcon, Shield,
  ChevronDown, Sparkles, Zap, Code2
} from 'lucide-react'
import Link from 'next/link'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
        : 'bg-white/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-bounce">
                <Sparkles className="w-2 h-2 text-white m-0.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  HEAL Platform
                </h1>
                <div className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                  <span className="text-xs font-semibold text-blue-700">DSA Powered</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Healis Medical AI • DSA Implementation Showcase
              </p>
            </div>
          </motion.div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navSections.map((section, index) => (
              <div
                key={section.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(section.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeDropdown === section.name
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <section.icon className={`w-5 h-5 transition-all duration-200 ${
                    activeDropdown === section.name ? 'scale-110 text-blue-600' : 'group-hover:scale-105'
                  }`} />
                  <span className="font-semibold">{section.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    activeDropdown === section.name ? 'rotate-180' : ''
                  }`} />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === section.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="mb-3">
                          <h3 className="font-bold text-gray-900 mb-1">{section.name}</h3>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                            >
                              <div className={`p-2 rounded-lg ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                                <item.icon className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 group-hover:text-blue-700">{item.name}</p>
                                <p className="text-xs text-gray-600">{item.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex items-center space-x-3"
          >
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Live Demo</span>
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-300 hover:text-blue-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Code2 className="w-4 h-4" />
              <span>View Code</span>
            </Link>
          </motion.div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/98 backdrop-blur-xl border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-6">
              {navSections.map((section) => (
                <div key={section.name} className="space-y-3">
                  <div className="flex items-center space-x-3 px-3">
                    <section.icon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">{section.name}</h3>
                  </div>
                  <div className="space-y-2 pl-6">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className={`p-2 rounded-lg ${item.color}`}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <Link
                  href="/dashboard"
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl text-center block"
                  onClick={() => setIsOpen(false)}
                >
                  Explore Live Demo
                </Link>
                <Link
                  href="/docs"
                  className="w-full px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl text-center block"
                  onClick={() => setIsOpen(false)}
                >
                  View Documentation
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const navSections = [
  {
    name: 'DSA Systems',
    icon: Brain,
    description: 'Core data structure implementations',
    items: [
      {
        name: 'Patient Triage',
        href: '/dashboard?view=patient',
        icon: Heart,
        color: 'bg-gradient-to-r from-red-500 to-pink-500',
        description: 'Priority queue patient management'
      },
      {
        name: 'Medicine Inventory',
        href: '/dashboard?view=medicine',
        icon: Pill,
        color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        description: 'Hash table medicine lookup'
      },
      {
        name: 'Lab Processing',
        href: '/dashboard?view=lab',
        icon: FlaskConical,
        color: 'bg-gradient-to-r from-purple-500 to-violet-500',
        description: 'Queue-based test management'
      }
    ]
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    description: 'Real-time data visualization',
    items: [
      {
        name: 'Admin Dashboard',
        href: '/dashboard?view=admin',
        icon: Shield,
        color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        description: 'Comprehensive system overview'
      },
      {
        name: 'Performance Metrics',
        href: '/dashboard?view=admin',
        icon: Activity,
        color: 'bg-gradient-to-r from-orange-500 to-red-500',
        description: 'Algorithm performance tracking'
      },
      {
        name: 'User Analytics',
        href: '/dashboard?view=admin',
        icon: Users,
        color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        description: 'User behavior insights'
      }
    ]
  },
  {
    name: 'Navigation',
    icon: NavigationIcon,
    description: 'Graph-based pathfinding',
    items: [
      {
        name: 'Hospital Maps',
        href: '/dashboard?view=navigation',
        icon: NavigationIcon,
        color: 'bg-gradient-to-r from-teal-500 to-green-500',
        description: 'Interactive hospital navigation'
      },
      {
        name: 'Route Optimization',
        href: '/dashboard?view=navigation',
        icon: Zap,
        color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        description: 'Shortest path algorithms'
      }
    ]
  }
]
