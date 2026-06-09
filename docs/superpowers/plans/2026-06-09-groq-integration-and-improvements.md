# Groq Integration & UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace OpenAI with Groq for faster, cheaper embeddings and summarization, plus add UX improvements (dark mode consistency, document preview, search export, rate limit tuning).

**Architecture:** Groq provides an OpenAI-compatible API at `https://api.groq.com/openai/v1`. We'll use `nomic-embed-text-v1.5` (1536-dim) for embeddings and `llama-3.3-70b-versatile` for chat completions (summarization). Same direct `fetch()` pattern, just different base URL + model names. No npm SDK needed.

**Tech Stack:** Groq API (OpenAI-compatible), `nomic-embed-text-v1.5` (embeddings), `llama-3.3-70b-versatile` (chat), existing Zod validation, existing vitest setup.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/lib/embeddings/openai.ts` → `src/lib/embeddings/groq.ts` | Groq embedding client (rename + rewrite) |
| `src/lib/embeddings/index.ts` | Update imports from `./openai` → `./groq` |
| `src/lib/search/summarize.ts` | Update to use Groq chat completions |
| `.env.local.example` | Add `GROQ_API_KEY`, remove `OPENAI_API_KEY` |
| `.env.local` | User adds `GROQ_API_KEY` (manual) |
| `src/app/api/search/route.ts` | Minor: add rate limit config |
| `src/components/search/search-bar.tsx` | Add search export button |
| `src/components/ui/document-preview.tsx` | New: inline document preview modal |
| `src/app/(dashboard)/documents/page.tsx` | Integrate document preview |
| `src/app/(dashboard)/search/page.tsx` | Integrate search export |
| `src/lib/validation/schemas.ts` | No changes needed |

---

## Chunk 1: Groq Integration (Core)

### Task 1: Create Groq Embedding Client

**Files:**
- Create: `src/lib/embeddings/groq.ts`
- Delete: `src/lib/embeddings/openai.ts`
- Modify: `src/lib/embeddings/index.ts`

- [ ] **Step 1: Create `src/lib/embeddings/groq.ts`**

```typescript
const GROQ_BASE_URL = "https://api.groq.com/openai/v1"
const GROQ_EMBEDDING_MODEL = "nomic-embed-text-v1.5"
const GROQ_EMBEDDING_DIMENSIONS = 1536

export function getGroqKey(): string | null {
  return process.env.GROQ_API_KEY || null
}

export async function generateGroqEmbedding(text: string): Promise<number[]> {
  const key = getGroqKey()
  if (!key) throw new Error("GROQ_API_KEY not configured")

  const res = await fetch(`${GROQ_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_EMBEDDING_MODEL,
      input: text,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Groq embedding failed (${res.status}): ${body}`)
  }

  const json = await res.json()
  return json.data[0].embedding
}

export async function generateGroqEmbeddings(texts: string[]): Promise<number[][]> {
  const key = getGroqKey()
  if (!key) throw new Error("GROQ_API_KEY not configured")

  const res = await fetch(`${GROQ_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_EMBEDDING_MODEL,
      input: texts,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Groq embeddings failed (${res.status}): ${body}`)
  }

  const json = await res.json()
  return json.data
    .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
    .map((item: { embedding: number[] }) => item.embedding)
}
```

- [ ] **Step 2: Update `src/lib/embeddings/index.ts`**

Change imports from `./openai` to `./groq`:
- Line 1: `import { generateGroqEmbedding, generateGroqEmbeddings, getGroqKey } from "./groq"`
- Line 43-44: `isEmbedderFallback()` → checks `!getGroqKey()`
- Line 47-48: `generateEmbedding()` → calls `generateGroqEmbedding` if key exists
- Line 54-55: `generateEmbeddings()` → calls `generateGroqEmbeddings` if key exists

- [ ] **Step 3: Delete `src/lib/embeddings/openai.ts`**

- [ ] **Step 4: Run existing embedding tests**

Run: `npx vitest run src/lib/embeddings`
Expected: PASS (hash fallback tests still work)

- [ ] **Step 5: Commit**

```bash
git add src/lib/embeddings/
git commit -m "feat: replace OpenAI with Groq for embeddings"
```

---

### Task 2: Update Summarization to Use Groq

**Files:**
- Modify: `src/lib/search/summarize.ts`

- [ ] **Step 1: Update `src/lib/search/summarize.ts`**

Replace OpenAI chat completions with Groq:
- Line 1: `import { getGroqKey } from "@/lib/embeddings/groq"` (was `getOpenAIKey`)
- Line 9: `if (!getGroqKey()) return null`
- Line 43-58: Change URL from `https://api.openai.com/v1/chat/completions` to `https://api.groq.com/openai/v1/chat/completions`
- Line 50: Change model from `gpt-4o-mini` to `llama-3.3-70b-versatile`
- Headers: `Authorization: Bearer ${getGroqKey()}`

- [ ] **Step 2: Run summarize tests**

Run: `npx vitest run src/lib/search/__tests__/summarize`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/search/summarize.ts
git commit -m "feat: use Groq llama-3.3-70b for summarization"
```

---

### Task 3: Update Environment Variables

**Files:**
- Modify: `.env.local.example`
- Modify: `.env.local` (add GROQ_API_KEY placeholder)

- [ ] **Step 1: Update `.env.local.example`**

Replace line 7 (`# OPENAI_API_KEY=sk-...`) with:
```
# Required for real AI embeddings and AI-powered summaries
# Get one at https://console.groq.com/keys
GROQ_API_KEY=gsk_...
```

- [ ] **Step 2: Add `GROQ_API_KEY` to `.env.local`**

