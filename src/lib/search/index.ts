/**
 * Search module barrel export.
 *
 * Provides vector-based semantic search over document chunks stored in Supabase.
 * Falls back to text-based ILIKE search when vector search returns no results.
 *
 * @example
 * ```ts
 * import { search, buildResponse } from "@/lib/search"
 *
 * const results = await search("machine learning", userId, { project_id: "..." })
 * const response = await buildResponse("machine learning", results)
 * ```
 */
export { vectorSearch as search } from "./bm25"
export { buildResponse } from "./response"
export type { ScoredChunk, SearchOptions } from "./bm25"
