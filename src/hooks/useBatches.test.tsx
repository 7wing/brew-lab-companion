import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBatches, useBatch, useCreateBatch, useUpdateBatch } from "./useBatches";
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
    update: vi.fn(() => chain),
    then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };
  return chain;
}

describe("useBatches hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
      loading: false,
    });
  });

  it("fetches batches for the current user", async () => {
    const mockBatches = [
      { id: "b1", name: "IPA", user_id: "u1" },
      { id: "b2", name: "Mead", user_id: "u1" },
    ];
    const chain = mockSupabaseChain({ data: mockBatches, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const { result } = renderHook(() => useBatches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBatches);
    expect(supabase.from).toHaveBeenCalledWith("batches");
    expect(chain.select).toHaveBeenCalledWith("*, recipe:recipes(id, title), batch_stages(*)");
    expect(chain.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("throws when supabase returns an error", async () => {
    const chain = mockSupabaseChain({ data: null, error: new Error("DB failure") });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const { result } = renderHook(() => useBatches(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("DB failure");
  });

  it("fetches a single batch by id", async () => {
    const mockBatch = { id: "b1", name: "IPA", user_id: "u1" };
    const chain = mockSupabaseChain({ data: mockBatch, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const { result } = renderHook(() => useBatch("b1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockBatch);
    expect(supabase.from).toHaveBeenCalledWith("batches");
    expect(chain.select).toHaveBeenCalledWith("*, recipe:recipes(id, title), batch_stages(*)");
  });

  it("creates a batch and returns new data", async () => {
    const newBatch = { id: "b3", name: "Kombucha", user_id: "u1" };
    const chain = mockSupabaseChain({ data: newBatch, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const { result } = renderHook(() => useCreateBatch(), {
      wrapper: createWrapper(),
    });

    const returned = await result.current.mutateAsync({
      name: "Kombucha",
      type: "kombucha",
      start_date: "2024-01-01",
      target_days: 14,
    });

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Kombucha", user_id: "u1" })
    );
    expect(returned).toEqual(newBatch);
  });

  it("rejects create batch when not authenticated", async () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      loading: false,
    });

    const { result } = renderHook(() => useCreateBatch(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        name: "Kombucha",
        type: "kombucha",
        start_date: "2024-01-01",
        target_days: 14,
      })
    ).rejects.toThrow("Not authenticated");
  });

  it("updates a batch and returns updated data", async () => {
    const updated = { id: "b1", name: "Updated IPA", user_id: "u1" };
    const chain = mockSupabaseChain({ data: updated, error: null });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chain);

    const { result } = renderHook(() => useUpdateBatch(), {
      wrapper: createWrapper(),
    });

    const returned = await result.current.mutateAsync({ id: "b1", name: "Updated IPA" });

    expect(chain.update).toHaveBeenCalledWith({ name: "Updated IPA" });
    expect(returned).toEqual(updated);
  });
});
