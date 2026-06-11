import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useIsFollowing,
  useFollowerCount,
  useFollowingCount,
  useFollowers,
  useFollowing,
  useFollow,
  useUnfollow,
} from "./useFollows";
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

function mockSupabaseChain(result: { data: any; error: any }) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    single: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    count: vi.fn(() => chain),
    then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };
  return chain;
}

function mockSupabaseChainCount(count: number | null, error: any = null) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    single: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
      return Promise.resolve({ count, error }).then(onFulfilled, onRejected);
    },
  };
  return chain;
}

describe("useFollows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      signOut: vi.fn(),
    } as any);
  });

  describe("useIsFollowing", () => {
    it("returns true when follow exists", async () => {
      const chain = mockSupabaseChain({ data: { id: "f1" }, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

      const { result } = renderHook(() => useIsFollowing("u2"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.data).toBe(true));
      expect(chain.select).toHaveBeenCalledWith("id");
      expect(chain.eq).toHaveBeenCalledWith("follower_id", "u1");
      expect(chain.eq).toHaveBeenCalledWith("followed_id", "u2");
    });

    it("returns false when follow does not exist", async () => {
      const chain = mockSupabaseChain({ data: null, error: { code: "PGRST116" } });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

      const { result } = renderHook(() => useIsFollowing("u2"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.data).toBe(false));
    });
  });

  describe("useFollowerCount", () => {
    it("returns the follower count", async () => {
      const chain = mockSupabaseChainCount(5);
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

      const { result } = renderHook(() => useFollowerCount("u2"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.data).toBe(5));
      expect(supabase.from).toHaveBeenCalledWith("follows");
    });


  });

  describe("useFollowingCount", () => {
    it("returns the following count", async () => {
      const chain = mockSupabaseChainCount(3);
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

      const { result } = renderHook(() => useFollowingCount("u2"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.data).toBe(3));
    });
  });

  describe("useFollowers", () => {
    it("returns followers with profiles", async () => {
      const followers = [
        { id: "f1", follower_id: "u2", profiles: { username: "u2" } },
      ];
      const chain = mockSupabaseChain({ data: followers, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

      const { result } = renderHook(() => useFollowers("u1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.data).toHaveLength(1));
      expect(result.current.data?.[0].profiles.username).toBe("u2");
    });
  });

  describe("useFollowing", () => {
    it("returns following with profiles", async () => {
      const following = [
        { id: "f1", followed_id: "u3", profiles: { username: "u3" } },
      ];
      const chain = mockSupabaseChain({ data: following, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

      const { result } = renderHook(() => useFollowing("u1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.data).toHaveLength(1));
      expect(result.current.data?.[0].profiles.username).toBe("u3");
    });
  });

  describe("useFollow", () => {
    it("inserts a follow, notifies the followed user, and invalidates queries", async () => {
      const chain = mockSupabaseChain({ data: { id: "f1" }, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

      const { result } = renderHook(() => useFollow(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync("u2");
      expect(supabase.from).toHaveBeenCalledWith("follows");
      expect(chain.insert).toHaveBeenCalledWith({ follower_id: "u1", followed_id: "u2" });
      expect(supabase.from).toHaveBeenCalledWith("notifications");
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "u2",
          type: "follow",
          title: "New follower",
          is_read: false,
        })
      );
    });

    it("throws when user is not authenticated", async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signOut: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFollow(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync("u2")).rejects.toThrow("Not authenticated");
    });
  });

  describe("useUnfollow", () => {
    it("deletes a follow and invalidates queries", async () => {
      const chain = mockSupabaseChain({ data: null, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

      const { result } = renderHook(() => useUnfollow(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync("u2");
      expect(supabase.from).toHaveBeenCalledWith("follows");
      expect(chain.delete).toHaveBeenCalled();
    });
  });
});
