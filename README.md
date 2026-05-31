# Cortex — AI Knowledge Workspace

Upload, process, and semantically search your documents with AI-powered answers.

## Architecture

```
Client → Next.js (Vercel) → Supabase (DB + Storage) → OpenAI (embeddings + summarization)
                                ↓
                           OCR Pipeline: pdfjs-dist → sharp → tesseract.js
```

**Key constraints:**
- Vercel Hobby: 4.5 MB serverless body limit → uploads bypass via signed URL
- Supabase Storage is private → admin client `download()` instead of `fetch()`
- Sharp lacks PDF support → pdfjs-dist + SVG→PNG→Tesseract pipeline

## Features

- **Semantic search** — OpenAI `text-embedding-3-small` (1536‑dim) with hash fallback
- **AI responses** — `gpt-4o-mini` summarization with key points and citations
- **Multi‑format OCR** — PDF (text + scanned), DOCX, TXT, MD, CSV, PNG, JPG, WEBP
- **Processing pipeline** — real‑time status polling, batch embeddings, retry logic
- **Dashboard** — workspace stats, recent uploads, search activity
- **Search history** — saved/bookmarked searches, clear history
- **Projects** — folder-based document organisation
- **Dark/light mode** — system-aware with manual override
- **Toast notifications** — upload success/error feedback

## Design System — Noir Intelligence

Dark academic elegance meets modern AI sophistication.

| Element | Choice |
|---------|--------|
| **Display font** | DM Serif Display — serif for authority |
| **Body font** | DM Sans — geometric sans for readability |
| **Mono font** | JetBrains Mono |
| **Dark bg** | Warm charcoal (`hsl(240, 4%, 6%)`) |
| **Light bg** | Warm off-white (`hsl(40, 20%, 95%)`) |
| **Accent** | Amber (#f59e0b) — warmth and focus |
| **Glass** | `backdrop-blur(16px)` with semi-transparent bg |
| **Noise** | Subtle SVG grain overlay via `.noise` class |
| **Radius** | `0.75rem` base, `rounded-2xl` on premium surfaces |
| **Motion** | `cubic-bezier(0.16, 1, 0.3, 1)` — energetic ease-out |

## Tech Stack

| Layer | Stack |
|-------|-------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | Supabase SSR (cookie-based) |
| Database | Supabase PostgreSQL + pgvector |
| Storage | Supabase Storage (private bucket) |
| AI | OpenAI (embeddings + chat) |
| OCR | pdfjs-dist + sharp + tesseract.js |
| UI | Tailwind CSS, Radix UI, framer-motion, Lucide |
| Notifications | sonner |
| Language | TypeScript (strict) |

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project with the migrations in `supabase/migrations/` applied
- (Optional) OpenAI API key for AI-powered features

### Setup

```bash
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, and service role key
# Optionally add OPENAI_API_KEY

npm install
npm run dev
```

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Admin client (bypasses RLS) |
| `OPENAI_API_KEY` | No | Embeddings + AI summarisation |

### Database Migrations

```bash
# Apply migrations in order via Supabase CLI or SQL editor
supabase/migrations/00001_*.sql
supabase/migrations/00002_*.sql
...
supabase/migrations/00006_search_history_saved.sql
```

Key migrations:
- `00005_semantic_schema.sql` — VECTOR(384)→VECTOR(1536), `match_chunks` RPC, ivfflat index
- `00006_search_history_saved.sql` — adds `saved` column for bookmarked searches

## Key Design Decisions

- **Signed URL upload** — client PUTs file directly to Supabase Storage, bypassing Vercel's 4.5 MB body limit
- **pdfjs-dist v3 (legacy CJS)** — v4/v5 ESM builds fail in Node.js without native `canvas` package
- **SVG→PNG→Tesseract** — Sharp cannot parse PDFs but renders SVGs; OCR fallback for scanned documents
- **Batch embeddings** — OpenAI called in batches of 20 for efficiency
- **Extractive fallback** — TF-IDF scoring when OpenAI unavailable (no API key or rate-limited)

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/documents/upload` | POST | Create document record + return signed upload URL |
| `/api/documents/process` | POST | OCR, chunk, embed document |
| `/api/documents/delete` | POST | Delete document + storage file + chunks |
| `/api/search` | POST | Semantic search with AI summary |
| `/api/search-history` | GET/POST/DELETE | Search history CRUD |
| `/api/projects/create` | POST | Create project folder |
| `/api/projects/delete` | POST | Delete project |
| `/api/projects/assign-document` | POST | Assign document to project |
| `/api/auth/demo-login` | POST | Demo authentication |

## OCR Pipeline

```
Text PDF  ─→ pdfjs-dist getTextContent() ─→ text chunks
Scanned PDF ─→ pdfjs-dist SVGGraphics + jsdom → sharp SVG→PNG → tesseract.js OCR → text
```

Each document is split into ~512‑char chunks, embedded, and stored in pgvector.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/dashboard/   — Workspace stats & activity
│   ├── api/                     — All API routes
│   ├── documents/               — Document management page
│   ├── history/                 — Search history page
│   ├── projects/                — Projects page
│   ├── search/                  — Search page
│   ├── globals.css              — Styles & animations
│   └── layout.tsx              — Root layout
├── components/
│   ├── documents/              — Document list & upload
│   ├── layout/                 — Sidebar
│   ├── search/                 — Search bar & results
│   └── ui/                     — shadcn-style primitives
├── lib/
│   ├── embeddings/             — OpenAI + hash vector generation
│   ├── ocr/                    — PDF text extraction & OCR pipeline
│   ├── search/                 — Search + AI summarisation
│   └── supabase/               — Server & client clients
└── types/                      — TypeScript interfaces
```

## Building

```bash
npm run build
# Output: .next/ (optimised production build)
```

## Deployment

Deploy on [Vercel](https://vercel.com):

```bash
npm i -g vercel
vercel --prod
```

**Important:** Ensure `serverExternalPackages` in `next.config.ts` includes:
- `pdf-parse`, `sharp`, `tesseract.js`, `pdfjs-dist`, `jsdom`

These packages must run in Node.js and cannot be bundled by Turbopack/Webpack.
