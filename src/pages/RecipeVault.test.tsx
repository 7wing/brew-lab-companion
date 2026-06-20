import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RecipeVault from "./RecipeVault";
import { useRecipes, useFeaturedRecipes, useUpdateRecipe, useDeleteRecipe } from "@/hooks/useRecipes";

const mockNavigate = vi.fn();
const mockMutate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  MemoryRouter: require("react-router-dom").MemoryRouter,
}));

vi.mock("@/hooks/useRecipes", () => ({
  useRecipes: vi.fn(),
  useFeaturedRecipes: vi.fn(),
  useUpdateRecipe: vi.fn(),
  useDeleteRecipe: vi.fn(),
}));

vi.mock("@/components/ShareRecipeWizard", () => ({
  ShareRecipeWizard: ({ open }: { open: boolean }) => (
    open ? <div data-testid="share-wizard">Share Wizard</div> : null
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockRecipe = (overrides: any = {}) => ({
  id: "r1",
  title: "Test IPA",
  type: "beer",
  style: "IPA",
  abv: 6.5,
  ibu: 45,
  srm: 12,
  difficulty: 2,
  estimated_days: 14,
  star_rating: 4.2,
  starred: false,
  curated: false,
  featured: false,
  profiles: {
    username: "brewer1",
    display_name: "Brewer One",
    avatar_url: null,
  },
  ...overrides,
});

const mockFeaturedRecipe = (overrides: any = {}) =>
  mockRecipe({ id: "f1", title: "Featured Stout", featured: true, ...overrides });

const defaultMockReturnValues = () => {
  vi.mocked(useRecipes).mockReturnValue({
    data: [mockRecipe()],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useFeaturedRecipes).mockReturnValue({
    data: [mockFeaturedRecipe()],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: "success",
    refetch: vi.fn(),
  } as any);

  vi.mocked(useUpdateRecipe).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);

  vi.mocked(useDeleteRecipe).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as any);
};

const renderRecipeVault = () => {
  defaultMockReturnValues();
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <RecipeVault />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("RecipeVault page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockMutate.mockClear();
  });

  it("renders the page with search and filters", () => {
    renderRecipeVault();
    expect(screen.getByPlaceholderText("Search recipes...")).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Share Recipe")).toBeInTheDocument();
  });

  it("defaults sort to Most Brewed", () => {
    renderRecipeVault();
    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toHaveTextContent("Most Brewed");
  });

  it("sort dropdown options are in correct order", () => {
    renderRecipeVault();
    const selectTrigger = screen.getByRole("combobox");
    fireEvent.click(selectTrigger);

    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveTextContent("Most Brewed");
    expect(options[1]).toHaveTextContent("Highest Rated");
    expect(options[2]).toHaveTextContent("Newest");
    expect(options[3]).toHaveTextContent("Quickest");
  });

  it("shows Featured strip in All view", () => {
    renderRecipeVault();
    expect(screen.getByText("Featured Recipes")).toBeInTheDocument();
    expect(screen.getByText("Featured Stout")).toBeInTheDocument();
  });

  it("shows Featured strip in Curated view", () => {
    renderRecipeVault();
    const curatedButton = screen.getByRole("button", { name: "Curated" });
    fireEvent.click(curatedButton);
    expect(screen.getByText("Featured Recipes")).toBeInTheDocument();
    expect(screen.getByText("Featured Stout")).toBeInTheDocument();
  });

  it("navigates to recipe detail when clicking a recipe card", () => {
    renderRecipeVault();
    const recipeCard = screen.getByText("Test IPA").closest("[class*='cursor-pointer']") as HTMLElement;
    fireEvent.click(recipeCard);
    expect(mockNavigate).toHaveBeenCalledWith("/recipe/r1");
  });

  it("toggles star without navigating", () => {
    renderRecipeVault();
    const starButton = screen.getAllByLabelText("Toggle star")[0];
    fireEvent.click(starButton);
    expect(mockMutate).toHaveBeenCalledWith({ id: "r1", starred: true });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not show Featured badge on regular recipe cards", () => {
    renderRecipeVault();
    const recipeCards = screen.getAllByText("Test IPA");
    expect(recipeCards.length).toBeGreaterThan(0);
    const featuredBadges = screen.queryAllByText("Featured");
    // Only the Featured strip card should have "Featured"
    expect(featuredBadges.length).toBe(1);
  });

  it("passes curated filter when Curated view is active", () => {
    renderRecipeVault();
    const curatedButton = screen.getByRole("button", { name: "Curated" });
    fireEvent.click(curatedButton);

    expect(useRecipes).toHaveBeenCalledWith(
      expect.objectContaining({
        curated: true,
      })
    );
  });

  it("shows recipe name, ABV, SRM, and star rating on recipe cards", () => {
    renderRecipeVault();
    expect(screen.getByText("Test IPA")).toBeInTheDocument();
    expect(screen.getByText(/6\.5% ABV/)).toBeInTheDocument();
    expect(screen.getByText(/4\.2/)).toBeInTheDocument();
  });

  it("hides IBU, Difficulty, and Brew time on mobile with responsive classes", () => {
    renderRecipeVault();

    // Get the regular recipe card (not FeaturedCard) by finding the Test IPA card
    const testIpaCard = screen.getByText("Test IPA").closest("[class*='cursor-pointer']") as HTMLElement;
    expect(testIpaCard).toBeInTheDocument();

    const ibuElement = testIpaCard.querySelector("span.hidden.md\\:inline-flex");
    expect(ibuElement).toHaveTextContent(/45 IBU/);

    const clockElement = testIpaCard.querySelectorAll("span.hidden.md\\:inline-flex");
    const brewTimeSpan = Array.from(clockElement).find((el) => el.textContent?.includes("14d"));
    expect(brewTimeSpan).toBeInTheDocument();

    const difficultyWrapper = testIpaCard.querySelector("div.hidden.md\\:block");
    expect(difficultyWrapper).toBeInTheDocument();
  });

  it("shows submitted-by/curated line only on desktop", () => {
    renderRecipeVault();
    const curatedLine = screen.getByText(/@ brewer1/).closest("div");
    expect(curatedLine).toHaveClass("hidden", "md:flex");
  });

  it("shows curated badge for curated recipes on desktop", () => {
    vi.mocked(useRecipes).mockReturnValue({
      data: [mockRecipe({ curated: true, profiles: null })],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      status: "success",
      refetch: vi.fn(),
    } as any);

    vi.mocked(useFeaturedRecipes).mockReturnValue({
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
          <RecipeVault />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Find the curated badge inside the recipe card, not the toggle button
    const recipeCard = screen.getByText("Test IPA").closest("[class*='cursor-pointer']") as HTMLElement;
    const curatedBadge = recipeCard.querySelector("span.text-gold.font-semibold");
    expect(curatedBadge).toHaveTextContent("Curated");
    expect(curatedBadge?.closest("div")).toHaveClass("hidden", "md:flex");
  });
});
