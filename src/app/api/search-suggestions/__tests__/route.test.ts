import { describe, it, expect, vi, beforeEach } from "vitest";
import "@/test/api-setup";

vi.mock("@/lib/search/bm25", () => ({
  escapeLike: (s: string) => s.replace(/[%_]/g, "\\$&"),
}));

import { POST } from "@/app/api/search-suggestions/route";

function createRequest(body: any) {
  return new Request("http://localhost/api/search-suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/search-suggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/search-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("returns 400 for missing query", async () => {
    const req = createRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid query");
  });

  it("returns 400 for empty query", async () => {
    const req = createRequest({ query: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid query");
  });

  it("returns 200 with suggestions for valid query", async () => {
    const req = createRequest({ query: "test", limit: 5 });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.suggestions).toBeDefined();
    expect(Array.isArray(data.suggestions)).toBe(true);
  });

  it("returns 200 with default limit", async () => {
    const req = createRequest({ query: "hello" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.suggestions).toBeDefined();
  });
});
