import type { SupabaseClient } from "@supabase/supabase-js"
import type { Project } from "@/lib/types"

export async function fetchUserProjects(
  supabase: SupabaseClient,
  userId: string
): Promise<Project[]> {
  const { data } = await supabase
    .from("projects")
    .select("id, name, description, user_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return (data || []) as Project[]
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "ready":
      return "bg-emerald-400/10 text-emerald-500 border border-emerald-400/20"
    case "processing":
      return "bg-teal-400/10 text-teal-500 border border-teal-400/20"
    case "failed":
      return "bg-destructive/10 text-destructive border border-destructive/20"
    default:
      return "bg-muted text-muted-foreground border border-border/50"
  }
}
