"use client"

import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SearchResponse } from "@/lib/types"

interface VoiceResponseProps {
  result: SearchResponse | null
  loading: boolean
}

export function VoiceResponse({ result, loading }: VoiceResponseProps) {
  if (!result && !loading) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-6 shadow-sm"
    >
      {loading ? (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Searching your knowledge base...
        </div>
      ) : (
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Answer</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{result?.summary}</p>
            </div>

            {result?.key_points && result.key_points.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Key Points</h3>
                <ul className="space-y-2">
                  {result.key_points.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result?.references && result.references.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Sources ({result.references.length})
                </h3>
                <div className="space-y-3">
                  {result.references.map((ref, i) => (
                    <div key={i} className="border-l-2 border-primary/20 pl-3">
                      <p className="text-xs font-medium text-foreground">
                        {ref.document_title}
                        <span className="ml-2 text-muted-foreground">
                          (score: {ref.score})
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                        {ref.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </motion.div>
  )
}
