import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCards } from "../stats-cards";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/dashboard",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/animated-counter", () => ({
  AnimatedCounter: ({ value }: { value: number }) => <span data-testid="counter">{value}</span>,
}));

const mockStats = [
  {
    label: "Documents",
    value: 42,
    href: "/documents",
    gradient: "from-teal-400/20",
    iconBg: "from-teal-400 to-teal-600",
    accent: "text-teal-400",
  },
  {
    label: "Indexed Chunks",
    value: 150,
    href: "/search",
    gradient: "from-violet-400/20",
    iconBg: "from-violet-400 to-violet-600",
    accent: "text-violet-400",
  },
  {
    label: "Searches",
    value: 12,
    href: "/search",
    gradient: "from-emerald-400/20",
    iconBg: "from-emerald-400 to-emerald-600",
    accent: "text-emerald-400",
  },
  {
    label: "Projects",
    value: "—",
    href: "/projects",
    gradient: "from-blue-400/20",
    iconBg: "from-blue-400 to-blue-600",
    accent: "text-blue-400",
  },
];

describe("StatsCards", () => {
  it("renders all stat cards", () => {
    render(<StatsCards stats={mockStats} />);
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Indexed Chunks")).toBeInTheDocument();
    expect(screen.getByText("Searches")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders numeric values with AnimatedCounter", () => {
    render(<StatsCards stats={mockStats} />);
    const counters = screen.getAllByTestId("counter");
    expect(counters.length).toBe(3);
    expect(counters[0].textContent).toBe("42");
    expect(counters[1].textContent).toBe("150");
    expect(counters[2].textContent).toBe("12");
  });

  it("renders non-numeric values as text", () => {
    render(<StatsCards stats={mockStats} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("links each card to the correct href", () => {
    render(<StatsCards stats={mockStats} />);
    expect(screen.getByText("Documents").closest("a")).toHaveAttribute("href", "/documents");
    expect(screen.getByText("Projects").closest("a")).toHaveAttribute("href", "/projects");
  });

  it("renders empty state", () => {
    render(<StatsCards stats={[]} />);
    expect(screen.queryByText("Documents")).not.toBeInTheDocument();
  });
});
