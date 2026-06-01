import { z } from "zod"

export const fileNameSchema = z.string().min(1).max(255)
  .refine((name) => {
    const allowedExtensions = [".pdf", ".docx", ".doc", ".txt", ".png", ".jpg", ".jpeg", ".gif", ".webp"]
    const ext = name.toLowerCase().match(/\.[^.]+$/)?.[0]
    return ext ? allowedExtensions.includes(ext) : true
  }, "File type not allowed")

export const fileTypeSchema = z.string().max(100).optional()

export const fileSizeSchema = z.number().int().positive().max(50 * 1024 * 1024)

export const uploadSchema = z.object({
  fileName: fileNameSchema,
  fileType: fileTypeSchema,
  fileSize: fileSizeSchema,
  projectId: z.string().uuid().optional(),
})

export const processSchema = z.object({
  document_id: z.string().uuid(),
  file_url: z.string().url().max(2048),
})

export const deleteSchema = z.object({
  document_id: z.string().uuid(),
})

export const searchSchema = z.object({
  query: z.string().min(2).max(500),
  project_id: z.string().uuid().optional(),
})

export const searchHistoryCreateSchema = z.object({
  query: z.string().min(1).max(500),
  result_summary: z.string().max(500).optional(),
  source_count: z.number().int().min(0).max(1000).optional(),
})

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
})

export const projectDeleteSchema = z.object({
  project_id: z.string().uuid(),
})

export const assignDocumentSchema = z.object({
  document_id: z.string().uuid(),
  project_id: z.string().uuid().nullable().optional(),
})
