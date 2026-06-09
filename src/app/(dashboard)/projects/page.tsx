import type { Metadata } from "next"
import { FolderKanban } from "lucide-react"
import { CreateProjectForm } from "@/components/projects/create-project-form"
import { ProjectList } from "@/components/projects/project-list"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export const metadata: Metadata = {
  title: "Projects",
}

export default function ProjectsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-sm">
          <FolderKanban className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-display tracking-tight text-balance">Projects</h1>
          <p className="text-sm text-muted-foreground/70">
            Organize your documents into projects.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ErrorBoundary>
            <CreateProjectForm />
          </ErrorBoundary>
        </div>
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground/80 tracking-wide uppercase">
              Your projects
            </h2>
          </div>
          <ErrorBoundary>
            <ProjectList />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
