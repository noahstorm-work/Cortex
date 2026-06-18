# Search Autocomplete Implementation Plan

## Goal

Add search autocomplete/suggestions to enhance user experience by providing real-time query suggestions as users type in the search bar.

## Scope

- Backend API endpoint for search suggestions
- Frontend integration in SearchBar component
- Debounced API calls to prevent excessive requests
- Visual indication of loading state
- Keyboard navigation for suggestions
- Maximum 5 suggestions shown
- Suggestions based on popular/recent searches and partial matches in document titles/content

## Implementation Details

### 1. Backend API (`src/app/api/search-suggestions/route.ts`)

```
POST /api/search-suggestions
- Rate limited (SEARCH_RATE_LIMIT or custom)
- Requires authentication
- Accepts: { query: string, limit?: number, project_id?: string }
- Returns: { suggestions: string[] }
- Logic:
  * If query length < 2, return []
  * Get recent searches matching query prefix (from search_history)
  * Get popular searches (frequency-based)
  * Get document title matches (from documents table)
  * Combine, deduplicate, rank by relevance/frequency
  * Return top N suggestions
```

### 2. Frontend Integration

#### SearchBar component modifications:

- Add state: `suggestions: string[]`, `suggestionLoading: boolean`, `selectedSuggestionIndex: number`
- On input change (debounced 300ms):
  - If query length >= 2, call `/api/search-suggestions`
  - Update suggestions state
  - Reset selectedSuggestionIndex
- Keyboard navigation:
  - ArrowDown: increase selectedSuggestionIndex
  - ArrowUp: decrease selectedSuggestionIndex
  - Enter: set query to selected suggestion, trigger search
  - Escape: clear suggestions
- UI:
  - Dropdown menu below input when suggestions exist
  - Highlighted selected suggestion
  * Loading indicator while fetching
  * Click on suggestion to select and search

### 3. Database Considerations

- Ensure search_history table has index on (user_id, query) for prefix matching
- Consider adding search_count column to search_history for popularity ranking
- Optional: Create materialized view or summary table for popular searches

### 4. Styling

- Use existing component styling patterns
- Dropdown: absolute positioned, z-index, border, background
- Suggestion items: hover state, selected state
- Loading: spinner or skeleton

### 5. Testing

- Unit test API endpoint
- Integration test SearchBar with mock API
- Manual testing of keyboard navigation
- Edge cases: empty query, special characters, rate limiting

### 6. Files to Create/Modify

- NEW: `src/app/api/search-suggestions/route.ts`
- MODIFY: `src/components/search/search-bar.tsx`
- OPTIONAL: `src/lib/search/suggestions.ts` (helper functions)

## Dependencies

- Uses existing `@/lib/supabase/auth-helper` for auth
- Uses existing `@/lib/rate-limit` for rate limiting
- Uses existing search infrastructure

## Security

- Same authentication requirements as search endpoint
- Rate limiting to prevent abuse
- Input validation/sanitization
- User-scoped suggestions (only see own/searchable searches)

## Performance

- Debounced API calls (300ms)
- Limit suggestions to 5 items
- Database indexes for efficient prefix matching
- Cache recent popular searches if needed

## Future Enhancements

- Show document titles in suggestions with snippet
- Personalized suggestions based on user's document collection
- Trending searches (global, not just user-specific)
- Query correction ("did you mean?")

## Estimated Effort

- Backend: 2-3 hours
- Frontend: 3-4 hours
- Testing: 1-2 hours
- Total: 6-9 hours
