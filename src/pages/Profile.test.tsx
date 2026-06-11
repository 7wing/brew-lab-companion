import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "./Profile";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useBatches } from "@/hooks/useBatches";
import { useRecipes } from "@/hooks/useRecipes";
import { useYeastBank } from "@/hooks/useYeastBank";
import { useUpload } from "@/hooks/useUpload";

const mockNavigate = vi.fn();
const mockSignOut = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  MemoryRouter: require("react-router-dom").MemoryRouter,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/useProfile", () => ({
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("@/hooks/useBatches", () => ({
  useBatches: vi.fn(),
}));

vi.mock("@/hooks/useRecipes", () => ({
  useRecipes: vi.fn(),
}));

vi.mock("@/hooks/useYeastBank", () => ({
  useYeastBank: vi.fn(),
  useAddYeastStrain: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useDeleteYeastStrain: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

vi.mock("@/hooks/useUpload", () => ({
  useUpload: vi.fn(),
}));

vi.mock("@/hooks/useFollows", () => ({
  useIsFollowing: vi.fn(() => ({ data: false, isLoading: false })),
  useFollowerCount: vi.fn(() => ({ data: 0, isLoading: false })),
  useFollowingCount: vi.fn(() => ({ data: 0, isLoading: false })),
  useFollowers: vi.fn(() => ({ data: [], isLoading: false })),
  useFollowing: vi.fn(() => ({ data: [], isLoading: false })),
  useFollow: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUnfollow: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

const defaultMockReturnValues = () => {
  vi.mocked(useProfile).mockReturnValue({
    data: {
      id: "u1",
      username: "testuser",
      display_name: "Test User",
      bio: null,
      location: null,
      avatar_url: null,
      updated_at: null,
    },
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useBatches).mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useRecipes).mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useYeastBank).mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useUpload).mockReturnValue({
    upload: vi.fn(),
    uploading: false,
    error: null,
  } as any);
};

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderProfile = () => {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: "u1", email: "test@example.com" },
    session: null,
    loading: false,
    signOut: mockSignOut,
  } as any);

  defaultMockReturnValues();

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Profile page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockSignOut.mockClear();
  });

  it("shows the Account Settings accordion with a Sign Out button", async () => {
    renderProfile();

    const accountSettingsButton = screen.getByText("Account Settings");
    fireEvent.click(accountSettingsButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    });
  });

  it("calls signOut and navigates to /auth when Sign Out is clicked", async () => {
    mockSignOut.mockResolvedValue(undefined);

    renderProfile();

    const accountSettingsButton = screen.getByText("Account Settings");
    fireEvent.click(accountSettingsButton);

    const signOutButton = await waitFor(() => screen.getByRole("button", { name: /sign out/i }));
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });
});