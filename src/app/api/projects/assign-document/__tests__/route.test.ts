import { describe, it, expect, vi, beforeEach } from "vitest"
import "@/test/api-setup"

import { POST } from "@/app/api/projects/assign-document/route"

function createRequest(body: any) {
  return new Request("http://localhost/api/projects/assign-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/projects/assign-document", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/projects/assign-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe("Invalid JSON body")
  })

  it("returns 400 for missing fields", async () => {
    const req = createRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe("Invalid request")
  })

  it("returns 400 for invalid document_id format", async () => {
    const req = createRequest({ document_id: "not-a-uuid", project_id: "550e8400-e29b-41d4-a716-446655440000" })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe("Invalid request")
  })

  it("returns 200 for valid assignment", async () => {
    const req = createRequest({
      document_id: "550e8400-e29b-41d4-a716-446655440000",
      project_id: "550e8400-e29b-41d4-a716-446655440001",
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it("returns 200 for unassigning (null project_id)", async () => {
    const req = createRequest({
      document_id: "550e8400-e29b-41d4-a716-446655440000",
      project_id: null,
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})
