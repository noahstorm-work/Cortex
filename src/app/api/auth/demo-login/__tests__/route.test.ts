import { describe, it, expect, vi, beforeEach } from "vitest";
import "@/test/api-setup";

import { POST } from "@/app/api/auth/demo-login/route";

describe("POST /api/auth/demo-login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DEMO_LOGIN_PASSWORD env
    process.env.DEMO_LOGIN_PASSWORD = "test-password";
  });

  it("returns 500 when DEMO_LOGIN_PASSWORD is not set", async () => {
    delete process.env.DEMO_LOGIN_PASSWORD;
    const req = new Request("http://localhost/api/auth/demo-login", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Demo login not configured");
  });

  it("returns 200 when demo login is configured", async () => {
    process.env.DEMO_LOGIN_PASSWORD = "test-password";
    const req = new Request("http://localhost/api/auth/demo-login", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
