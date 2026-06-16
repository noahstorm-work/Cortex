import { describe, it, expect, vi, beforeEach } from "vitest"
import "@/test/api-setup"

import { POST } from "@/app/api/projects/create/route"

function createRequest(body: any) {
  return new Request("http://localhost/api/projects/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/projects/create", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe("Invalid JSON body")
  })

  it("returns 400 for missing name", async () => {
    const req = createRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe("Invalid request")
  })

  it("returns 400 for empty name", async () => {
    const req = createRequest({ name: "" })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe("Invalid request")
  })

  it("returns 200 with created project for valid input", async () => {
    const req = createRequest({ name: "Test Project", description: "A test" })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).toBeDefined()
  })

  it("returns 200 for project without description", async () => {
    const req = createRequest({ name: "My Project" })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).toBeDefined()
  })
})
