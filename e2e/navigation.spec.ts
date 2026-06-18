import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("sidebar navigation links are visible", async ({ page }) => {
    await page.goto("/login");

    // Check that nav items exist in the sidebar
    const dashboardLink = page.getByRole("link", { name: /dashboard/i });
    await expect(dashboardLink).toBeVisible();
  });

  test("mobile menu toggle works", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");

    // Mobile menu button should be visible
    const menuButton = page.getByRole("button", { name: /open navigation/i });
    await expect(menuButton).toBeVisible();
  });
});
