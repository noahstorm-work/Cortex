import { createServerSupabaseClient } from "@/lib/supabase/server"
import { LayoutDashboard, FileText, Cpu, Search, History, ArrowRight } from "lucide-react"
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
    { label: "Documents", value: data.totalDocuments, icon: FileText, href: "/documents", color: "from-amber-400 to-amber-600" },
    { label: "Indexed Chunks", value: data.totalChunks, icon: Cpu, href: "/search", color: "from-violet-400 to-violet-600" },
    { label: "Searches", value: data.totalSearches, icon: Search, href: "/search", color: "from-emerald-400 to-emerald-600" },
    { label: "Projects", value: "—", icon: LayoutDashboard, href: "/projects", color: "from-blue-400 to-blue-600" },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Overview of your workspace activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-amber-400/20"
            >
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-sm`}>
                <Icon className="h-4.5 w-4.5 text-white" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-400" />
              Recent Uploads
            </h2>
            <Link href="/documents" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.recentDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 py-8 text-center">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {data.recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-sm text-foreground truncate">{doc.title}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    doc.status === "ready" ? "bg-emerald-400/10 text-emerald-500" :
                    doc.status === "processing" ? "bg-amber-400/10 text-amber-500" :
                    doc.status === "failed" ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>{doc.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-amber-400" />
              Recent Searches
            </h2>
            <Link href="/search" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.recentSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 py-8 text-center">No searches yet.</p>
          ) : (
            <div className="space-y-2">
              {data.recentSearches.map((s) => (
                <div key={s.id} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                  <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground truncate">{s.query}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/60 shrink-0">
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
