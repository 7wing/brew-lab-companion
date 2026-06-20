import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostDetail from "./PostDetail";
import { useComments, useToggleLike, useAddComment, useDeletePost } from "@/hooks/usePosts";
import { useIsFollowing, useFollow, useUnfollow } from "@/hooks/useFollows";
import { useUpdateComment } from "@/hooks/useUpdateComment";
import { useDeleteComment } from "@/hooks/useDeleteComment";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const mockNavigate = vi.fn();
const mockSingle = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "p1" }),
  };
});

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockSingle,
        })),
      })),
    })),
  },
}));

vi.mock("@/hooks/usePosts", () => ({
  useComments: vi.fn(),
  useToggleLike: vi.fn(),
  useAddComment: vi.fn(),
  useDeletePost: vi.fn(),
}));

vi.mock("@/hooks/useFollows", () => ({
  useIsFollowing: vi.fn(),
  useFollow: vi.fn(),
  useUnfollow: vi.fn(),
}));

vi.mock("@/hooks/useUpdateComment", () => ({
  useUpdateComment: vi.fn(),
}));

vi.mock("@/hooks/useDeleteComment", () => ({
  useDeleteComment: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
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
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog-open">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
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
  edited_at: null,
  user_id: "u2",
  photos: [],
  recipe_id: null,
  profiles: {
    username: "brewer1",
    avatar_url: null,
  },
  ...overrides,
});

const mockComment = (overrides: any = {}) => ({
  id: "c1",
  post_id: "p1",
  user_id: "u3",
  content: "Nice brew!",
  created_at: new Date(Date.now() - 600000).toISOString(),
  edited_at: null,
  profiles: {
    username: "commenter1",
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

  vi.mocked(useComments).mockReturnValue({
    data: [mockComment()],
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

  vi.mocked(useAddComment).mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);

  vi.mocked(useDeletePost).mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);

  vi.mocked(useIsFollowing).mockReturnValue({
    data: false,
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useFollow).mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);

  vi.mocked(useUnfollow).mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);

  vi.mocked(useUpdateComment).mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);

  vi.mocked(useDeleteComment).mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);
};

