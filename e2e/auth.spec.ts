import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("h1")).toBeVisible()
  })

  test("demo login button is visible", async ({ page }) => {
    await page.goto("/login")
    const demoButton = page.getByRole("button", { name: /demo/i })
    await expect(demoButton).toBeVisible()
  })

  test("register page loads", async ({ page }) => {
    await page.goto("/register")
    await expect(page.locator("h1")).toBeVisible()
  })
})
