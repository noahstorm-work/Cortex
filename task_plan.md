# Task Plan: Accessibility, Tests, Performance

## Goal
Complete a comprehensive accessibility audit, improve test coverage, and run a performance audit on the Cortex AI Workspace app.

## Current Phase
Phase 1

## Phases

### Phase 1: Accessibility Deep Audit
- [ ] Audit all pages for keyboard traps and focus management
- [ ] Check screen reader support (ARIA labels, live regions, landmarks)
- [ ] Verify modal/dialog focus trapping
- [ ] Test color contrast and visual indicators
- **Status:** in_progress

### Phase 2: Test Coverage
- [ ] Fix Next.js App Router vitest issue for API routes
- [ ] Add API route handler tests
- [ ] Add upload flow integration tests
- [ ] Verify all tests pass
- **Status:** pending

### Phase 3: Performance Audit
- [ ] Run Lighthouse audit
- [ ] Analyze client bundle sizes
- [ ] Add dynamic imports for heavy components
- [ ] Verify build passes
- **Status:** pending

### Phase 4: Final Verification & Push
- [ ] Run full test suite
- [ ] TypeScript check
- [ ] Commit and push all changes
- **Status:** pending

## Key Questions
1. Are there any keyboard traps in modals or dropdowns?
2. Which components need dynamic imports?
3. What's the current Lighthouse score?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use planning-with-files pattern | Large multi-step task benefits from structured tracking |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       |         |            |

## Notes
- Update phase status as you progress
- Log ALL errors
- Never repeat a failed action
