"use client"

import { motion, AnimatePresence } from "framer-motion"

interface VoiceOrbProps {
  isListening: boolean
  onToggle: () => void
}

export function VoiceOrb({ isListening, onToggle }: VoiceOrbProps) {
  return (
    <button
      onClick={onToggle}
      className="group relative flex h-16 w-16 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={isListening ? "Stop listening" : "Start voice search"}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/30 backdrop-blur-sm"
        animate={{
          scale: isListening ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: isListening ? [0.6, 0.3, 0.6] : 0.15,
        }}
        transition={{
          duration: isListening ? 2 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main orb */}
      <motion.div
        className="absolute inset-1.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20"
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: isListening ? 1.5 : 0.3,
          repeat: isListening ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Inner highlight */}
      <motion.div
        className="absolute inset-3 rounded-full bg-gradient-to-t from-transparent via-amber-200/30 to-white/20"
        animate={{
          opacity: isListening ? [0.4, 0.8, 0.4] : 0.2,
        }}
        transition={{
          duration: isListening ? 1.5 : 0.5,
          repeat: isListening ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Waveform bars */}
      <AnimatePresence>
        {isListening && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="absolute bottom-5 h-3 w-0.5 rounded-full bg-white/70"
                style={{ left: `calc(50% + ${(i - 2) * 5}px)` }}
                animate={{
                  height: [3, 10 + Math.random() * 8, 3],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.6 + i * 0.08,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.div
        className="relative z-10"
        animate={{ scale: isListening ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
      >
        {isListening ? (
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14v1a3 3 0 01-3 3H8a3 3 0 01-3-3v-1m10-4l-4 4m0 0l-4-4m4 4V3" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        )}
      </motion.div>
    </button>
  )
}
