# AGENTS.md — Cortex

## Commands

| Task          | Command                                         |
| ------------- | ----------------------------------------------- |
| Dev server    | `npm run dev` (uses `--webpack`, not Turbopack) |
| Build         | `npm run build`                                 |
| Lint          | `npm run lint`                                  |
| Tests         | `npm run test` (vitest, single run)             |
| Tests (watch) | `npm run test:watch`                            |

**Order matters**: `npm run lint && npm run build` is the minimum before committing. TypeScript strict mode is on — `npm run build` catches type errors.

**Known issue**: ESLint has a pre-existing `hermes-parser` module resolution error (`Cannot find module '../traverse/getVisitorKeys'`). This is a transitive dependency issue in `eslint-plugin-react-hooks`, not caused by app code. Lint may hang or fail; build + typecheck via `npm run build` is the reliable gate.

## Architecture

```
Next.js 16 (App Router) → Supabase (PostgreSQL + pgvector + Storage) → OpenAI (embeddings + summarization)
                         ↳ OCR Pipeline: pdfjs-dist → sharp → tesseract.js
```

- **Single package** — no monorepo, no workspaces. Root `package.json` only.
- **Deployed on Vercel** — serverless. Body limit 4.5 MB → uploads use signed URLs (client PUTs directly to Supabase Storage).
- **Middleware** (`src/middleware.ts`) refreshes Supabase sessions for non-API routes. API routes handle auth themselves via `requireAuth()`.

## Path Alias

`@/*` maps to `./src/*`. Use it everywhere. Example: `import { requireAuth } from "@/lib/supabase/auth-helper"`.

## Supabase Client Types

Three distinct clients in `src/lib/supabase/`:

| Client  | File        | Key                             | RLS              | Use                           |
| ------- | ----------- | ------------------------------- | ---------------- | ----------------------------- |
| Browser | `client.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Respects RLS     | Client components             |
| Server  | `server.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Respects RLS     | Server components, middleware |
| Admin   | `admin.ts`  | `SUPABASE_SERVICE_ROLE_KEY`     | **Bypasses RLS** | Storage ops, batch inserts    |

**Critical**: `createAdminClient()` bypasses all RLS. Only use it for operations that genuinely need cross-user access (storage download, batch chunk inserts). Never use it for user-facing reads/writes.

## API Route Conventions

All routes in `src/app/api/`:

1. **Auth**: 7/9 routes use `requireAuth()` helper. Returns `401` if no session.
2. **Validation**: All inputs validated with Zod schemas from `src/lib/validation/schemas.ts`.
3. **Rate limiting**: IP-based via `src/lib/rate-limit.ts`. Auth: 5/15min, Search: 20/min, General: 60/min.
4. **Error messages**: Never leak internal details. Return generic messages; log specifics server-side.
5. **JSON parsing**: Wrap `request.json()` in try/catch — malformed bodies return `400`.

## Upload Flow (Signed URL)

```
1. POST /api/documents/upload → returns signedUrl + token
2. Client PUTs file directly to Supabase Storage (bypasses Vercel 4.5 MB limit)
3. POST /api/documents/process → server downloads via admin client, OCRs, chunks, embeds
```

Storage paths follow `{user_id}/{uuid}.{ext}` format. Storage RLS enforces user isolation.

## Tests

- **Framework**: Vitest with `jsdom` environment
- **Setup file**: `src/test/setup.ts` (imports `@testing-library/jest-dom`)
- **Test location**: `src/lib/**/__tests__/*.test.ts` (co-located with source)
- **Globals**: `describe`, `it`, `expect` are global — no imports needed
- **Run single file**: `npx vitest run src/lib/chunking/__tests__/chunking.test.ts`

## Environment Variables

`.env.local` (gitignored) with `.env.local.example` as template:

| Variable                        | Required | Notes                                  |
| ------------------------------- | -------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Public — exposed to browser            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Public — exposed to browser            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | **Secret** — server only, bypasses RLS |
| `OPENAI_API_KEY`                | No       | Enables AI embeddings + summarization  |
| `DEMO_LOGIN_EMAIL`              | No       | Defaults to `test@cortex.app`          |
| `DEMO_LOGIN_PASSWORD`           | No       | Required for demo login to work        |

**Security**: Never log or expose `SUPABASE_SERVICE_ROLE_KEY`. It was previously leaked in git history (commit `e88f315`) — that key must be rotated.

## Database

7 migrations in `supabase/migrations/` (apply in order):

- `00001_schema.sql` — documents, chunks (VECTOR(1536)), RLS policies, match_chunks RPC, storage policies
- `00002_projects.sql` — projects table + RLS
- `00003_search_history.sql` — search_history + RLS
- `00004_processing_status.sql` — document status enum (pending/processing/ready/failed)
- `00005_semantic_schema.sql` — upgrades embedding dim 384→1536, recreates ivfflat index
- `00006_search_history_saved.sql` — adds `saved` boolean for bookmarked searches
- `00007_storage_rls_user_isolation.sql` — fixes storage bucket policies to enforce user-id path isolation

## Key Gotchas

- **pdfjs-dist is v3 (legacy CJS)** — v4/v5 ESM builds fail in Node.js without native `canvas`. Don't upgrade without testing.
- **`serverExternalPackages`** in `next.config.ts` must include `pdf-parse`, `sharp`, `tesseract.js`, `pdfjs-dist`. These run in Node.js and cannot be bundled.
- **Sharp can't parse PDFs** — it renders SVGs to PNG. The OCR pipeline uses pdfjs-dist for text extraction first, falls back to SVG→sharp→tesseract for scanned docs.
- **Embeddings fallback** — when `OPENAI_API_KEY` is unset, hash-based pseudo-embeddings are used. Search still works but quality degrades.
- **Demo login** requires `DEMO_LOGIN_PASSWORD` env var. If unset, the endpoint returns `500`.
- **Dev uses webpack** (`next dev --webpack`), not Turbopack, for compatibility with `serverExternalPackages`.

## Security

- CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy all configured in `next.config.ts`.
- All API inputs validated with Zod before processing.
- ILIKE patterns in fallback search escape `%` and `_` characters via `escapeLike()` in `src/lib/search/bm25.ts`.
- CSRF: API routes set `SameSite=Strict` via middleware.
