'use client'

import { useEffect, useRef } from 'react'

interface SoundSystemProps {
  enabled: boolean
}

export default function SoundSystem({ enabled }: SoundSystemProps) {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [enabled])

  const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled || !audioContextRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + duration)
  }

  const playSuccess = () => {
    playTone(523.25, 0.2) // C5
    setTimeout(() => playTone(659.25, 0.2), 100) // E5
    setTimeout(() => playTone(783.99, 0.3), 200) // G5
  }

  const playError = () => {
    playTone(220, 0.3, 'sawtooth') // A3
    setTimeout(() => playTone(196, 0.4, 'sawtooth'), 150) // G3
  }

  const playInsert = () => {
    playTone(440, 0.1) // A4
  }

  const playDelete = () => {
    playTone(330, 0.15, 'triangle') // E4
  }

  const playSearch = () => {
    playTone(523.25, 0.1) // C5
    setTimeout(() => playTone(587.33, 0.1), 50) // D5
    setTimeout(() => playTone(659.25, 0.1), 100) // E5
  }

  const playSwap = () => {
    playTone(392, 0.08) // G4
    setTimeout(() => playTone(349.23, 0.08), 40) // F4
  }

  const playComparison = () => {
    playTone(293.66, 0.05) // D4
  }

  const playPathFound = () => {
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99] // C5, D5, E5, F5, G5
    notes.forEach((note, index) => {
      setTimeout(() => playTone(note, 0.15), index * 80)
    })
  }

  // Expose sound functions globally for use in visualizers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).dsaSounds = {
        playSuccess,
        playError,
        playInsert,
        playDelete,
        playSearch,
        playSwap,
        playComparison,
        playPathFound
      }
    }
  }, [enabled])

  return null
}

// Helper function to play sounds from visualizers
export const playSound = (soundType: string) => {
  if (typeof window !== 'undefined' && (window as any).dsaSounds) {
    const soundFunction = (window as any).dsaSounds[soundType]
    if (soundFunction) {
      soundFunction()
    }
  }
}
