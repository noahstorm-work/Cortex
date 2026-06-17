import { test, expect } from "@playwright/test"

test.describe("Search Page", () => {
  test("search page loads with heading", async ({ page }) => {
    await page.goto("/search")
    await expect(page.getByRole("heading", { name: /semantic search/i })).toBeVisible()
  })

  test("search input is visible", async ({ page }) => {
    await page.goto("/search")
    const searchInput = page.getByRole("combobox")
    await expect(searchInput).toBeVisible()
  })

  test("search button is disabled when input is empty", async ({ page }) => {
    await page.goto("/search")
    const searchButton = page.getByRole("button", { name: /search/i })
    await expect(searchButton).toBeDisabled()
  })
})
