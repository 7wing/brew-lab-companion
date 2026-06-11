import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFollowedPosts } from "./useFollowedPosts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const mockUser = { id: "u1", email: "test@example.com" };

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function mockFollowsChain(followedIds: string[]) {
  return {
    select: vi.fn(() => mockFollowsChain(followedIds)),
    eq: vi.fn(() => mockFollowsChain(followedIds)),
    in: vi.fn(() => mockFollowsChain(followedIds)),
    order: vi.fn(() => mockFollowsChain(followedIds)),
    then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
      return Promise.resolve({
        data: followedIds.map((id) => ({ followed_id: id })),
        error: null,
      }).then(onFulfilled, onRejected);
    },
  };
}

function mockPostsChain(posts: any[]) {
  return {
    select: vi.fn(() => mockPostsChain(posts)),
    in: vi.fn(() => mockPostsChain(posts)),
    eq: vi.fn(() => mockPostsChain(posts)),
    order: vi.fn(() => mockPostsChain(posts)),
    then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
      return Promise.resolve({ data: posts, error: null }).then(onFulfilled, onRejected);
    },
  };
}

describe("useFollowedPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      signOut: vi.fn(),
    } as any);
  });

  it("returns posts from followed users", async () => {
    const followsChain = mockFollowsChain(["u2", "u3"]);
    const postsChain = mockPostsChain([
      { id: "p1", user_id: "u2", title: "Post 1", profiles: { username: "u2" } },
      { id: "p2", user_id: "u3", title: "Post 2", profiles: { username: "u3" } },
    ]);

    (supabase.from as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(followsChain)
      .mockReturnValueOnce(postsChain);

    const { result } = renderHook(() => useFollowedPosts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.data?.[0].title).toBe("Post 1");
    expect(result.current.data?.[1].title).toBe("Post 2");
    expect(supabase.from).toHaveBeenNthCalledWith(1, "follows");
    expect(supabase.from).toHaveBeenNthCalledWith(2, "posts");
  });

  it("returns empty array when not following anyone", async () => {
    const followsChain = mockFollowsChain([]);

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(followsChain);

    const { result } = renderHook(() => useFollowedPosts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toHaveLength(0));
    expect(supabase.from).toHaveBeenCalledWith("follows");
    expect(supabase.from).not.toHaveBeenCalledWith("posts");
  });

  it("is disabled when user is null", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    } as any);

    const { result } = renderHook(() => useFollowedPosts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
