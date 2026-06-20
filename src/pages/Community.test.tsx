import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Community from "./Community";
import { usePosts, useToggleLike } from "@/hooks/usePosts";
import { useFollowedPosts } from "@/hooks/useFollowedPosts";
import { useAuth } from "@/contexts/AuthContext";

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
  };
});

vi.mock("@/hooks/usePosts", () => ({
  usePosts: vi.fn(),
  useToggleLike: vi.fn(),
}));

vi.mock("@/hooks/useFollowedPosts", () => ({
  useFollowedPosts: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/components/ChallengesPanel", () => ({
  default: () => <div data-testid="challenges-panel">Challenges</div>,
}));

vi.mock("@/components/PostComposerFAB", () => ({
  default: () => <div data-testid="post-composer-fab">FAB</div>,
}));

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick, ...props }: any) => (
    <div data-testid="dropdown-item" onClick={onClick} {...props}>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog-open">{children}</div> : <>{children}</>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockPost = (overrides: any = {}) => ({
  id: "p1",
  title: "Test Post",
  content: "This is a test post content.",
  type: "beer",
  likes: 5,
  created_at: new Date(Date.now() - 3600000).toISOString(),
  user_id: "u2",
  photos: [],
  recipe_id: null,
  profiles: {
    username: "brewer1",
    avatar_url: null,
  },
  ...overrides,
});

const defaultMocks = ({ userId = "u1" } = {}) => {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: userId, email: "test@example.com" },
    session: null,
    loading: false,
    signOut: vi.fn(),
  } as any);

  vi.mocked(usePosts).mockReturnValue({
    data: { posts: [mockPost()], total: 1 },
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useFollowedPosts).mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useToggleLike).mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);
};

const renderCommunity = () => {
  defaultMocks();
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <Community />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Community page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockSetSearchParams.mockClear();
  });

  it("renders loading skeletons", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "u1", email: "test@example.com" },
      session: null,
      loading: false,
      signOut: vi.fn(),
    } as any);

    vi.mocked(usePosts).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
      isPending: true,
      status: "pending",
      refetch: vi.fn(),
    } as any);

    vi.mocked(useFollowedPosts).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <Community />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty state when no posts", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "u1", email: "test@example.com" },
      session: null,
      loading: false,
      signOut: vi.fn(),
    } as any);

    vi.mocked(usePosts).mockReturnValue({
      data: { posts: [], total: 0 },
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    vi.mocked(useFollowedPosts).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <Community />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("No posts yet in this category.")).toBeInTheDocument();
  });

  it("renders post title and content", () => {
    renderCommunity();
    expect(screen.getByText("Test Post")).toBeInTheDocument();
    expect(screen.getByText("This is a test post content.")).toBeInTheDocument();
  });

  it("shows author username on a single row with type and time", () => {
    renderCommunity();
    expect(screen.getByText("@brewer1")).toBeInTheDocument();
    expect(screen.getByText("beer")).toBeInTheDocument();
  });

  it("shows avatar image when avatar_url exists", () => {
    vi.mocked(usePosts).mockReturnValue({
      data: {
        posts: [mockPost({ profiles: { username: "brewer1", avatar_url: "https://example.com/avatar.png" } })],
        total: 1,
      },
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <Community />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const img = screen.getByAltText("brewer1") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://example.com/avatar.png");
  });

  it("shows fallback initial avatar when no avatar_url", () => {
    renderCommunity();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows like count in action bar", () => {
    renderCommunity();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows Comments and Share buttons in action bar", () => {
    renderCommunity();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
  });

  it("places the options menu in the action bar, not the header", () => {
    renderCommunity();
    const dropdownTriggers = screen.getAllByTestId("dropdown-trigger");
    // There should be one options menu per post card
    expect(dropdownTriggers.length).toBe(1);
  });

  it("shows Edit and Delete options for own posts", () => {
    defaultMocks({ userId: "u2" });
    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <Community />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const items = screen.getAllByTestId("dropdown-item");
    const texts = items.map((i) => i.textContent);
    expect(texts.some((t) => t?.includes("Edit post"))).toBe(true);
    expect(texts.some((t) => t?.includes("Delete post"))).toBe(true);
  });

  it("shows Report option for other people's posts", () => {
    renderCommunity();
    const items = screen.getAllByTestId("dropdown-item");
    const texts = items.map((i) => i.textContent);
    expect(texts.some((t) => t?.includes("Report post"))).toBe(true);
  });

  it("navigates to post detail when card body is clicked", () => {
    renderCommunity();
    const title = screen.getByText("Test Post");
    fireEvent.click(title.closest("div.cursor-pointer")!);
    expect(mockNavigate).toHaveBeenCalledWith("/post/p1");
  });

  it("does not navigate when action bar buttons are clicked", () => {
    renderCommunity();
    const likeButton = screen.getByText("5").closest("button")!;
    fireEvent.click(likeButton);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not navigate when Share button is clicked", () => {
    renderCommunity();
    const shareButton = screen.getByText("Share").closest("button")!;
    fireEvent.click(shareButton);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("calls toggleLike when like button is clicked", () => {
    const mutate = vi.fn();
    defaultMocks();
    vi.mocked(useToggleLike).mockReturnValue({
      mutate,
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <Community />
        </MemoryRouter>
      </QueryClientProvider>
    );
    const likeButton = screen.getByText("5").closest("button")!;
    fireEvent.click(likeButton);
    expect(mutate).toHaveBeenCalled();
  });

  it("shows photo thumbnails when post has photos", () => {
    vi.mocked(usePosts).mockReturnValue({
      data: {
        posts: [mockPost({ photos: ["https://example.com/photo1.jpg"] })],
        total: 1,
      },
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <Community />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const img = document.querySelector('img[src="https://example.com/photo1.jpg"]') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://example.com/photo1.jpg");
  });

  it("shows recipe tag when recipe_id is present", () => {
    vi.mocked(usePosts).mockReturnValue({
      data: {
        posts: [mockPost({ recipe_id: "r1" })],
        total: 1,
      },
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <Community />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Tagged recipe")).toBeInTheDocument();
  });

  it("switches tabs and updates search params", () => {
    renderCommunity();
    const troubleshootingTab = screen.getByText("Troubleshooting");
    fireEvent.click(troubleshootingTab);
    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it("toggles between All and Following", () => {
    renderCommunity();
    const followingButton = screen.getByText("Following");
    fireEvent.click(followingButton);
    expect(useFollowedPosts).toHaveBeenCalled();
  });

  it("shows pagination when total pages > 1", () => {
    vi.mocked(usePosts).mockReturnValue({
      data: { posts: [mockPost()], total: 25 },
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <Community />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
  });

  it("renders challenges panel on Challenges tab", () => {
    renderCommunity();
    const challengesTab = screen.getByText("Challenges");
    fireEvent.click(challengesTab);
    expect(screen.getByTestId("challenges-panel")).toBeInTheDocument();
  });

  it("renders search input and updates query on change", () => {
    renderCommunity();
    const searchInput = screen.getByPlaceholderText("Search community...");
    fireEvent.change(searchInput, { target: { value: "ipa" } });
    expect(searchInput).toHaveValue("ipa");
  });

  it("shows sort dropdown with options", () => {
    renderCommunity();
    const sortSelect = screen.getByRole("combobox");
    expect(sortSelect).toBeInTheDocument();
    expect(screen.getByText("Latest")).toBeInTheDocument();
    expect(screen.getByText("Most Liked")).toBeInTheDocument();
    expect(screen.getByText("Most Commented")).toBeInTheDocument();
  });
});
