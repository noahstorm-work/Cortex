"use client"

import { useState } from "react"
import { Copy, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SearchResponse } from "@/lib/types"

interface SearchExportProps {
  results: SearchResponse
}

export function SearchExport({ results }: SearchExportProps) {
  const [copied, setCopied] = useState(false)

  const jsonData = JSON.stringify(results, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cortex-search-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDownload}>
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  )
}