const renderPostDetailAsync = async (overrides = {}, setup?: () => void) => {
  defaultMocks(overrides);
  mockSingle.mockResolvedValue({ data: mockPost(), error: null });
  if (setup) setup();
  const view = render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={["/post/p1"]}>
        <Routes>
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  await waitFor(() => {
    expect(screen.queryByText("Post not found.")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-pulse")).not.toBeInTheDocument();
  });
  return view;
};

describe("PostDetail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockSingle.mockReset();
  });

  it("renders loading state", async () => {
    defaultMocks();
    mockSingle.mockReturnValue(new Promise(() => {}));

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={["/post/p1"]}>
          <Routes>
            <Route path="/post/:id" element={<PostDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  it("renders not found state", async () => {
    defaultMocks();
    mockSingle.mockResolvedValue({ data: null, error: null });

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={["/post/p1"]}>
          <Routes>
            <Route path="/post/:id" element={<PostDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Post not found.")).toBeInTheDocument();
    });
  });

  it("renders post title and content", async () => {
    await renderPostDetailAsync();
    expect(screen.getByText("Test Post")).toBeInTheDocument();
    expect(screen.getByText("This is a test post content.")).toBeInTheDocument();
  });

  it("shows author info on a single row with type and relative time", async () => {
    await renderPostDetailAsync();
    expect(screen.getByText("@brewer1")).toBeInTheDocument();
    expect(screen.getByText("beer")).toBeInTheDocument();
  });

  it("shows fallback initial avatar when no avatar_url", async () => {
    await renderPostDetailAsync();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows avatar image when avatar_url exists", async () => {
    await renderPostDetailAsync({}, () => {
      mockSingle.mockResolvedValue({
        data: mockPost({
          profiles: { username: "brewer1", avatar_url: "https://example.com/avatar.png" },
        }),
        error: null,
      });
    });

    const img = screen.getByAltText("brewer1") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://example.com/avatar.png");
  });

  it("shows like count and comment count", async () => {
    await renderPostDetailAsync();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows Back button and navigates on click", async () => {
    await renderPostDetailAsync();
    const backButton = screen.getByText("Back").closest("button")!;
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith("/community");
  });

  it("shows Follow button for non-owner", async () => {
    await renderPostDetailAsync();
    expect(screen.getByText("Follow")).toBeInTheDocument();
  });

  it("calls follow mutation when Follow is clicked", async () => {
    const followMutate = vi.fn();
    await renderPostDetailAsync({}, () => {
      vi.mocked(useFollow).mockReturnValue({
        mutate: followMutate,
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as any);
    });

    const followButton = screen.getByText("Follow").closest("button")!;
    fireEvent.click(followButton);
    expect(followMutate).toHaveBeenCalledWith("u2");
  });

  it("shows Following button when already following", async () => {
    await renderPostDetailAsync({}, () => {
      vi.mocked(useIsFollowing).mockReturnValue({
        data: true,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isPending: false,
        status: "success",
        refetch: vi.fn(),
      } as any);
    });

    expect(screen.getByText("Following")).toBeInTheDocument();
  });

  it("calls unfollow mutation when Following is clicked", async () => {
    const unfollowMutate = vi.fn();
    await renderPostDetailAsync({}, () => {
      vi.mocked(useIsFollowing).mockReturnValue({
        data: true,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isPending: false,
        status: "success",
        refetch: vi.fn(),
      } as any);
      vi.mocked(useUnfollow).mockReturnValue({
        mutate: unfollowMutate,
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as any);
    });

    const followingButton = screen.getByText("Following").closest("button")!;
    fireEvent.click(followingButton);
    expect(unfollowMutate).toHaveBeenCalledWith("u2");
  });

  it("hides follow button for owner", async () => {
    await renderPostDetailAsync({ userId: "u2" });
    expect(screen.queryByText("Follow")).not.toBeInTheDocument();
    expect(screen.queryByText("Following")).not.toBeInTheDocument();
  });

  it("hides follow button when not logged in", async () => {
    await renderPostDetailAsync({}, () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signOut: vi.fn(),
      } as any);
    });

    expect(screen.queryByText("Follow")).not.toBeInTheDocument();
    expect(screen.queryByText("Following")).not.toBeInTheDocument();
  });

  it("shows post Edit and Delete options for owner", async () => {
    await renderPostDetailAsync({ userId: "u2" });
    const items = screen.getAllByTestId("dropdown-item");
    const texts = items.map((i) => i.textContent);
    expect(texts.some((t) => t?.includes("Edit"))).toBe(true);
    expect(texts.some((t) => t?.includes("Delete"))).toBe(true);
  });

  it("shows post Report option for non-owner", async () => {
    await renderPostDetailAsync();
    const items = screen.getAllByTestId("dropdown-item");
    const texts = items.map((i) => i.textContent);
    expect(texts.some((t) => t?.includes("Report"))).toBe(true);
  });

  it("calls deletePost mutation and navigates on delete", async () => {
    const deleteMutate = vi.fn((_, options: any) => {
      if (options?.onSuccess) options.onSuccess();
    });
    await renderPostDetailAsync({ userId: "u2" }, () => {
      vi.mocked(useDeletePost).mockReturnValue({
        mutate: deleteMutate,
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as any);
    });

    const deleteItem = screen.getAllByTestId("dropdown-item").find((el) => el.textContent?.includes("Delete"))!;
    fireEvent.click(deleteItem);

    const confirmDelete = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(confirmDelete);

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith(
        { id: "p1" },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
      );
      expect(toast.success).toHaveBeenCalledWith("Post deleted");
      expect(mockNavigate).toHaveBeenCalledWith("/community");
    });
  });

  it("shows comment username and relative time", async () => {
    await renderPostDetailAsync();
    expect(screen.getByText("commenter1")).toBeInTheDocument();
  });

  it("shows comment fallback initial avatar", async () => {
    await renderPostDetailAsync();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("shows comment avatar image when avatar_url exists", async () => {
    await renderPostDetailAsync({}, () => {
      vi.mocked(useComments).mockReturnValue({
        data: [
          mockComment({
            profiles: { username: "commenter1", avatar_url: "https://example.com/comment-avatar.png" },
          }),
        ],
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isPending: false,
        status: "success",
        refetch: vi.fn(),
      } as any);
    });

    const img = screen.getByAltText("commenter1") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://example.com/comment-avatar.png");
  });

  it("shows Edit and Delete options for own comment", async () => {
    await renderPostDetailAsync({}, () => {
      vi.mocked(useComments).mockReturnValue({
        data: [mockComment({ user_id: "u1" })],
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isPending: false,
        status: "success",
        refetch: vi.fn(),
      } as any);
    });

    const items = screen.getAllByTestId("dropdown-item");
    const texts = items.map((i) => i.textContent);
    expect(texts.some((t) => t?.includes("Edit"))).toBe(true);
    expect(texts.some((t) => t?.includes("Delete"))).toBe(true);
  });

  it("shows Report option for other people's comments", async () => {
    await renderPostDetailAsync();
    const items = screen.getAllByTestId("dropdown-item");
    const texts = items.map((i) => i.textContent);
    expect(texts.some((t) => t?.includes("Report"))).toBe(true);
  });

  it("submits a new comment", async () => {
    const addMutate = vi.fn((_, options) => {
      if (options?.onSuccess) options.onSuccess();
    });
    await renderPostDetailAsync({}, () => {
      vi.mocked(useAddComment).mockReturnValue({
        mutate: addMutate,
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as any);
    });

    const input = screen.getByPlaceholderText("Write a comment...");
    fireEvent.change(input, { target: { value: "Great post!" } });
    const submitButton = screen.getByRole("button", { name: "" });
    fireEvent.click(submitButton);

    expect(addMutate).toHaveBeenCalledWith(
      { post_id: "p1", content: "Great post!" },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("calls toggleLike when like button is clicked", async () => {
    const likeMutate = vi.fn();
    await renderPostDetailAsync({}, () => {
      vi.mocked(useToggleLike).mockReturnValue({
        mutate: likeMutate,
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      } as any);
    });

    const likeButton = screen.getByText("5").closest("button")!;
    fireEvent.click(likeButton);
    expect(likeMutate).toHaveBeenCalled();
  });

  it("shows edited indicator on post", async () => {
    await renderPostDetailAsync({}, () => {
      mockSingle.mockResolvedValue({
        data: mockPost({ edited_at: new Date(Date.now() - 1800000).toISOString() }),
        error: null,
      });
    });

    expect(screen.getByText("(Edited)")).toBeInTheDocument();
  });

  it("shows edited indicator on comment", async () => {
    await renderPostDetailAsync({}, () => {
      vi.mocked(useComments).mockReturnValue({
        data: [mockComment({ edited_at: new Date(Date.now() - 300000).toISOString() })],
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
        isPending: false,
        status: "success",
        refetch: vi.fn(),
      } as any);
    });

    expect(screen.getByText("(Edited)")).toBeInTheDocument();
  });
});
