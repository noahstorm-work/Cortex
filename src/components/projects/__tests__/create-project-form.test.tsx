import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateProjectForm } from "../create-project-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("CreateProjectForm", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
  });

  it("renders form fields", () => {
    render(<CreateProjectForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create project/i })).toBeInTheDocument();
  });

  it("disables submit when name is empty", () => {
    render(<CreateProjectForm />);
    const btn = screen.getByRole("button", { name: /create project/i });
    expect(btn).toBeDisabled();
  });

  it("enables submit when name is filled", () => {
    render(<CreateProjectForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "My Project" } });
    const btn = screen.getByRole("button", { name: /create project/i });
    expect(btn).not.toBeDisabled();
  });

  it("calls fetch on submit with correct data", async () => {
    render(<CreateProjectForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "A desc" } });
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test", description: "A desc" }),
      });
    });
  });

  it("clears form after submit", async () => {
    render(<CreateProjectForm />);
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));

    await waitFor(() => {
      expect(nameInput).toHaveValue("");
    });
  });
});
