import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useUpload } from "./useUpload";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import imageCompression from "browser-image-compression";

const mockUser = { id: "u1", email: "test@example.com" };

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: "https://example.com/avatar.jpg" },
        })),
      })),
    },
  },
}));

vi.mock("browser-image-compression", () => ({
  default: vi.fn((file: File) =>
    Promise.resolve(new File([file], file.name, { type: file.type }))
  ),
}));

describe("useUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
      loading: false,
    });
  });

  it("compresses, uploads and returns public URL", async () => {
    const mockStorage = {
      upload: vi.fn(() => Promise.resolve({ error: null })),
      getPublicUrl: vi.fn(() => ({
        data: { publicUrl: "https://cdn.supabase.co/bucket/u1/1234567890.jpg" },
      })),
    };
    (supabase.storage.from as ReturnType<typeof vi.fn>).mockReturnValue(mockStorage);

    const { result } = renderHook(() => useUpload("avatars"));
    const file = new File(["blob"], "photo.png", { type: "image/png" });

    let url = "";
    await act(async () => {
      url = await result.current.upload(file);
    });

    expect(imageCompression).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })
    );
    expect(supabase.storage.from).toHaveBeenCalledWith("avatars");
    expect(mockStorage.upload).toHaveBeenCalledWith(
      expect.stringMatching(/u1\/\d+\.png/),
      expect.any(File),
      { upsert: true }
    );
    expect(url).toBe("https://cdn.supabase.co/bucket/u1/1234567890.jpg");
    expect(result.current.error).toBeNull();
  });

  it("uses custom path when provided", async () => {
    const mockStorage = {
      upload: vi.fn(() => Promise.resolve({ error: null })),
      getPublicUrl: vi.fn(() => ({
        data: { publicUrl: "https://cdn.supabase.co/bucket/custom/path.jpg" },
      })),
    };
    (supabase.storage.from as ReturnType<typeof vi.fn>).mockReturnValue(mockStorage);

    const { result } = renderHook(() => useUpload("batch-photos"));
    const file = new File(["blob"], "batch.jpg", { type: "image/jpeg" });

    let url = "";
    await act(async () => {
      url = await result.current.upload(file, "b1/reading.jpg");
    });

    expect(mockStorage.upload).toHaveBeenCalledWith(
      "b1/reading.jpg",
      expect.any(File),
      { upsert: true }
    );
    expect(url).toBe("https://cdn.supabase.co/bucket/custom/path.jpg");
  });

  it("returns null when user is not authenticated", async () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      loading: false,
    });

    const { result } = renderHook(() => useUpload("avatars"));
    const file = new File(["blob"], "photo.png", { type: "image/png" });

    let url = "";
    await act(async () => {
      url = await result.current.upload(file);
    });

    expect(url).toBeNull();
    expect(imageCompression).not.toHaveBeenCalled();
  });

  it("sets error on upload failure and returns null", async () => {
    const mockStorage = {
      upload: vi.fn(() => Promise.resolve({ error: { message: "Storage full" } })),
      getPublicUrl: vi.fn(),
    };
    (supabase.storage.from as ReturnType<typeof vi.fn>).mockReturnValue(mockStorage);

    const { result } = renderHook(() => useUpload("avatars"));
    const file = new File(["blob"], "photo.png", { type: "image/png" });

    let url = "";
    await act(async () => {
      url = await result.current.upload(file);
    });

    expect(url).toBeNull();
    await waitFor(() => expect(result.current.error).toBe("Storage full"));
  });

  it("sets error on compression failure", async () => {
    (imageCompression as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Image too large")
    );

    const { result } = renderHook(() => useUpload("avatars"));
    const file = new File(["blob"], "photo.png", { type: "image/png" });

    let url = "";
    await act(async () => {
      url = await result.current.upload(file);
    });

    expect(url).toBeNull();
    await waitFor(() => expect(result.current.error).toBe("Image too large"));
  });
});
