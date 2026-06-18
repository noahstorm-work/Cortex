import { test, expect } from "@playwright/test"

test.describe("Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/documents")
    await expect(page.getByRole("heading", { name: /^documents$/i })).toBeVisible()
  })

  test("clicking upload area opens file picker", async ({ page }) => {
    const uploadArea = page.getByRole("button", { name: /upload documents/i })
    await expect(uploadArea).toBeVisible()

    const fileChooserPromise = page.waitForEvent("filechooser")
    await uploadArea.click()
    const fileChooser = await fileChooserPromise
    await expect(fileChooser).toBeDefined()
  })

  test("upload area shows accepted file types hint", async ({ page }) => {
    await expect(page.getByText(/pdf, txt, md, csv, docx, png, jpg, webp/i)).toBeVisible()
  })

  test("upload area shows drag and drop instructions", async ({ page }) => {
    await expect(page.getByText(/drop files here or click to browse/i)).toBeVisible()
  })

  test("file list appears after selecting a single file", async ({ page }) => {
    const uploadArea = page.getByRole("button", { name: /upload documents/i })

    const fileChooserPromise = page.waitForEvent("filechooser")
    await uploadArea.click()
    const fileChooser = await fileChooserPromise

    await fileChooser.setFiles({
      name: "test-document.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("test content"),
    })

    await expect(page.getByText("test-document.pdf")).toBeVisible()
  })

  test("file list shows multiple selected files", async ({ page }) => {
    const uploadArea = page.getByRole("button", { name: /upload documents/i })

    const fileChooserPromise = page.waitForEvent("filechooser")
    await uploadArea.click()
    const fileChooser = await fileChooserPromise

    await fileChooser.setFiles([
      {
        name: "report.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("content 1"),
      },
      {
        name: "notes.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("content 2"),
      },
    ])

    await expect(page.getByText("report.pdf")).toBeVisible()
    await expect(page.getByText("notes.txt")).toBeVisible()
  })

  test("upload button shows file count for single file", async ({ page }) => {
    const uploadArea = page.getByRole("button", { name: /upload documents/i })

    const fileChooserPromise = page.waitForEvent("filechooser")
    await uploadArea.click()
    const fileChooser = await fileChooserPromise

    await fileChooser.setFiles({
      name: "single.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("content"),
    })

    const uploadButton = page.getByRole("button", { name: /upload 1 file/i })
    await expect(uploadButton).toBeVisible()
  })

  test("upload button shows correct count for multiple files", async ({ page }) => {
    const uploadArea = page.getByRole("button", { name: /upload documents/i })

    const fileChooserPromise = page.waitForEvent("filechooser")
    await uploadArea.click()
    const fileChooser = await fileChooserPromise

    await fileChooser.setFiles([
      {
        name: "file1.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("content 1"),
      },
      {
        name: "file2.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("content 2"),
      },
    ])

    const uploadButton = page.getByRole("button", { name: /upload 2 files/i })
    await expect(uploadButton).toBeVisible()
  })

  test("file can be removed from the list before upload", async ({ page }) => {
    const uploadArea = page.getByRole("button", { name: /upload documents/i })

    const fileChooserPromise = page.waitForEvent("filechooser")
    await uploadArea.click()
    const fileChooser = await fileChooserPromise

    await fileChooser.setFiles({
      name: "removable.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("content"),
    })

    await expect(page.getByText("removable.pdf")).toBeVisible()

    const removeButton = page.getByRole("button", { name: /remove removable/i })
    await removeButton.click()

    await expect(page.getByText("removable.pdf")).not.toBeVisible()
  })

  test("your documents section exists", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /your documents/i })).toBeVisible()
  })

  test("documents page shows supported formats badge", async ({ page }) => {
    await expect(page.getByText(/supports pdf, word, images/i)).toBeVisible()
  })
})
