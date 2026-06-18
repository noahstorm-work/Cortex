import { describe, it, expect, vi, beforeEach } from "vitest";
import "@/test/api-setup";

// Must import after mocking
import { POST } from "@/app/api/documents/upload/route";

function createRequest(body: any, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/documents/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/documents/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/documents/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("returns 400 for missing required fields", async () => {
    const req = createRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid request");
  });

  it("returns 400 for disallowed file extension", async () => {
    const req = createRequest({
      fileName: "malware.exe",
      fileType: "application/x-executable",
      fileSize: 1000,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid request");
  });

  it("returns 200 with signed URL for valid upload", async () => {
    const req = createRequest({
      fileName: "test.pdf",
      fileType: "application/pdf",
      fileSize: 1024,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.signedUrl).toBeDefined();
    expect(data.document_id).toBeDefined();
    expect(data.file_url).toBeDefined();
  });

  it("returns 200 for valid image upload", async () => {
    const req = createRequest({
      fileName: "photo.jpg",
      fileType: "image/jpeg",
      fileSize: 2048,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.signedUrl).toBeDefined();
  });

  it("returns 200 for valid text file", async () => {
    const req = createRequest({
      fileName: "notes.txt",
      fileType: "text/plain",
      fileSize: 512,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.signedUrl).toBeDefined();
  });
});
