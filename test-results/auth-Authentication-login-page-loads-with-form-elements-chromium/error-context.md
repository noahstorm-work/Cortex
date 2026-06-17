# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> login page loads with form elements
- Location: e2e\auth.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('text=Welcome back')
Expected: visible
Received: undefined

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Welcome back')

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Authentication", () => {
  4  |   test("login page loads with form elements", async ({ page }) => {
  5  |     await page.goto("/login")
  6  | 
> 7  |     await expect(page.locator("text=Welcome back")).toBeVisible()
     |                                                     ^ Error: expect(locator).toBeVisible() failed
  8  |     await expect(page.locator("text=Sign in to your workspace")).toBeVisible()
  9  |     await expect(page.locator("#email")).toBeVisible()
  10 |     await expect(page.locator("#password")).toBeVisible()
  11 |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  12 |     await expect(page.locator("text=Try Demo")).toBeVisible()
  13 |   })
  14 | 
  15 |   test("demo login button is clickable", async ({ page }) => {
  16 |     await page.goto("/login")
  17 | 
  18 |     const demoButton = page.locator("text=Try Demo")
  19 |     await expect(demoButton).toBeVisible()
  20 |     await expect(demoButton).toBeEnabled()
  21 |   })
  22 | 
  23 |   test("login form validates required fields", async ({ page }) => {
  24 |     await page.goto("/login")
  25 | 
  26 |     const submitButton = page.locator('button[type="submit"]')
  27 |     await submitButton.click()
  28 | 
  29 |     const emailInput = page.locator("#email")
  30 |     await expect(emailInput).toHaveAttribute("required", "")
  31 |   })
  32 | 
  33 |   test("password visibility toggle works", async ({ page }) => {
  34 |     await page.goto("/login")
  35 | 
  36 |     const passwordInput = page.locator("#password")
  37 |     await expect(passwordInput).toHaveAttribute("type", "password")
  38 | 
  39 |     const toggleButton = page.locator("#password ~ button")
  40 |     await toggleButton.click()
  41 |     await expect(passwordInput).toHaveAttribute("type", "text")
  42 | 
  43 |     await toggleButton.click()
  44 |     await expect(passwordInput).toHaveAttribute("type", "password")
  45 |   })
  46 | 
  47 |   test("register link is present", async ({ page }) => {
  48 |     await page.goto("/login")
  49 | 
  50 |     const registerLink = page.locator("text=Create one")
  51 |     await expect(registerLink).toBeVisible()
  52 |     await expect(registerLink).toHaveAttribute("href", "/register")
  53 |   })
  54 | })
  55 | 
```