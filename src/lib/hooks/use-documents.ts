"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/lib/types";

export function useDocuments(userId: string | undefined) {
  const supabase = createClient();
  return useQuery<Document[]>({
    queryKey: ["documents", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}
