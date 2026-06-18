import { describe, it, expect, vi, beforeEach } from "vitest";
import "@/test/api-setup";

import { GET, POST, DELETE } from "@/app/api/search-history/route";

function createRequest(method: string, body?: any) {
  const init: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) init.body = JSON.stringify(body);
  return new Request("http://localhost/api/search-history", init);
}

describe("/api/search-history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns 200 with search history", async () => {
      const req = createRequest("GET");
      const res = await GET(req);
      expect(res.status).toBe(200);
    });
  });

  describe("POST", () => {
    it("returns 400 for invalid JSON body", async () => {
      const req = new Request("http://localhost/api/search-history", {
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
      const req = createRequest("POST", {});
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid request");
    });

    it("returns 200 for valid query", async () => {
      const req = createRequest("POST", { query: "test search" });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it("returns 200 for query with optional fields", async () => {
      const req = createRequest("POST", {
        query: "test",
        result_summary: "A summary",
        source_count: 5,
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE", () => {
    it("returns 200 when clearing history", async () => {
      const req = createRequest("DELETE");
      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
