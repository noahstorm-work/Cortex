"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  description: z.string().max(500, "Description must be 500 characters or fewer").optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function CreateProjectForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormValues, string>>>({});
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = projectFormSchema.safeParse({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProjectFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ProjectFormValues;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setCreating(true);
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to create project" }));
        throw new Error(data.error || "Failed to create project");
      }

      toast.success("Project created");
      setName("");
      setDescription("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

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
            <label
              htmlFor="project-name"
              className="text-xs font-medium text-foreground/80 tracking-wide uppercase"
            >
              Name
            </label>
            <Input
              id="project-name"
              type="text"
              placeholder="My project…"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "project-name-error" : undefined}
              className="h-10 rounded-lg border-border bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/10"
            />
            {errors.name && (
              <p id="project-name-error" className="text-xs text-destructive">
                {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="project-desc"
              className="text-xs font-medium text-foreground/80 tracking-wide uppercase"
            >
              Description
            </label>
            <Input
              id="project-desc"
              type="text"
              placeholder="What is this for?…"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "project-desc-error" : undefined}
              className="h-10 rounded-lg border-border bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/10"
            />
            {errors.description && (
              <p id="project-desc-error" className="text-xs text-destructive">
                {errors.description}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={creating || !name.trim()}
            aria-busy={creating}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Create project
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
