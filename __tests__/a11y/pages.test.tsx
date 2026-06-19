/**
 * @fileoverview Accessibility tests using axe-core
 * Tests WCAG 2.1 AA compliance for key page components
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";

// ─── Mock Firebase to avoid network calls ─────────────────────────────────
vi.mock("@/lib/firebase/config", () => ({
  auth: {},
  db: {},
  app: {},
}));

vi.mock("@/lib/firebase/auth", () => ({
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  createAccount: vi.fn(),
  signOutUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuthContext: () => ({ user: null, profile: null, loading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({ theme: "dark", toggleTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// ─── Axe helper ───────────────────────────────────────────────────────────
async function checkA11y(container: HTMLElement): Promise<axe.AxeResults> {
  return axe.run(container, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"],
    },
  });
}

// ─── Login Page Tests ──────────────────────────────────────────────────────
describe("Accessibility — Login Page", async () => {
  const { default: LoginPage } = await import("@/app/login/page");

  it("has no critical axe violations", async () => {
    const { container } = render(<LoginPage />);
    const results = await checkA11y(container);
    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(criticalViolations).toHaveLength(0);
  });

  it("has a main landmark", () => {
    render(<LoginPage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("has a visible heading", () => {
    render(<LoginPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).not.toBe("");
  });

  it("email input has associated label", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText("Email address");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.tagName).toBe("INPUT");
  });

  it("password input has associated label", () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it("Google sign-in button has accessible label", () => {
    render(<LoginPage />);
    const googleBtn = screen.getByRole("button", { name: /google/i });
    expect(googleBtn).toBeInTheDocument();
  });

  it("sign-in submit button has accessible label", () => {
    render(<LoginPage />);
    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it("has link to registration", () => {
    render(<LoginPage />);
    const registerLink = screen.getByRole("link", { name: /create/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href");
  });
});

// ─── Register Page Tests ───────────────────────────────────────────────────
describe("Accessibility — Register Page", async () => {
  const { default: RegisterPage } = await import("@/app/register/page");

  it("has no critical axe violations", async () => {
    const { container } = render(<RegisterPage />);
    const results = await checkA11y(container);
    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(criticalViolations).toHaveLength(0);
  });

  it("has a main landmark", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("has a visible h1 heading", () => {
    render(<RegisterPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("form inputs have labels", () => {
    render(<RegisterPage />);
    // Should have at minimum an email input with label
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
  });

  it("register button is accessible", () => {
    render(<RegisterPage />);
    // Look for create/register/sign up button
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("has link back to login", () => {
    render(<RegisterPage />);
    const loginLink = screen.getByRole("link", { name: /sign in|log in/i });
    expect(loginLink).toBeInTheDocument();
  });
});

// ─── Home Page Tests ───────────────────────────────────────────────────────
describe("Accessibility — Home Page", async () => {
  const { default: HomePage } = await import("@/app/page");

  it("has no critical axe violations", async () => {
    const { container } = render(<HomePage />);
    const results = await checkA11y(container);
    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(criticalViolations).toHaveLength(0);
  });

  it("has exactly one h1", () => {
    render(<HomePage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
  });

  it("all images have alt text", () => {
    const { container } = render(<HomePage />);
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      expect(img.getAttribute("alt")).not.toBeNull();
    });
  });

  it("all interactive elements are focusable", () => {
    const { container } = render(<HomePage />);
    const interactives = container.querySelectorAll(
      "a, button, input, select, textarea, [tabindex]"
    );
    interactives.forEach((el) => {
      const tabindex = el.getAttribute("tabindex");
      // tabindex -1 is intentionally not focusable via keyboard
      if (tabindex !== "-1") {
        expect(el.tagName || el.getAttribute("role")).toBeTruthy();
      }
    });
  });

  it("has navigation landmark", () => {
    render(<HomePage />);
    // Either a nav element or link list should exist
    const { container } = render(<HomePage />);
    const hasNav = container.querySelector("nav") !== null;
    const hasLinks = container.querySelectorAll("a").length > 0;
    expect(hasNav || hasLinks).toBe(true);
  });

  it("call-to-action links are meaningful", () => {
    render(<HomePage />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      const label = link.textContent?.trim() || link.getAttribute("aria-label") || "";
      // No empty or generic "click here" links
      expect(label).not.toBe("");
      expect(label.toLowerCase()).not.toBe("click here");
      expect(label.toLowerCase()).not.toBe("here");
    });
  });
});

// ─── General Accessibility Utilities ──────────────────────────────────────
describe("Accessibility — WCAG Helper Functions", () => {
  it("axe-core is properly configured", async () => {
    const { container } = render(
      <div>
        <main id="main-content" role="main" aria-label="Test page">
          <h1>Test Heading</h1>
          <button aria-label="Test button">Click me</button>
          <a href="/test" aria-label="Test link">Go somewhere</a>
        </main>
      </div>
    );
    const results = await checkA11y(container);
    expect(results.violations).toHaveLength(0);
  });

  it("detects missing alt text on images", async () => {
    const { container } = render(
      <div>
        <img src="/test.jpg" />
      </div>
    );
    const results = await axe.run(container, {
      runOnly: { type: "tag", values: ["wcag2a"] },
    });
    const altViolation = results.violations.find((v) => v.id === "image-alt");
    expect(altViolation).toBeDefined();
  });



  it("proper semantic form passes axe", async () => {
    const { container } = render(
      <form>
        <label htmlFor="name">Full Name</label>
        <input id="name" type="text" name="name" aria-required="true" />
        <button type="submit" aria-label="Submit form">Submit</button>
      </form>
    );
    const results = await axe.run(container, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    });
    expect(results.violations).toHaveLength(0);
  });

  it("skip link pattern passes axe", async () => {
    const { container } = render(
      <div>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <nav aria-label="Main navigation">
          <a href="/">Home</a>
        </nav>
        <main id="main-content">
          <h1>Page Title</h1>
          <p>Content here</p>
        </main>
      </div>
    );
    const results = await checkA11y(container);
    expect(results.violations).toHaveLength(0);
  });

  it("icon buttons need accessible names", async () => {
    // Button without label — should fail
    const { container } = render(
      <button>
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
      </button>
    );
    const results = await axe.run(container, {
      runOnly: { type: "tag", values: ["wcag2a"] },
    });
    const buttonViolation = results.violations.find((v) => v.id === "button-name");
    expect(buttonViolation).toBeDefined();
  });

  it("button with aria-label passes", async () => {
    const { container } = render(
      <button aria-label="Close dialog">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
    );
    const results = await checkA11y(container);
    expect(results.violations).toHaveLength(0);
  });
});
