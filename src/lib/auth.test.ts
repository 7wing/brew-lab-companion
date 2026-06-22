import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "./supabase";
import { signUp, signIn, signOut, signInWithGoogle, signInWithApple } from "./auth";

vi.mock("./supabase", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    from: vi.fn(() => ({
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

describe("auth helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signUp", () => {
    it("returns data on success and upserts profile", async () => {
      const mockUser = { id: "u1", email: "test@example.com" };
      (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const result = await signUp("test@example.com", "password123");
      expect(result.user).toEqual(mockUser);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(supabase.from).toHaveBeenCalledWith("profiles");
    });

    it("throws if signUp returns an error", async () => {
      (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { user: null },
        error: new Error("Email already registered"),
      });

      await expect(signUp("test@example.com", "password123")).rejects.toThrow(
        "Email already registered"
      );
    });
  });

  describe("signIn", () => {
    it("returns session data on success", async () => {
      const mockSession = { access_token: "tok" };
      (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      const result = await signIn("test@example.com", "password123");
      expect(result.session).toEqual(mockSession);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("throws if signIn returns an error", async () => {
      (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { session: null },
        error: new Error("Invalid credentials"),
      });

      await expect(signIn("test@example.com", "badpass")).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("signOut", () => {
    it("resolves on success", async () => {
      (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ error: null });
      await expect(signOut()).resolves.toBeUndefined();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it("throws if signOut returns an error", async () => {
      (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        error: new Error("Session not found"),
      });

      await expect(signOut()).rejects.toThrow("Session not found");
    });
  });

  describe("OAuth providers", () => {
    it("signInWithGoogle calls supabase.auth.signInWithOAuth with google", async () => {
      (supabase.auth.signInWithOAuth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { url: "https://google.com/oauth" },
        error: null,
      });

      const result = await signInWithGoogle();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" })
      );
      expect(result.url).toBe("https://google.com/oauth");
    });

    it("signInWithApple calls supabase.auth.signInWithOAuth with apple", async () => {
      (supabase.auth.signInWithOAuth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: { url: "https://apple.com/oauth" },
        error: null,
      });

      const result = await signInWithApple();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "apple" })
      );
      expect(result.url).toBe("https://apple.com/oauth");
    });

    it("throws on OAuth error", async () => {
      (supabase.auth.signInWithOAuth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: null,
        error: new Error("Provider not enabled"),
      });

      await expect(signInWithGoogle()).rejects.toThrow("Provider not enabled");
    });
  });
});
