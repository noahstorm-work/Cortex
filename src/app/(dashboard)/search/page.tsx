"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SearchBar } from "@/components/search/search-bar";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Search } from "lucide-react";
import { SearchHistorySkeleton } from "@/components/ui/skeleton";

const SearchHistory = dynamic(
  () => import("@/components/search/search-history").then((mod) => mod.SearchHistory),
  {
    loading: () => <SearchHistorySkeleton />,
  }
);

export default function SearchPage() {
  const [searchTrigger, setSearchTrigger] = useState(0);

  const handleSearchComplete = () => {
    setSearchTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-sm">
          <Search className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-display tracking-tight text-balance">Semantic Search</h1>
          <p className="text-sm text-muted-foreground/70">
            Search across your documents using vector similarity.
          </p>
        </div>
      </div>

      <ErrorBoundary>
        <SearchBar onSearchComplete={handleSearchComplete} />
      </ErrorBoundary>

      <ErrorBoundary>
        <SearchHistory refetchTrigger={searchTrigger} />
      </ErrorBoundary>
    </div>
  );
}
