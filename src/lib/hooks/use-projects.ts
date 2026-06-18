"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

export function useProjects(userId: string | undefined) {
  const supabase = createClient();
  return useQuery<Project[]>({
    queryKey: ["projects", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}
