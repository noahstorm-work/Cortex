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
      className="relative flex h-16 w-16 items-center justify-center rounded-full focus:outline-none"
      aria-label={isListening ? "Stop listening" : "Start voice search"}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
        animate={{
          scale: isListening ? [1, 1.15, 1] : 1,
          opacity: isListening ? [0.8, 0.4, 0.8] : 0.3,
        }}
        transition={{
          duration: 2,
          repeat: isListening ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isListening ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
      <AnimatePresence>
        {isListening && (
          <>
            <motion.span
              className="absolute -top-1 left-1/2 h-2 w-0.5 -translate-x-1/2 rounded-full bg-white"
              animate={{ height: [2, 12, 2] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="absolute -top-1 left-1/2 h-2 w-0.5 translate-x-2 rounded-full bg-white"
              animate={{ height: [2, 8, 2] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
            />
            <motion.span
              className="absolute -top-1 left-1/2 h-2 w-0.5 -translate-x-2 rounded-full bg-white"
              animate={{ height: [2, 8, 2] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
            />
          </>
        )}
      </AnimatePresence>
      <motion.div
        className="relative z-10 text-white"
        animate={{ scale: isListening ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
      >
        {isListening ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14v1a3 3 0 01-3 3H8a3 3 0 01-3-3v-1m10-4l-4 4m0 0l-4-4m4 4V3" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        )}
      </motion.div>
    </button>
  )
}
