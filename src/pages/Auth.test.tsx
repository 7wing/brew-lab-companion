import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "./Auth";
import { useAuth } from "@/contexts/AuthContext";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

vi.mock("@supabase/auth-ui-react", () => ({
  Auth: () => <div data-testid="auth-ui">Auth UI Component</div>,
}));

vi.mock("@supabase/auth-ui-shared", () => ({
  ThemeSupa: {},
}));

const renderWithRouter = (ui: React.ReactElement, { user = null } = {}) => {
  vi.mocked(useAuth).mockReturnValue({
    user,
    session: null,
    loading: false,
    signOut: vi.fn(),
  } as any);

  return render(
    <MemoryRouter initialEntries={["/auth"]}>
      {ui}
    </MemoryRouter>
  );
};

describe("Auth page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects logged-in users to /", async () => {
    renderWithRouter(<AuthPage />, { user: { id: "u1", email: "test@example.com" } });

    // When logged in, Navigate component should redirect to /
    // The component renders a Navigate element with to="/"
    // Check that we're NOT seeing the Auth form content
    expect(screen.queryByText("Homebrew Haven")).not.toBeInTheDocument();
  });

  it("renders auth UI when user is null", () => {
    renderWithRouter(<AuthPage />, { user: null });

    // Check for the "Homebrew Haven" heading
    expect(screen.getByText("Homebrew Haven")).toBeInTheDocument();
  });
});