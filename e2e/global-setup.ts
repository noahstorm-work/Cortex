import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../.auth/user.json");

setup("authenticate via demo login", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /try demo/i })).toBeVisible();

  // Wait for the API response AND navigation
  const [response] = await Promise.all([
    page.waitForResponse("**/api/auth/demo-login"),
    page.getByRole("button", { name: /try demo/i }).click(),
  ]);

  // Verify the login succeeded
  expect(response.status()).toBe(200);

  // Wait for navigation away from login (router.push happens after fetch)
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 30000,
  });

  await page.waitForLoadState("networkidle");

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
