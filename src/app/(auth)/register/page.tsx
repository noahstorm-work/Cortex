"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Loader2, Waves, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push("/login?registered=true")
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-500/5" />
        <div className="absolute top-1/3 -left-48 h-80 w-80 rounded-full bg-amber-400/10 blur-[128px]" />
        <div className="absolute bottom-1/3 -right-48 h-80 w-80 rounded-full bg-violet-400/8 blur-[128px]" />
      </div>

      <Card className="animate-scale-in w-full max-w-sm border-border/50 bg-background/60 backdrop-blur-xl shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mb-4 mx-auto flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">Create account</CardTitle>
          <CardDescription className="text-sm text-muted-foreground/70">Get started with Cortex Voice</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-foreground/80 tracking-wide uppercase">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-lg border-border bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-foreground/80 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-lg border-border bg-background/50 backdrop-blur-sm pr-10 transition-all duration-200 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                <p className="text-xs font-medium text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground/60">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            <Waves className="h-3 w-3 text-amber-400/50" />
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Cortex Voice</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
