import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { PageTransition } from "@/components/ui/page-transition"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: {
    template: "%s — Cortex",
    default: "Cortex",
  },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-teal-500/[0.02]" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-teal-400/[0.03] blur-[128px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-violet-400/[0.02] blur-[128px]" />
      </div>

      <Sidebar />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-8">
          <ErrorBoundary>
            <PageTransition>
              {children}
            </PageTransition>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
