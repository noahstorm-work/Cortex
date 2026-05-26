import { UploadArea } from "@/components/documents/upload-area"
import { DocumentList } from "@/components/documents/document-list"

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload and manage your documents for semantic search.
        </p>
      </div>

      <UploadArea />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Your documents
        </h2>
        <DocumentList />
      </div>
    </div>
  )
}
