import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RecipeDetail from "./RecipeDetail";
import {
  useRecipe,
  useRecipeStages,
  useUpdateRecipe,
  useDeleteRecipe,
  useCreateRecipe,
} from "@/hooks/useRecipes";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/hooks/useRecipes", () => ({
  useRecipe: vi.fn(),
  useRecipeStages: vi.fn(),
  useUpdateRecipe: vi.fn(),
  useDeleteRecipe: vi.fn(),
  useCreateRecipe: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", email: "test@example.com" } }),
}));

vi.mock("sonner", () => ({
  toast: {
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

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockRecipe = (overrides: any = {}) => ({
  id: "r1",
  title: "Test IPA",
  type: "beer",
  style: "IPA",
  description: "A hoppy IPA.",
  ingredients: { malts: ["Pale Malt"], hops: ["Citra"] },
  steps: [{ step: 1, instruction: "Mash at 152F" }],
  abv: 6.5,
  ibu: 45,
  srm: 8,
  target_og: 1.065,
  target_fg: 1.01,
  estimated_days: 14,
  batch_size: 5,
  difficulty: 2,
  target_temp_f: 65,
  yeast_strain: "Wyeast 1056",
  star_rating: 4,
  starred: false,
  curated: false,
  forked_from: null,
  user_id: "u2",
  profiles: {
    username: "brewer2",
    display_name: "Brewer Two",
    avatar_url: null,
  },
  ...overrides,
});

const defaultMocks = () => {
  vi.mocked(useRecipe).mockReturnValue({
    data: mockRecipe(),
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useRecipeStages).mockReturnValue({
    data: [
      { id: "s1", recipe_id: "r1", day: 0, action: "Pitch yeast", notes: "At 65F", sort_order: 0 },
      { id: "s2", recipe_id: "r1", day: 3, action: "Check gravity", notes: "", sort_order: 0 },
    ],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useUpdateRecipe).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);

  vi.mocked(useDeleteRecipe).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);

  vi.mocked(useCreateRecipe).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({ id: "r2" }),
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);
};

const renderRecipeDetail = () => {
  defaultMocks();
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={["/recipe/r1"]}>
        <Routes>
          <Route path="/recipe/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("RecipeDetail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it("renders loading state", () => {
    vi.mocked(useRecipe).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
      isPending: true,
      status: "pending",
      refetch: vi.fn(),
    } as any);
    vi.mocked(useRecipeStages).mockReturnValue({
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
        <MemoryRouter initialEntries={["/recipe/r1"]}>
          <Routes>
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders not found state", () => {
    vi.mocked(useRecipe).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);
    vi.mocked(useRecipeStages).mockReturnValue({
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
        <MemoryRouter initialEntries={["/recipe/r1"]}>
          <Routes>
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Recipe not found.")).toBeInTheDocument();
  });

  it("renders recipe title, style, and stats", () => {
    renderRecipeDetail();
    expect(screen.getByText("Test IPA")).toBeInTheDocument();
    expect(screen.getByText("IPA")).toBeInTheDocument();
    const abvSpans = screen.getAllByText("ABV");
    const statsRow = abvSpans[0].closest("div") as HTMLElement;
    expect(within(statsRow).getByText("6.5%")).toBeInTheDocument();
    expect(within(statsRow).getByText("45")).toBeInTheDocument();
  });

  it("shows author avatar initial when no avatar_url", () => {
    renderRecipeDetail();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("@brewer2")).toBeInTheDocument();
  });

  it("shows author avatar image when avatar_url exists", () => {
    vi.mocked(useRecipe).mockReturnValue({
      data: mockRecipe({
        profiles: {
          username: "brewer2",
          display_name: "Brewer Two",
          avatar_url: "https://example.com/avatar.png",
        },
      }),
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
        <MemoryRouter initialEntries={["/recipe/r1"]}>
          <Routes>
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const img = screen.getByAltText("brewer2") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://example.com/avatar.png");
  });

  it("does not show author info when user is owner", () => {
    vi.mocked(useRecipe).mockReturnValue({
      data: mockRecipe({ user_id: "u1" }),
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
        <MemoryRouter initialEntries={["/recipe/r1"]}>
          <Routes>
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.queryByText("@brewer2")).not.toBeInTheDocument();
  });

  it("renders star rating", () => {
    renderRecipeDetail();
    expect(screen.getByLabelText("4 out of 5 stars")).toBeInTheDocument();
  });

  it("calls updateRecipe on save toggle", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    vi.mocked(useUpdateRecipe).mockReturnValue({
      mutateAsync,
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as any);

    vi.mocked(useRecipe).mockReturnValue({
      data: mockRecipe(),
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    vi.mocked(useRecipeStages).mockReturnValue({
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
        <MemoryRouter initialEntries={["/recipe/r1"]}>
          <Routes>
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ id: "r1", starred: true });
    });
  });

  it("calls deleteRecipe and navigates on delete", async () => {
    const deleteMutate = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useDeleteRecipe).mockReturnValue({
      mutateAsync: deleteMutate,
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as any);

    vi.mocked(useRecipe).mockReturnValue({
      data: mockRecipe({ user_id: "u1" }),
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    vi.mocked(useRecipeStages).mockReturnValue({
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
        <MemoryRouter initialEntries={["/recipe/r1"]}>
          <Routes>
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // More options button has no accessible text; use aria-haspopup to locate it
    const moreButton = screen.getByRole("button", { name: "" });
    fireEvent.click(moreButton);

    const deleteTrigger = screen.getByText((content) => content.includes("Delete"));
    fireEvent.click(deleteTrigger);

    const confirmDelete = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(confirmDelete);

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith("r1");
      expect(mockNavigate).toHaveBeenCalledWith("/recipes");
    });
  });

  it("forks recipe and navigates to new recipe", async () => {
    const createMutate = vi.fn().mockResolvedValue({ id: "r2" });
    vi.mocked(useCreateRecipe).mockReturnValue({
      mutateAsync: createMutate,
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as any);

    vi.mocked(useRecipe).mockReturnValue({
      data: mockRecipe(),
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    vi.mocked(useRecipeStages).mockReturnValue({
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
        <MemoryRouter initialEntries={["/recipe/r1"]}>
          <Routes>
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    const moreButton = screen.getByRole("button", { name: "" });
    fireEvent.click(moreButton);

    const forkItem = screen.getByText((content) => content.includes("Fork recipe"));
    fireEvent.click(forkItem);

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test IPA (Fork)",
          type: "beer",
          style: "IPA",
          forked_from: "r1",
          is_public: true,
          moderation_status: "pending",
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/recipe/r2");
    });
  });

  it("shows fermentation schedule", () => {
    renderRecipeDetail();
    expect(screen.getByText("Fermentation Schedule")).toBeInTheDocument();
    expect(screen.getByText("Pitch yeast")).toBeInTheDocument();
    expect(screen.getByText("Check gravity")).toBeInTheDocument();
  });

  it("has a desktop Brew this button in the top action bar", () => {
    renderRecipeDetail();
    const links = screen.getAllByRole("link", { name: /Brew this/i });
    const desktopBrew = links.find((el) => el.classList.contains("hidden") && el.classList.contains("md:flex"));
    expect(desktopBrew).toBeDefined();
    expect(desktopBrew!.getAttribute("href")).toBe("/new-brew?recipeId=r1");
  });

  it("has a mobile-only primary Brew this CTA", () => {
    renderRecipeDetail();
    const ctas = screen.getAllByRole("link", { name: /Brew this/i });
    const primaryCta = ctas.find((el) => el.classList.contains("md:hidden"));
    expect(primaryCta).toBeDefined();
  });

  it("shows target numbers", () => {
    renderRecipeDetail();
    expect(screen.getByText("Target Numbers")).toBeInTheDocument();
    const targetSection = screen.getByText("Target Numbers").closest("div") as HTMLElement;
    expect(within(targetSection).getByText("1.065")).toBeInTheDocument();
    expect(within(targetSection).getByText("1.010")).toBeInTheDocument();
  });

  it("shows curated badge for curated recipes", () => {
    vi.mocked(useRecipe).mockReturnValue({
      data: mockRecipe({ curated: true, profiles: null }),
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
        <MemoryRouter initialEntries={["/recipe/r1"]}>
          <Routes>
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Curated")).toBeInTheDocument();
  });

  it("shows forked badge for forked recipes", () => {
    vi.mocked(useRecipe).mockReturnValue({
      data: mockRecipe({ forked_from: "r0" }),
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
        <MemoryRouter initialEntries={["/recipe/r1"]}>
          <Routes>
            <Route path="/recipe/:id" element={<RecipeDetail />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Forked")).toBeInTheDocument();
  });
});
