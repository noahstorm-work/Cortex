/**
 * Zod validation schemas for all API route inputs.
 *
 * Centralizes input validation across the application. Every API route should
 * validate request bodies against the appropriate schema before processing.
 *
 * @example
 * ```ts
 * import { uploadSchema } from "@/lib/validation/schemas"
 *
 * const body = await request.json()
 * const parsed = uploadSchema.safeParse(body)
 * if (!parsed.success) {
 *   return Response.json({ error: "Invalid input" }, { status: 400 })
 * }
 * // parsed.data is fully typed and validated
 * ```
 */
import { z } from "zod";

/**
 * Validates a file name string.
 *
 * Rules:
 * - 1–255 characters
 * - Must have a whitelisted extension: `.pdf`, `.docx`, `.doc`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
 * - No extension is also allowed (e.g. directory names)
 */
export const fileNameSchema = z
  .string()
  .min(1)
  .max(255)
  .refine((name) => {
    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".doc",
      ".txt",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
    ];
    const ext = name.toLowerCase().match(/\.[^.]+$/)?.[0];
    return ext ? allowedExtensions.includes(ext) : true;
  }, "File type not allowed");

/**
 * Optional file type / MIME type string.
 * Max 100 characters. Used to store the client-reported content type.
 */
export const fileTypeSchema = z.string().max(100).optional();

/**
 * Validates file size in bytes.
 * Must be a positive integer, max 50 MB.
 */
export const fileSizeSchema = z
  .number()
  .int()
  .positive()
  .max(50 * 1024 * 1024);

/**
 * Schema for `POST /api/documents/upload` request body.
 *
 * Fields:
 * - `fileName` — validated file name with allowed extension
 * - `fileType` — optional MIME type
 * - `fileSize` — file size in bytes (max 50 MB)
 * - `projectId` — optional UUID to assign the document to a project
 */
export const uploadSchema = z.object({
  fileName: fileNameSchema,
  fileType: fileTypeSchema,
  fileSize: fileSizeSchema,
  projectId: z.string().uuid().optional(),
});

/**
 * Schema for `POST /api/documents/process` request body.
 *
 * Fields:
 * - `document_id` — UUID of the document to process
 * - `file_url` — Supabase Storage URL of the uploaded file (max 2048 chars)
 */
export const processSchema = z.object({
  document_id: z.string().uuid(),
  file_url: z.string().url().max(2048),
});

/**
 * Schema for `DELETE /api/documents` request body.
 *
 * Fields:
 * - `document_id` — UUID of the document to delete
 */
export const deleteSchema = z.object({
  document_id: z.string().uuid(),
});

/**
 * Schema for `POST /api/search` request body.
 *
 * Fields:
 * - `query` — search query string (2–500 characters)
 * - `project_id` — optional UUID to scope search to a specific project
 */
export const searchSchema = z.object({
  query: z.string().min(2).max(500),
  project_id: z.string().uuid().optional(),
});

/**
 * Schema for creating a search history entry.
 *
 * Fields:
 * - `query` — the search query (1–500 characters)
 * - `result_summary` — optional short summary of results (max 500 chars)
 * - `source_count` — optional count of sources found (0–1000)
 */
export const searchHistoryCreateSchema = z.object({
  query: z.string().min(1).max(500),
  result_summary: z.string().max(500).optional(),
  source_count: z.number().int().min(0).max(1000).optional(),
});

/**
 * Schema for creating a new project.
 *
 * Fields:
 * - `name` — project name (1–100 characters)
 * - `description` — optional description (max 1000 characters)
 */
export const projectCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

/**
 * Schema for deleting a project.
 *
 * Fields:
 * - `project_id` — UUID of the project to delete
 */
export const projectDeleteSchema = z.object({
  project_id: z.string().uuid(),
});

/**
 * Schema for assigning or unassigning a document to/from a project.
 *
 * Fields:
 * - `document_id` — UUID of the document
 * - `project_id` — UUID of the project, or `null` to unassign
 */
export const assignDocumentSchema = z.object({
  document_id: z.string().uuid(),
  project_id: z.string().uuid().nullable().optional(),
});

/**
 * Schema for `GET /api/search/suggestions` query parameters.
 *
 * Fields:
 * - `query` — partial search query (2–500 characters)
 * - `limit` — max suggestions to return (1–20, default 5)
 */
export const searchSuggestionsSchema = z.object({
  query: z.string().min(2).max(500),
  limit: z.number().int().min(1).max(20).optional().default(5),
});
