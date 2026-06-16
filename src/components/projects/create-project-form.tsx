"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"

export function CreateProjectForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setCreating(true)
    await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    })

    setName("")
    setDescription("")
    setCreating(false)
    router.refresh()
  }

  return (
    <Card className="border border-border/50 bg-card/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/20 to-teal-600/20">
            <Plus className="h-3.5 w-3.5 text-teal-400" />
          </div>
          New project
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="project-name" className="text-xs font-medium text-foreground/80 tracking-wide uppercase">
              Name
            </label>
            <Input
              id="project-name"
              type="text"
              placeholder="My project…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10 rounded-lg border-border bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/10"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="project-desc" className="text-xs font-medium text-foreground/80 tracking-wide uppercase">
              Description
            </label>
            <Input
              id="project-desc"
              type="text"
              placeholder="What is this for?…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 rounded-lg border-border bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/10"
            />
          </div>
          <Button
            type="submit"
            disabled={creating || !name.trim()}
            aria-busy={creating}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            {creating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
            ) : (
              <><Plus className="mr-2 h-4 w-4" /> Create project</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
