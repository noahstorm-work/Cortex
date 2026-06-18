import { describe, it, expect } from "vitest";
import {
  fileNameSchema,
  fileSizeSchema,
  uploadSchema,
  processSchema,
  deleteSchema,
  searchSchema,
  searchHistoryCreateSchema,
  projectCreateSchema,
  projectDeleteSchema,
  assignDocumentSchema,
  searchSuggestionsSchema,
} from "../schemas";

describe("fileNameSchema", () => {
  it("accepts valid filenames", () => {
    expect(fileNameSchema.parse("document.pdf")).toBe("document.pdf");
    expect(fileNameSchema.parse("report.docx")).toBe("report.docx");
    expect(fileNameSchema.parse("image.png")).toBe("image.png");
  });

  it("rejects empty filename", () => {
    expect(() => fileNameSchema.parse("")).toThrow();
  });

  it("rejects filename exceeding 255 chars", () => {
    expect(() => fileNameSchema.parse("a".repeat(256))).toThrow();
  });

  it("rejects disallowed extensions", () => {
    expect(() => fileNameSchema.parse("file.exe")).toThrow();
    expect(() => fileNameSchema.parse("file.bat")).toThrow();
    expect(() => fileNameSchema.parse("file.js")).toThrow();
  });
});

describe("fileSizeSchema", () => {
  it("accepts valid file sizes", () => {
    expect(fileSizeSchema.parse(1024)).toBe(1024);
    expect(fileSizeSchema.parse(1)).toBe(1);
  });

  it("rejects zero or negative size", () => {
    expect(() => fileSizeSchema.parse(0)).toThrow();
    expect(() => fileSizeSchema.parse(-1)).toThrow();
  });

  it("rejects size over 50MB", () => {
    expect(() => fileSizeSchema.parse(51 * 1024 * 1024)).toThrow();
  });
});

describe("uploadSchema", () => {
  it("accepts valid upload payload", () => {
    const result = uploadSchema.parse({
      fileName: "test.pdf",
      fileType: "application/pdf",
      fileSize: 1024,
    });
    expect(result.fileName).toBe("test.pdf");
  });

  it("accepts optional projectId", () => {
    const result = uploadSchema.parse({
      fileName: "test.pdf",
      fileSize: 1024,
      projectId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.projectId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects missing required fields", () => {
    expect(() => uploadSchema.parse({ fileName: "test.pdf" })).toThrow();
  });
});

describe("processSchema", () => {
  it("accepts valid process payload", () => {
    const result = processSchema.parse({
      document_id: "550e8400-e29b-41d4-a716-446655440000",
      file_url: "https://example.com/file.pdf",
    });
    expect(result.document_id).toBeTruthy();
  });

  it("rejects non-uuid document_id", () => {
    expect(() =>
      processSchema.parse({ document_id: "not-a-uuid", file_url: "https://example.com/f.pdf" })
    ).toThrow();
  });

  it("rejects invalid URL", () => {
    expect(() =>
      processSchema.parse({
        document_id: "550e8400-e29b-41d4-a716-446655440000",
        file_url: "not-a-url",
      })
    ).toThrow();
  });
});

describe("deleteSchema", () => {
  it("accepts valid delete payload", () => {
    const result = deleteSchema.parse({ document_id: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.document_id).toBeTruthy();
  });
});

describe("searchSchema", () => {
  it("accepts valid search query", () => {
    const result = searchSchema.parse({ query: "machine learning" });
    expect(result.query).toBe("machine learning");
  });

  it("rejects query shorter than 2 chars", () => {
    expect(() => searchSchema.parse({ query: "a" })).toThrow();
  });

  it("rejects query exceeding 500 chars", () => {
    expect(() => searchSchema.parse({ query: "a".repeat(501) })).toThrow();
  });

  it("accepts optional project_id", () => {
    const result = searchSchema.parse({
      query: "test",
      project_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.project_id).toBeTruthy();
  });
});

describe("searchHistoryCreateSchema", () => {
  it("accepts valid history entry", () => {
    const result = searchHistoryCreateSchema.parse({ query: "my search" });
    expect(result.query).toBe("my search");
  });
});

describe("projectCreateSchema", () => {
  it("accepts valid project", () => {
    const result = projectCreateSchema.parse({ name: "My Project" });
    expect(result.name).toBe("My Project");
  });

  it("accepts optional description", () => {
    const result = projectCreateSchema.parse({ name: "Project", description: "A description" });
    expect(result.description).toBe("A description");
  });

  it("rejects name exceeding 100 chars", () => {
    expect(() => projectCreateSchema.parse({ name: "a".repeat(101) })).toThrow();
  });
});

describe("projectDeleteSchema", () => {
  it("accepts valid delete payload", () => {
    const result = projectDeleteSchema.parse({
      project_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.project_id).toBeTruthy();
  });
});

describe("assignDocumentSchema", () => {
  it("accepts valid assignment", () => {
    const result = assignDocumentSchema.parse({
      document_id: "550e8400-e29b-41d4-a716-446655440000",
      project_id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.project_id).toBeTruthy();
  });

  it("accepts null project_id to unassign", () => {
    const result = assignDocumentSchema.parse({
      document_id: "550e8400-e29b-41d4-a716-446655440000",
      project_id: null,
    });
    expect(result.project_id).toBeNull();
  });
});

describe("searchSuggestionsSchema", () => {
  it("accepts valid suggestion request", () => {
    const result = searchSuggestionsSchema.parse({ query: "mac" });
    expect(result.query).toBe("mac");
  });

  it("applies default limit of 5", () => {
    const result = searchSuggestionsSchema.parse({ query: "test" });
    expect(result.limit).toBe(5);
  });

  it("accepts custom limit", () => {
    const result = searchSuggestionsSchema.parse({ query: "test", limit: 10 });
    expect(result.limit).toBe(10);
  });

  it("rejects limit over 20", () => {
    expect(() => searchSuggestionsSchema.parse({ query: "test", limit: 21 })).toThrow();
  });
});
