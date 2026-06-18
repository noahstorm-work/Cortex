"use client";

import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  BookOpen,
  List,
  FileText,
  Sparkles,
  Cpu,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import type { SearchResponse, Project } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { SearchExport } from "./search-export";
import { logger } from "@/lib/logger";
import { fetchUserProjects } from "@/lib/utils/queries";
import { z } from "zod";

function RelevanceBadge({ label }: { label: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-emerald-400/10 text-emerald-500 border-emerald-400/20",
    medium: "bg-teal-400/10 text-teal-500 border-teal-400/20",
    low: "bg-muted text-muted-foreground border-border/50",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles[label]}`}
    >
      {label}
    </span>
  );
}

const searchFormSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(500, "Query must be 500 characters or fewer"),
});

interface SearchBarProps {
  onSearchComplete?: () => void;
}

export function SearchBar({ onSearchComplete }: SearchBarProps = {}) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [expandedRefs, setExpandedRefs] = useState<Set<number>>(new Set());
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      fetchUserProjects(supabase, user.id).then((data) => {
        if (data) setProjects(data);
      });
    });
  }, [supabase]);

  // Autocomplete functionality
  useEffect(() => {
    if (suggestionDebounceTimeout.current) {
      clearTimeout(suggestionDebounceTimeout.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (query.trim().length >= 2) {
      suggestionDebounceTimeout.current = setTimeout(async () => {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setSuggestionLoading(true);
        try {
          const res = await fetch("/api/search-suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: query.trim(),
              limit: 5,
            }),
            signal: controller.signal,
          });

          if (!res.ok) {
            throw new Error("Failed to fetch suggestions");
          }

          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setSelectedSuggestionIndex(-1);
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          logger.error("Autocomplete error", { error: err });
          setSuggestions([]);
        } finally {
          setSuggestionLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    }

    return () => {
      if (suggestionDebounceTimeout.current) {
        clearTimeout(suggestionDebounceTimeout.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  // Handle keydown events for suggestion navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev >= suggestions.length - 1 ? 0 : prev + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          setQuery(suggestions[selectedSuggestionIndex]);
          setSuggestions([]);
          setSelectedSuggestionIndex(-1);
        }
        handleSearch();
        break;
      case "Escape":
        e.preventDefault();
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSearch = async (e: React.FormEvent | null = null) => {
    if (e) {
      e.preventDefault();
    }

    const parsed = searchFormSchema.safeParse({ query: query.trim() });
    if (!parsed.success) {
      setQueryError(parsed.error.issues[0].message);
      return;
    }
    setQueryError(null);

    if (searching) return;

    setSearching(true);
    setError(null);
    setResult(null);
    setExpandedRefs(new Set());

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          project_id: selectedProject || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Search failed");
      }

      const data: SearchResponse = await res.json();
      setResult(data);
      onSearchComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const toggleRef = (i: number) => {
    setExpandedRefs((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40"
            aria-hidden="true"
          />
          <label htmlFor="search-input" className="sr-only">
            Search documents
          </label>
          <Input
            id="search-input"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls="search-suggestions-list"
            aria-activedescendant={
              selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : undefined
            }
            aria-autocomplete="list"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (queryError) setQueryError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search your documents…"
            className="h-11 pl-10 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm text-sm transition-all duration-300 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10 focus:bg-card/80"
          />
          {queryError && (
            <p className="absolute left-0 top-full mt-1 text-xs text-destructive">{queryError}</p>
          )}
          {suggestionLoading && !suggestions.length && (
            <div className="absolute left-0 right-0 bottom-0 h-2 animate-pulse bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 rounded-b-xl"></div>
          )}
          {suggestions.length > 0 && (
            <div
              id="search-suggestions-list"
              role="listbox"
              aria-label="Search suggestions"
              className="absolute left-0 right-0 mt-2 w-full rounded-b-xl bg-card/90 backdrop-blur border border-border/50 z-20 max-h-48 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={selectedSuggestionIndex === index}
                  className={`
                    flex items-center px-4 py-2 text-sm
                    ${
                      selectedSuggestionIndex === index
                        ? "bg-accent/10 text-accent-foreground"
                        : "hover:bg-muted/50 text-muted-foreground"
                    }
                    transition-colors duration-150
                  `}
                  onClick={() => {
                    setQuery(suggestion);
                    setSuggestions([]);
                    setSelectedSuggestionIndex(-1);
                    handleSearch();
                  }}
                >
                  <span className="flex-1">{suggestion}</span>
                  {selectedSuggestionIndex === index && (
                    <ChevronRight className="h-3 w-3 text-accent-foreground" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {projects.length > 0 && (
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="h-11 w-40 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          type="submit"
          disabled={searching || !query.trim()}
          className="h-11 px-6 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      <div aria-live="polite" className="sr-only">
        {result ? `Found ${result.references.length} sources` : error || ""}
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {result.processing_documents && (
            <div className="rounded-2xl border border-teal-400/20 bg-teal-400/5 p-4 text-sm text-teal-600 dark:text-teal-400">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse-glow" />
                Some documents are still being processed. Results may be incomplete.
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/20 to-teal-600/20">
                <BookOpen className="h-3.5 w-3.5 text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              {result.ai_generated && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-teal-400/20 bg-teal-400/5 px-2 py-0.5 text-[10px] font-medium text-teal-500">
                  <Cpu className="h-3 w-3" />
                  AI generated
                </span>
              )}
              <SearchExport results={result} />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground/90">{result.summary}</p>
          </div>

          {/* Key Points */}
          {result.key_points.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/20 to-teal-600/20">
                  <List className="h-3.5 w-3.5 text-teal-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Key Points</h3>
              </div>
              <ul className="space-y-2">
                {result.key_points.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground/90">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400/60" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {result.references.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/20 to-teal-600/20">
                  <FileText className="h-3.5 w-3.5 text-teal-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Sources ({result.references.length})
                </h3>
                {result.total_chunks && (
                  <span className="text-[11px] text-muted-foreground/60 ml-auto">
                    {result.total_chunks} chunk{result.total_chunks !== 1 ? "s" : ""} matched
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {result.references.map((ref, i) => (
                  <div key={i}>
                    <button
                      onClick={() => toggleRef(i)}
                      className="w-full text-left border-l-2 border-teal-400/20 pl-4 py-2 transition-all duration-200 hover:border-teal-400/40 rounded-r-xl hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground truncate">
                          {ref.document_title}
                        </p>
                        <RelevanceBadge label={ref.relevance} />
                        {expandedRefs.has(i) ? (
                          <ChevronUp className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground/70 line-clamp-2">
                        {ref.excerpt}
                      </p>
                    </button>
                    {expandedRefs.has(i) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 ml-6 rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground/90 leading-relaxed"
                      >
                        {ref.content}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
