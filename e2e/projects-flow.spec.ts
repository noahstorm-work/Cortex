import { test, expect } from "@playwright/test"

test.describe("Projects Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects")
    // Wait for the page heading (h1) specifically
    await expect(page.locator("h1")).toContainText("Projects")
  })

  test("projects page loads with heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Projects")
  })

  test("projects page shows description", async ({ page }) => {
    await expect(page.getByText(/organize your documents into projects/i)).toBeVisible()
  })

  test("create project form is visible", async ({ page }) => {
    const formHeading = page.getByRole("heading", { name: /new project/i })
    await expect(formHeading).toBeVisible()

    const nameInput = page.getByLabel(/name/i)
    await expect(nameInput).toBeVisible()

    const createButton = page.getByRole("button", { name: /create project/i })
    await expect(createButton).toBeVisible()
  })

  test("create project button is disabled when name is empty", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /create project/i })
    await expect(createButton).toBeDisabled()
  })

  test("create project button enables when name is entered", async ({ page }) => {
    const nameInput = page.getByLabel(/name/i)
    await nameInput.fill("My Test Project")

    const createButton = page.getByRole("button", { name: /create project/i })
    await expect(createButton).toBeEnabled()
  })

  test("project name input has placeholder", async ({ page }) => {
    const nameInput = page.getByLabel(/name/i)
    await expect(nameInput).toHaveAttribute("placeholder", /my project/i)
  })

  test("project description input is visible", async ({ page }) => {
    const descInput = page.getByLabel(/description/i)
    await expect(descInput).toBeVisible()
  })

  test("project description input has placeholder", async ({ page }) => {
    const descInput = page.getByLabel(/description/i)
    await expect(descInput).toHaveAttribute("placeholder", /what is this for/i)
  })

  test("project list section exists", async ({ page }) => {
    const projectListHeading = page.getByRole("heading", { name: /your projects/i })
    await expect(projectListHeading).toBeVisible()
  })

  test("create project form has both name and description fields", async ({ page }) => {
    const nameInput = page.getByLabel(/name/i)
    const descInput = page.getByLabel(/description/i)
    await expect(nameInput).toBeVisible()
    await expect(descInput).toBeVisible()
  })
})
