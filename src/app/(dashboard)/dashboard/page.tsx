import { createServerSupabaseClient } from "@/lib/supabase/server"
import { LayoutDashboard, FileText, Cpu, Search, History, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function getDashboardData(userId: string) {
  const supabase = await createServerSupabaseClient()

  const [docResult, chunkResult, searchResult, recentDocs, recentSearches] = await Promise.all([
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("chunks").select("id", { count: "exact", head: true })
      .in("document_id", (await supabase.from("documents").select("id").eq("user_id", userId)).data?.map(d => d.id) || []),
    supabase.from("search_history").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("documents").select("id, title, status, created_at").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(5),
    supabase.from("search_history").select("id, query, created_at").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(5),
  ])

  return {
    totalDocuments: docResult.count || 0,
    totalChunks: chunkResult.count || 0,
    totalSearches: searchResult.count || 0,
    recentDocuments: (recentDocs.data || []) as { id: string; title: string; status: string; created_at: string }[],
    recentSearches: (recentSearches.data || []) as { id: string; query: string; created_at: string }[],
  }
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const data = await getDashboardData(user.id)

  const stats = [
    {
      label: "Documents", value: data.totalDocuments, icon: FileText, href: "/documents",
      gradient: "from-teal-400/20 via-teal-500/10 to-transparent",
      iconBg: "from-teal-400 to-teal-600",
      accent: "text-teal-400"
    },
    {
      label: "Indexed Chunks", value: data.totalChunks, icon: Cpu, href: "/search",
      gradient: "from-violet-400/20 via-violet-500/10 to-transparent",
      iconBg: "from-violet-400 to-violet-600",
      accent: "text-violet-400"
    },
    {
      label: "Searches", value: data.totalSearches, icon: Search, href: "/search",
      gradient: "from-emerald-400/20 via-emerald-500/10 to-transparent",
      iconBg: "from-emerald-400 to-emerald-600",
      accent: "text-emerald-400"
    },
    {
      label: "Projects", value: "—", icon: LayoutDashboard, href: "/projects",
      gradient: "from-blue-400/20 via-blue-500/10 to-transparent",
      iconBg: "from-blue-400 to-blue-600",
      accent: "text-blue-400"
    },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-2xl font-display tracking-tight">Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground/70 ml-[2.75rem]">
          Overview of your workspace activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in-up stagger-${i + 1}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="absolute -inset-[100%] bg-gradient-to-br from-transparent via-transparent to-white/5 dark:to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rotate-45" />

              <div className="relative z-10">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.iconBg} shadow-lg ${stat.accent.replace("text-", "shadow-")}/20`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground font-display">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">{stat.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm animate-fade-in-up stagger-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/20 to-teal-600/20">
                <FileText className="h-3.5 w-3.5 text-teal-400" />
              </div>
              Recent Uploads
            </h2>
            <Link href="/documents" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
              View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          {data.recentDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 py-8 text-center">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {data.recentDocuments.map((doc) => (
                <div key={doc.id} className="group flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2.5 transition-all duration-300 hover:bg-muted/50">
                  <span className="text-sm text-foreground/90 truncate">{doc.title}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    doc.status === "ready" ? "bg-emerald-400/10 text-emerald-500 border border-emerald-400/20" :
                    doc.status === "processing" ? "bg-teal-400/10 text-teal-500 border border-teal-400/20" :
                    doc.status === "failed" ? "bg-destructive/10 text-destructive border border-destructive/20" :
                    "bg-muted text-muted-foreground border border-border/50"
                  }`}>{doc.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm animate-fade-in-up stagger-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/20 to-teal-600/20">
                <History className="h-3.5 w-3.5 text-teal-400" />
              </div>
              Recent Searches
            </h2>
            <Link href="/search" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
              View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          {data.recentSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 py-8 text-center">No searches yet.</p>
          ) : (
            <div className="space-y-2">
              {data.recentSearches.map((s) => (
                <div key={s.id} className="group flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-2.5 transition-all duration-300 hover:bg-muted/50">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted/50">
                    <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground/90 truncate flex-1">{s.query}</span>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
