import { CreateProjectForm } from "@/components/projects/create-project-form"
import { ProjectList } from "@/components/projects/project-list"

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organize your documents into projects.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CreateProjectForm />
        </div>
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Your projects</h2>
          <ProjectList />
        </div>
      </div>
    </div>
  )
}
