import { test, expect } from "@playwright/test"

test.describe("Documents Page", () => {
  test("documents page loads with heading", async ({ page }) => {
    await page.goto("/documents")
    await expect(page.getByRole("heading", { name: /documents/i })).toBeVisible()
  })

  test("upload area is visible", async ({ page }) => {
    await page.goto("/documents")
    const uploadArea = page.getByRole("button", { name: /upload documents/i })
    await expect(uploadArea).toBeVisible()
  })

  test("your documents section exists", async ({ page }) => {
    await page.goto("/documents")
    await expect(page.getByRole("heading", { name: /your documents/i })).toBeVisible()
  })
})
