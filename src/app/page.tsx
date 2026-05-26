"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const router = useRouter()
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    try {
      const res = await fetch("/api/auth/demo-login", { method: "POST" })
      if (res.ok) {
        router.push("/documents")
        router.refresh()
      } else {
        const data = await res.json()
        alert("Demo login failed: " + (data.error || "Unknown error"))
      }
    } catch {
      alert("Demo login failed. Please try again.")
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-5xl">⚡</div>
        <h1 className="text-3xl font-bold text-gray-900">
          AI Knowledge & Automation Workspace
        </h1>
        <p className="mt-3 text-gray-500">
          Upload documents, extract insights, and search with vector-powered
          semantic retrieval.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full sm:w-auto rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {demoLoading ? "Loading demo..." : "Try Demo"}
          </button>
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors text-center"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
