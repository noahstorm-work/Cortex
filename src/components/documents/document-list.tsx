"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileCode,
  ExternalLink,
  Trash2,
  Loader2,
  Inbox,
} from "lucide-react";
import { DocumentListSkeleton } from "@/components/ui/skeleton";
import type { Document, Project } from "@/lib/types";
import { fetchUserProjects, getStatusBadgeClass } from "@/lib/utils/queries";

const DocumentPreview = dynamic(
  () => import("@/components/ui/document-preview").then((mod) => mod.DocumentPreview),
  {
    loading: () => null,
  }
);

function getFileIcon(title: string) {
  const ext = title.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
      return FileImage;
    case "csv":
    case "xlsx":
      return FileSpreadsheet;
    case "json":
    case "xml":
    case "yaml":
    case "yml":
      return FileCode;
    default:
      return FileText;
  }
}

export function DocumentList() {
  const [filterProject, setFilterProject] = useState("");
  const [page, setPage] = useState(0);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Get user ID on mount
  useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      return user;
    },
  });

  // Fetch documents
  const { data: documentsData, isLoading: loading } = useQuery({
    queryKey: ["documents", userId, filterProject, page],
    queryFn: async () => {
      const [pResult, dResult] = await Promise.all([
        fetchUserProjects(supabase, userId!),
        (() => {
          let q = supabase
            .from("documents")
            .select("*")
            .eq("user_id", userId!)
            .order("created_at", { ascending: false });
          if (filterProject === "unassigned") {
            q = q.is("project_id", null);
          } else if (filterProject) {
            q = q.eq("project_id", filterProject);
          }
          return q.range(page * 20, (page + 1) * 20 - 1);
        })(),
      ]);

      const pData = pResult as Project[] | null;
      const projectMap = new Map((pData || []).map((p) => [p.id, p.name]));

      const documents = (dResult.data || []).map((d: Document) => ({
        ...d,
        project_name: d.project_id ? projectMap.get(d.project_id) : undefined,
      }));

      return {
        documents,
        projects: pData || [],
        hasMore: (dResult.data?.length ?? 0) === 20,
      };
    },
    enabled: !!userId,
  });

  const documents = documentsData?.documents || [];
  const projects = documentsData?.projects || [];
  const hasMore = documentsData?.hasMore || false;

  // Auto-refresh for processing documents
  const hasProcessing = documents.some((d) => d.status === "pending" || d.status === "processing");

  useQuery({
    queryKey: ["documents-refresh", userId, filterProject, page],
    queryFn: async () => {
      // Trigger refetch of documents
      await queryClient.invalidateQueries({ queryKey: ["documents", userId, filterProject, page] });
      return null;
    },
    enabled: hasProcessing,
    refetchInterval: 3000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      await fetch("/api/documents/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: docId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", userId, filterProject, page] });
    },
  });

  return (
    <div className="space-y-4">
      {projects.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filter:</span>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger
              className="w-48 glass rounded-xl"
              aria-label="Filter documents by project"
            >
              <SelectValue placeholder="All documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All documents</SelectItem>
              <SelectItem value="unassigned">No project</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <DocumentListSkeleton />
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 p-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/10 to-teal-600/10">
            <Inbox className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-foreground">No documents yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a document above to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc, i) => (
            <div
              key={doc.id}
              className={`group flex items-center justify-between rounded-2xl border border-border/50 bg-card/50 px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-teal-400/20 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
              onClick={() => {
                setPreviewDoc(doc);
                setPreviewOpen(true);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPreviewDoc(doc);
                  setPreviewOpen(true);
                }
              }}
              aria-label={`Preview ${doc.title}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/10 to-teal-600/10 group-hover:from-teal-400/20 group-hover:to-teal-600/20 transition-all duration-300">
                  {(() => {
                    const Icon = getFileIcon(doc.title);
                    return (
                      <Icon className="h-4 w-4 text-teal-400/70 group-hover:text-teal-400 transition-colors duration-300" />
                    );
                  })()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${getStatusBadgeClass(doc.status)}`}
                    >
                      {doc.status === "processing" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                      )}
                      {doc.status === "pending"
                        ? "Pending"
                        : doc.status === "processing"
                          ? "Processing"
                          : doc.status === "ready"
                            ? "Ready"
                            : "Failed"}
                    </span>
                    {doc.project_name && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] rounded-full border border-border/50"
                      >
                        {doc.project_name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-4">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${doc.title}`}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-400/40"
                      disabled={deleteMutation.isPending && deleteMutation.variables === doc.id}
                      aria-label={`Delete ${doc.title}`}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-strong rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{doc.title}"? This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(doc.id)}
                        className="rounded-xl bg-gradient-to-r from-destructive to-destructive/80"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
      {hasMore && (
        <Button
          variant="outline"
          className="w-full mt-4 rounded-xl glass"
          onClick={() => setPage((p) => p + 1)}
        >
          Load more
        </Button>
      )}

      <DocumentPreview document={previewDoc} open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
}
