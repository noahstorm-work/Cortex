import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Document } from "@/lib/types"

export async function DocumentList() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  if (!documents || documents.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500">
        No documents yet. Upload your first file above.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc: Document) => (
        <div
          key={doc.id}
          className="flex items-center justify-between rounded-lg bg-white px-5 py-3 shadow-sm ring-1 ring-gray-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {doc.file_type === "application/pdf" ? "📕" : "📄"}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">{doc.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(doc.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View file
          </a>
        </div>
      ))}
    </div>
  )
}
