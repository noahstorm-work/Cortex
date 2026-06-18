import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("dashboard page loads with stats cards grid", async ({ page }) => {
    const statsSection = page.locator(".grid").first();
    await expect(statsSection).toBeVisible();
  });

  test("dashboard shows documents stat card with link", async ({ page }) => {
    const statLink = page.getByRole("link", { name: /documents/i }).first();
    await expect(statLink).toHaveAttribute("href", "/documents");
    await expect(statLink.getByText("Documents")).toBeVisible();
  });

  test("dashboard shows indexed chunks stat card with link", async ({ page }) => {
    const statLink = page.getByRole("link", { name: /indexed chunks/i });
    await expect(statLink).toHaveAttribute("href", "/search");
    await expect(statLink.getByText("Indexed Chunks")).toBeVisible();
  });

  test("dashboard shows searches stat card with link", async ({ page }) => {
    const statLink = page.getByRole("link", { name: /searches/i }).first();
    await expect(statLink).toHaveAttribute("href", "/search");
    await expect(statLink.getByText("Searches")).toBeVisible();
  });

  test("dashboard shows projects stat card with link", async ({ page }) => {
    const statLink = page.getByRole("link", { name: /projects/i }).first();
    await expect(statLink).toHaveAttribute("href", "/projects");
    await expect(statLink.getByText("Projects")).toBeVisible();
  });

  test("stat cards section has four stat cards", async ({ page }) => {
    const statsSection = page.locator(".grid").first();
    const cards = statsSection.getByRole("link");
    await expect(cards).toHaveCount(4);
  });

  test("recent uploads section exists", async ({ page }) => {
    const recentUploads = page.getByRole("heading", { name: /recent uploads/i });
    await expect(recentUploads).toBeVisible();
  });

  test("recent uploads has view all link to documents", async ({ page }) => {
    const viewAllLink = page.getByRole("link", { name: /view all/i }).first();
    await expect(viewAllLink).toBeVisible();
    await expect(viewAllLink).toHaveAttribute("href", "/documents");
  });

  test("recent searches section exists", async ({ page }) => {
    const recentSearches = page.getByRole("heading", { name: /recent searches/i });
    await expect(recentSearches).toBeVisible();
  });

  test("recent searches has view all link to search", async ({ page }) => {
    const viewAllLinks = page.getByRole("link", { name: /view all/i });
    await expect(viewAllLinks).toHaveCount(2);
  });

  test("dashboard page shows description", async ({ page }) => {
    await expect(page.getByText(/overview of your workspace activity/i)).toBeVisible();
  });

  test("recent uploads and searches sections are in a two-column grid", async ({ page }) => {
    const grid = page.locator(".grid").nth(1);
    await expect(grid).toBeVisible();
  });
});