Add the key (user must provide).

- [ ] **Step 3: Commit**

```bash
git add .env.local.example
git commit -m "chore: update env example for Groq API key"
```

---

### Task 4: Update Embedding Tests

**Files:**
- Modify: `src/lib/embeddings/__tests__/embeddings.test.ts`

- [ ] **Step 1: Update test imports**

If tests reference OpenAI directly, update to reference Groq (but hash fallback tests should still work unchanged).

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/embeddings/__tests__/
git commit -m "test: update embedding tests for Groq"
```

---

## Chunk 2: UX Improvements

### Task 5: Search Export (JSON + Clipboard)

**Files:**
- Create: `src/components/search/search-export.tsx`
- Modify: `src/app/(dashboard)/search/page.tsx`

- [ ] **Step 1: Create `src/components/search/search-export.tsx`**

A button component that exports search results as JSON or copies to clipboard:
```tsx
"use client"
import { useState } from "react"
import { Copy, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SearchResponse } from "@/lib/types"

interface SearchExportProps {
  results: SearchResponse
}

export function SearchExport({ results }: SearchExportProps) {
  const [copied, setCopied] = useState(false)

  const jsonData = JSON.stringify(results, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cortex-search-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDownload}>
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Integrate into search results page**

Add `<SearchExport results={results} />` next to the summary section when results are displayed.

- [ ] **Step 3: Commit**

```bash
git add src/components/search/search-export.tsx src/app/\(dashboard\)/search/page.tsx
git commit -m "feat: add search results export (JSON copy/download)"
```

---

### Task 6: Document Preview Modal

**Files:**
- Create: `src/components/ui/document-preview.tsx`
- Modify: `src/app/(dashboard)/documents/page.tsx`

- [ ] **Step 1: Create `src/components/ui/document-preview.tsx`**

A modal that shows document details (title, type, created date, chunk count, project) with a link to open the file:
```tsx
"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, Calendar, Layers } from "lucide-react"
import type { Document } from "@/lib/types"

interface DocumentPreviewProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentPreview({ document, open, onOpenChange }: DocumentPreviewProps) {
  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-500" />
            {document.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{document.file_type}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(document.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>{document.status}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open File
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Integrate into documents page**

Add click handler on document items to open preview modal. Add `<DocumentPreview />` component.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/document-preview.tsx src/app/\(dashboard\)/documents/page.tsx
git commit -m "feat: add document preview modal"
```

---

### Task 7: Rate Limit Config Improvements

**Files:**
- Modify: `src/lib/rate-limit.ts`

- [ ] **Step 1: Add search-specific rate limit for AI summaries**

Add a new config `SUMMARY_RATE_LIMIT` (10/min) to prevent abuse of Groq summarization:
```typescript
export const SUMMARY_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 10,
}
```

- [ ] **Step 2: Apply to search route**

Import and use `SUMMARY_RATE_LIMIT` in `src/app/api/search/route.ts` before calling `buildResponse()`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/rate-limit.ts src/app/api/search/route.ts
git commit -m "feat: add summary rate limit to prevent Groq API abuse"
```

---

### Task 8: Dark Mode Consistency

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Verify dark mode tokens are consistent**

Check that all pages use `bg-background`, `text-foreground`, `text-muted-foreground` consistently. Fix any hardcoded colors.

- [ ] **Step 2: Test dark mode toggle**

Ensure `next-themes` toggle works on all pages (dashboard, documents, search, history, projects).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "fix: ensure dark mode color consistency across pages"
```

---

## Chunk 3: Verification

### Task 9: Build & Test Verification

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Manual smoke test**

1. Start dev server: `npm run dev`
2. Login with demo credentials
3. Upload a document → verify processing works
4. Search for something → verify embeddings + summary work
5. Check dark mode toggle
6. Test document preview modal
7. Test search export

- [ ] **Step 5: Push to remote**

```bash
git push origin main
```

- [ ] **Step 6: Verify Vercel deployment**

Check `cortex-ai-workspace.vercel.app` deploys successfully.

---

## Summary of Changes

| Area | What Changes | Impact |
|------|--------------|--------|
| **Embeddings** | OpenAI `text-embedding-3-small` → Groq `nomic-embed-text-v1.5` | Same 1536-dim vectors, faster inference, free tier |
| **Summarization** | OpenAI `gpt-4o-mini` → Groq `llama-3.3-70b-versatile` | Faster summaries, free tier |
| **Env vars** | `OPENAI_API_KEY` → `GROQ_API_KEY` | User gets key from console.groq.com |
| **Search export** | New JSON copy/download button | Users can save search results |
| **Document preview** | New modal with file details | Better document management UX |
| **Rate limiting** | New `SUMMARY_RATE_LIMIT` (10/min) | Prevents Groq API abuse |
| **Dark mode** | Color token consistency fixes | Polished dark mode experience |

## Groq Free Tier Limits

- **Embeddings**: 30 RPM, 500K TPM (developer plan)
- **Chat**: 30 RPM, 131K context window
- **Cost**: Free for moderate usage, $0.59/$0.79 per 1M tokens (llama-3.3-70b) for production

## Key Decisions

1. **No npm SDK** — Direct `fetch()` like the existing OpenAI code. Keeps bundle small.
2. **`nomic-embed-text-v1.5`** — Groq's embedding model produces 1536-dim vectors (matches existing DB schema).
3. **`llama-3.3-70b-versatile`** — Best balance of speed + quality for summarization on Groq.
4. **Rate limit on summaries** — Free tier is 30 RPM; we limit to 10/min to leave headroom.
5. **Export as JSON** — Simple, useful for researchers/power users. Can add CSV/markdown later.
