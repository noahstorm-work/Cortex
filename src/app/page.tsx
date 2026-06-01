"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, ArrowRight, Loader2, Waves, FileUp, SearchIcon, Zap } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [demoLoading, setDemoLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push("/dashboard")
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-teal-500/5" />
        <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-teal-400/10 blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-violet-400/8 blur-[128px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="animate-fade-in-up max-w-2xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/5 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
            <span className="text-xs font-medium text-teal-400/80">AI-powered knowledge workspace</span>
          </div>

          {/* Logo */}
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-xl shadow-teal-500/20">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-teal-500">
                <Waves className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Think with
            <span className="block mt-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 bg-clip-text text-transparent">
              Cortex
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-lg mx-auto">
            Upload documents, ask questions, and get instant semantic answers from your personal knowledge base.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              onClick={handleDemoLogin}
              disabled={demoLoading}
              size="lg"
              className="h-12 min-w-[180px] rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {demoLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading demo...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Try Demo</>
              )}
            </Button>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="h-12 min-w-[160px] rounded-xl border-border bg-background/50 backdrop-blur-sm transition-all duration-300 hover:bg-accent/5 hover:border-teal-400/30 hover:shadow-md"
              >
                Sign in <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="ghost"
                size="lg"
                className="h-12 min-w-[160px] rounded-xl text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-muted/30"
              >
                Create account
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: FileUp, label: "Upload documents", desc: "PDF, Word, images" },
              { icon: SearchIcon, label: "Smart search", desc: "Semantic vector search" },
              { icon: Zap, label: "Semantic answers", desc: "AI-powered insights" },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className="group rounded-xl border border-border/50 bg-background/30 backdrop-blur-sm p-4 text-left transition-all duration-300 hover:border-teal-400/20 hover:bg-teal-400/[0.02] hover:shadow-md"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-400/10 group-hover:bg-teal-400/20 transition-colors duration-200">
                    <Icon className="h-4 w-4 text-teal-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
