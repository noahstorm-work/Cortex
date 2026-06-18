import { useMemo } from "react";

export type FilterMode = "all" | "today" | "week" | "saved";

interface FilterableItem {
  created_at: string;
  saved?: boolean;
  query: string;
}

export function useSearchHistoryFilter<T extends FilterableItem>(
  items: T[],
  filter: FilterMode,
  searchQuery: string
): T[] {
  return useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    return items.filter((item) => {
      if (searchQuery && !item.query.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      if (filter === "all") return true;
      if (filter === "saved") return item.saved;
      const d = new Date(item.created_at);
      if (filter === "today") return d >= todayStart;
      if (filter === "week") return d >= weekStart;
      return true;
    });
  }, [items, filter, searchQuery]);
}
