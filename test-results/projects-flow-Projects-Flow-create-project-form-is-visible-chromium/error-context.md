# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects-flow.spec.ts >> Projects Flow >> create project form is visible
- Location: e2e\projects-flow.spec.ts:18:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /new project/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /new project/i })

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- complementary:
  - link "Cortex":
    - /url: /dashboard
  - button "Toggle theme"
  - navigation:
    - paragraph: Workspace
    - link "Dashboard":
      - /url: /dashboard
    - link "Documents":
      - /url: /documents
    - link "Search":
      - /url: /search
    - paragraph: More
    - link "History":
      - /url: /history
    - link "Projects":
      - /url: /projects
  - paragraph: Account
  - button "Sign out"
- main:
  - heading "Projects" [level=1]
  - paragraph: Organize your documents into projects.
  - text: New project Name
  - textbox "Name":
    - /placeholder: My project…
  - text: Description
  - textbox "Description":
    - /placeholder: What is this for?…
  - button "Create project" [disabled]
  - heading "Your projects" [level=2]
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Projects Flow", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/projects")
  6  |     // Wait for the page heading (h1) specifically
  7  |     await expect(page.locator("h1")).toContainText("Projects")
  8  |   })
  9  | 
  10 |   test("projects page loads with heading", async ({ page }) => {
  11 |     await expect(page.locator("h1")).toContainText("Projects")
  12 |   })
  13 | 
  14 |   test("projects page shows description", async ({ page }) => {
  15 |     await expect(page.getByText(/organize your documents into projects/i)).toBeVisible()
  16 |   })
  17 | 
  18 |   test("create project form is visible", async ({ page }) => {
  19 |     const formHeading = page.getByRole("heading", { name: /new project/i })
> 20 |     await expect(formHeading).toBeVisible()
     |                               ^ Error: expect(locator).toBeVisible() failed
  21 | 
  22 |     const nameInput = page.getByLabel(/name/i)
  23 |     await expect(nameInput).toBeVisible()
  24 | 
  25 |     const createButton = page.getByRole("button", { name: /create project/i })
  26 |     await expect(createButton).toBeVisible()
  27 |   })
  28 | 
  29 |   test("create project button is disabled when name is empty", async ({ page }) => {
  30 |     const createButton = page.getByRole("button", { name: /create project/i })
  31 |     await expect(createButton).toBeDisabled()
  32 |   })
  33 | 
  34 |   test("create project button enables when name is entered", async ({ page }) => {
  35 |     const nameInput = page.getByLabel(/name/i)
  36 |     await nameInput.fill("My Test Project")
  37 | 
  38 |     const createButton = page.getByRole("button", { name: /create project/i })
  39 |     await expect(createButton).toBeEnabled()
  40 |   })
  41 | 
  42 |   test("project name input has placeholder", async ({ page }) => {
  43 |     const nameInput = page.getByLabel(/name/i)
  44 |     await expect(nameInput).toHaveAttribute("placeholder", /my project/i)
  45 |   })
  46 | 
  47 |   test("project description input is visible", async ({ page }) => {
  48 |     const descInput = page.getByLabel(/description/i)
  49 |     await expect(descInput).toBeVisible()
  50 |   })
  51 | 
  52 |   test("project description input has placeholder", async ({ page }) => {
  53 |     const descInput = page.getByLabel(/description/i)
  54 |     await expect(descInput).toHaveAttribute("placeholder", /what is this for/i)
  55 |   })
  56 | 
  57 |   test("project list section exists", async ({ page }) => {
  58 |     const projectListHeading = page.getByRole("heading", { name: /your projects/i })
  59 |     await expect(projectListHeading).toBeVisible()
  60 |   })
  61 | 
  62 |   test("create project form has both name and description fields", async ({ page }) => {
  63 |     const nameInput = page.getByLabel(/name/i)
  64 |     const descInput = page.getByLabel(/description/i)
  65 |     await expect(nameInput).toBeVisible()
  66 |     await expect(descInput).toBeVisible()
  67 |   })
  68 | })
  69 | 
```