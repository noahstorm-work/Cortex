import { SearchBar } from "@/components/search/search-bar"

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Semantic Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search across your documents using vector similarity.
        </p>
      </div>

      <SearchBar />
    </div>
  )
}
