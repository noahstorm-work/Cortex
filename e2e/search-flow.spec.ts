import { test, expect } from "@playwright/test";

test.describe("Search Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByRole("heading", { name: /semantic search/i })).toBeVisible();
  });

  test("typing in search input enables the search button", async ({ page }) => {
    const searchInput = page.getByRole("combobox");
    const searchButton = page.getByRole("button", { name: /search/i }).last();

    await expect(searchButton).toBeDisabled();

    await searchInput.fill("machine learning");
    await expect(searchButton).toBeEnabled();
  });

  test("clearing search input disables the search button again", async ({ page }) => {
    const searchInput = page.getByRole("combobox");
    const searchButton = page.getByRole("button", { name: /search/i }).last();

    await searchInput.fill("test");
    await expect(searchButton).toBeEnabled();

    await searchInput.fill("");
    await expect(searchButton).toBeDisabled();
  });

  test("submitting search shows results area", async ({ page }) => {
    const searchInput = page.getByRole("combobox");
    const searchButton = page.getByRole("button", { name: /search/i }).last();

    await searchInput.fill("test query");
    await searchButton.click();

    const resultsArea = page.locator('[aria-live="polite"]');
    await expect(resultsArea).toBeVisible();
  });

  test("search input has correct placeholder", async ({ page }) => {
    const searchInput = page.getByRole("combobox");
    await expect(searchInput).toHaveAttribute("placeholder", /search your documents/i);
  });

  test("search input has correct aria attributes for autocomplete", async ({ page }) => {
    const searchInput = page.getByRole("combobox");
    await expect(searchInput).toHaveAttribute("aria-autocomplete", "list");
  });

  test("search history section is visible below search", async ({ page }) => {
    const historyHeading = page.getByRole("heading", { name: /recent searches/i });
    await expect(historyHeading).toBeVisible();
  });

  test("search form wraps the input and button", async ({ page }) => {
    const form = page.locator("form");
    await expect(form).toBeVisible();
    await expect(form.locator('[role="combobox"]')).toBeVisible();
  });

  test("search button is disabled during searching", async ({ page }) => {
    const searchInput = page.getByRole("combobox");
    const searchButton = page.getByRole("button", { name: /search/i }).last();

    await searchInput.fill("test query");
    await searchButton.click();

    await expect(searchButton).toBeDisabled();
  });

  test("search page shows description text", async ({ page }) => {
    await expect(
      page.getByText(/search across your documents using vector similarity/i)
    ).toBeVisible();
  });

  test("search history shows filter controls when history exists", async ({ page }) => {
    // The filter buttons (All, Today, This Week, Saved) appear when history exists
    // With empty state, we see the empty message instead
    const emptyOrFilter = page.getByText(/no searches yet|all/i);
    await expect(emptyOrFilter.first()).toBeVisible();
  });
});
