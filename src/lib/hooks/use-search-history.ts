"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { SearchHistoryItem } from "@/lib/types";

export function useSearchHistory(userId: string | undefined) {
  const supabase = createClient();
  return useQuery<SearchHistoryItem[]>({
    queryKey: ["search-history", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("search_history")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}
