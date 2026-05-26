"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, ArrowRight, Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [demoLoading, setDemoLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push("/documents")
      }
    })
  }, [supabase, router])

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-violet-500/5 px-4">
      <div className="max-w-lg text-center">
        <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-violet-500/10 p-4">
          <Sparkles className="h-10 w-10 text-violet-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Cortex Voice
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Your AI-powered knowledge workspace. Upload documents, ask questions with your voice, and get instant semantic answers from your personal knowledge base.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {demoLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading demo...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Try Demo</>
            )}
          </Button>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="default" size="lg" className="w-full">
              Sign in <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              Create account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
