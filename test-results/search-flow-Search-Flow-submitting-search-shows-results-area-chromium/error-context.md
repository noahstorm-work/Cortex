# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search-flow.spec.ts >> Search Flow >> submitting search shows results area
- Location: e2e\search-flow.spec.ts:30:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[aria-live="polite"]')
Expected: visible
Error: strict mode violation: locator('[aria-live="polite"]') resolved to 2 elements:
    1) <div class="sr-only" aria-live="polite"></div> aka locator('.space-y-6 > div')
    2) <section tabindex="-1" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Notifications alt+T"></section> aka getByRole('region', { name: 'Notifications alt+T' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[aria-live="polite"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to main content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - complementary [ref=e9]:
      - generic [ref=e10]:
        - link "Cortex" [ref=e11] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e13]
          - generic [ref=e16]: Cortex
        - button "Toggle theme" [ref=e17]:
          - img
          - generic [ref=e18]: Toggle theme
      - navigation [ref=e19]:
        - generic [ref=e20]:
          - paragraph [ref=e21]: Workspace
          - generic [ref=e22]:
            - link "Dashboard" [ref=e23] [cursor=pointer]:
              - /url: /dashboard
              - img [ref=e25]
              - generic [ref=e30]: Dashboard
            - link "Documents" [ref=e31] [cursor=pointer]:
              - /url: /documents
              - img [ref=e33]
              - generic [ref=e36]: Documents
            - link "Search" [ref=e37] [cursor=pointer]:
              - /url: /search
              - img [ref=e39]
              - generic [ref=e42]: Search
        - generic [ref=e45]:
          - paragraph [ref=e46]: More
          - generic [ref=e47]:
            - link "History" [ref=e48] [cursor=pointer]:
              - /url: /history
              - img [ref=e50]
              - generic [ref=e54]: History
            - link "Projects" [ref=e55] [cursor=pointer]:
              - /url: /projects
              - img [ref=e57]
              - generic [ref=e59]: Projects
      - generic [ref=e61]:
        - paragraph [ref=e62]: Account
        - button "Sign out" [ref=e63]:
          - img [ref=e65]
          - text: Sign out
    - main [ref=e68]:
      - generic [ref=e71]:
        - generic [ref=e72]:
          - img [ref=e74]
          - generic [ref=e77]:
            - heading "Semantic Search" [level=1] [ref=e78]
            - paragraph [ref=e79]: Search across your documents using vector similarity.
        - generic [ref=e81]:
          - generic [ref=e82]:
            - img [ref=e83]
            - generic [ref=e86]: Search documents
            - combobox "Search documents" [ref=e87]: test query
          - button [disabled]:
            - img
        - generic [ref=e92]:
          - img [ref=e93]
          - text: Search History
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e118] [cursor=pointer]:
    - img [ref=e119]
  - alert [ref=e122]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Search Flow", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/search")
  6  |     await expect(page.getByRole("heading", { name: /semantic search/i })).toBeVisible()
  7  |   })
  8  | 
  9  |   test("typing in search input enables the search button", async ({ page }) => {
  10 |     const searchInput = page.getByRole("combobox")
  11 |     const searchButton = page.getByRole("button", { name: /search/i }).last()
  12 | 
  13 |     await expect(searchButton).toBeDisabled()
  14 | 
  15 |     await searchInput.fill("machine learning")
  16 |     await expect(searchButton).toBeEnabled()
  17 |   })
  18 | 
  19 |   test("clearing search input disables the search button again", async ({ page }) => {
  20 |     const searchInput = page.getByRole("combobox")
  21 |     const searchButton = page.getByRole("button", { name: /search/i }).last()
  22 | 
  23 |     await searchInput.fill("test")
  24 |     await expect(searchButton).toBeEnabled()
  25 | 
  26 |     await searchInput.fill("")
  27 |     await expect(searchButton).toBeDisabled()
  28 |   })
  29 | 
  30 |   test("submitting search shows results area", async ({ page }) => {
  31 |     const searchInput = page.getByRole("combobox")
  32 |     const searchButton = page.getByRole("button", { name: /search/i }).last()
  33 | 
  34 |     await searchInput.fill("test query")
  35 |     await searchButton.click()
  36 | 
  37 |     const resultsArea = page.locator('[aria-live="polite"]')
> 38 |     await expect(resultsArea).toBeVisible()
     |                               ^ Error: expect(locator).toBeVisible() failed
  39 |   })
  40 | 
  41 |   test("search input has correct placeholder", async ({ page }) => {
  42 |     const searchInput = page.getByRole("combobox")
  43 |     await expect(searchInput).toHaveAttribute("placeholder", /search your documents/i)
  44 |   })
  45 | 
  46 |   test("search input has correct aria attributes for autocomplete", async ({ page }) => {
  47 |     const searchInput = page.getByRole("combobox")
  48 |     await expect(searchInput).toHaveAttribute("aria-autocomplete", "list")
  49 |   })
  50 | 
  51 |   test("search history section is visible below search", async ({ page }) => {
  52 |     const historyHeading = page.getByRole("heading", { name: /recent searches/i })
  53 |     await expect(historyHeading).toBeVisible()
  54 |   })
  55 | 
  56 |   test("search form wraps the input and button", async ({ page }) => {
  57 |     const form = page.locator("form")
  58 |     await expect(form).toBeVisible()
  59 |     await expect(form.locator('[role="combobox"]')).toBeVisible()
  60 |   })
  61 | 
  62 |   test("search button is disabled during searching", async ({ page }) => {
  63 |     const searchInput = page.getByRole("combobox")
  64 |     const searchButton = page.getByRole("button", { name: /search/i }).last()
  65 | 
  66 |     await searchInput.fill("test query")
  67 |     await searchButton.click()
  68 | 
  69 |     await expect(searchButton).toBeDisabled()
  70 |   })
  71 | 
  72 |   test("search page shows description text", async ({ page }) => {
  73 |     await expect(page.getByText(/search across your documents using vector similarity/i)).toBeVisible()
  74 |   })
  75 | 
  76 |   test("search history shows filter controls when history exists", async ({ page }) => {
  77 |     // The filter buttons (All, Today, This Week, Saved) appear when history exists
  78 |     // With empty state, we see the empty message instead
  79 |     const emptyOrFilter = page.getByText(/no searches yet|all/i)
  80 |     await expect(emptyOrFilter.first()).toBeVisible()
  81 |   })
  82 | })
  83 | 
```