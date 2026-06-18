# Task Plan: Add TanStack Query to Cortex AI Workspace

## Overview

Integrate TanStack Query (React Query) for client-side data fetching, replacing manual state management with `useState`/`useEffect` patterns.

## Steps

### Step 1: Install Dependencies

- Run `npm install @tanstack/react-query @tanstack/react-query-devtools`

### Step 2: Create Query Client Provider

- Create `src/lib/query-client.ts` with QueryClient configuration
- Default options: staleTime 1min, gcTime 5min, refetchOnWindowFocus false, retry 1

### Step 3: Add Provider to Dashboard Layout

- Update `src/app/(dashboard)/layout.tsx`
- Wrap children in QueryClientProvider
- Add ReactQueryDevtools in development mode

### Step 4: Create Custom Hooks

- Create `src/lib/hooks/use-documents.ts` - fetches documents with project filter support
- Create `src/lib/hooks/use-projects.ts` - fetches projects with document counts
- Create `src/lib/hooks/use-search-history.ts` - fetches search history with pagination

### Step 5: Update Components

- Update `src/components/documents/document-list.tsx` to use useDocuments hook
- Update `src/components/projects/project-list.tsx` to use useProjects hook
- Update `src/app/(dashboard)/history/page.tsx` to use useSearchHistory hook

### Step 6: Verify TypeScript

- Run `npx tsc --noEmit` to verify no type errors

## Files to Create/Modify

| File                                         | Action |
| -------------------------------------------- | ------ |
| `src/lib/query-client.ts`                    | Create |
| `src/lib/hooks/use-documents.ts`             | Create |
| `src/lib/hooks/use-projects.ts`              | Create |
| `src/lib/hooks/use-search-history.ts`        | Create |
| `src/app/(dashboard)/layout.tsx`             | Modify |
| `src/components/documents/document-list.tsx` | Modify |
| `src/components/projects/project-list.tsx`   | Modify |
| `src/app/(dashboard)/history/page.tsx`       | Modify |

## Notes

- Existing hooks directory already exists at `src/lib/hooks/`
- Components currently use manual `useState`/`useEffect`/`useCallback` for data fetching
- Will preserve existing functionality (pagination, filtering, optimistic updates)
