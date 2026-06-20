import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BatchListDrawer from "./BatchListDrawer";
import { useMobileBatchDrawer } from "@/hooks/useMobileBatchDrawer";
import { LIFECYCLE_LABELS } from "@/lib/lifecycle";

vi.mock("@/hooks/useMobileBatchDrawer");

const mockSetOpen = vi.fn();
const mockSetFilterStage = vi.fn();

function createWrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

const batches = [
  { id: "b1", name: "Batch #001", type: "beer", status: "fermenting" },
  { id: "b2", name: "Batch #002", type: "cider", status: "fermenting" },
  { id: "b3", name: "Batch #003", type: "mead", status: "conditioning" },
  { id: "b4", name: "Batch #004", type: "beer", status: "brew_day" },
];

describe("BatchListDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useMobileBatchDrawer as ReturnType<typeof vi.fn>).mockReturnValue({
      open: false,
      setOpen: mockSetOpen,
      toggle: vi.fn(),
      filterStage: null,
      setFilterStage: mockSetFilterStage,
    });
  });

  it("renders desktop sidebar with grouped stages", () => {
    render(<BatchListDrawer batches={batches} />, { wrapper: createWrapper });

    expect(screen.getByText("Batches")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes(LIFECYCLE_LABELS.brew_day))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes(LIFECYCLE_LABELS.fermenting))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes(LIFECYCLE_LABELS.conditioning))).toBeInTheDocument();
  });

  it("does not render empty stages", () => {
    render(<BatchListDrawer batches={batches} />, { wrapper: createWrapper });

    expect(screen.queryByText((content) => content.includes(LIFECYCLE_LABELS.packaging))).not.toBeInTheDocument();
    expect(screen.queryByText((content) => content.includes(LIFECYCLE_LABELS.batch_shelf))).not.toBeInTheDocument();
  });

  it("renders batches within their stages", () => {
    render(<BatchListDrawer batches={batches} />, { wrapper: createWrapper });

    expect(screen.getByText("Batch #001")).toBeInTheDocument();
    expect(screen.getByText("Batch #002")).toBeInTheDocument();
    expect(screen.getByText("Batch #003")).toBeInTheDocument();
    expect(screen.getByText("Batch #004")).toBeInTheDocument();
  });

  it("navigates when a batch is clicked", () => {
    render(<BatchListDrawer batches={batches} />, { wrapper: createWrapper });

    const batchButton = screen.getByText("Batch #001").closest("button");
    expect(batchButton).toBeInTheDocument();
    if (batchButton) {
      fireEvent.click(batchButton);
    }

    expect(batchButton).toBeInTheDocument();
  });

  it("shows empty state when no batches", () => {
    render(<BatchListDrawer batches={[]} />, { wrapper: createWrapper });

    expect(screen.getByText("No batches yet")).toBeInTheDocument();
  });

  it("filters mobile drawer to single stage when filterStage is set", () => {
    (useMobileBatchDrawer as ReturnType<typeof vi.fn>).mockReturnValue({
      open: true,
      setOpen: mockSetOpen,
      toggle: vi.fn(),
      filterStage: "fermenting",
      setFilterStage: mockSetFilterStage,
    });

    render(<BatchListDrawer batches={batches} />, { wrapper: createWrapper });

    // The "Show all stages" button only appears in the filtered mobile drawer
    expect(screen.getByText("Show all stages")).toBeInTheDocument();

    // Since both mobile dialog (portal) and desktop sidebar are in DOM,
    // count stage headers: filtered mobile shows 1 stage, desktop shows 3 stages
    // Total "Active fermentation" headers should be 2 (1 mobile + 1 desktop)
    // while other stage headers only appear in desktop
    const allStageHeaders = screen.queryAllByText((content) =>
      content.includes(LIFECYCLE_LABELS.fermenting)
    );
    expect(allStageHeaders.length).toBe(2);

    // Batches from non-fermenting stages should only appear once (desktop sidebar only)
    expect(screen.getAllByText("Batch #003").length).toBe(1);
    expect(screen.getAllByText("Batch #004").length).toBe(1);

    // Fermenting batches appear in both mobile and desktop
    expect(screen.getAllByText("Batch #001").length).toBe(2);
    expect(screen.getAllByText("Batch #002").length).toBe(2);
  });

  it("clears filter when 'Show all stages' is clicked", () => {
    (useMobileBatchDrawer as ReturnType<typeof vi.fn>).mockReturnValue({
      open: true,
      setOpen: mockSetOpen,
      toggle: vi.fn(),
      filterStage: "fermenting",
      setFilterStage: mockSetFilterStage,
    });

    render(<BatchListDrawer batches={batches} />, { wrapper: createWrapper });

    const clearButton = screen.getByText("Show all stages");
    fireEvent.click(clearButton);

    expect(mockSetFilterStage).toHaveBeenCalledWith(null);
  });

  it("clears filter when mobile drawer closes", async () => {
    (useMobileBatchDrawer as ReturnType<typeof vi.fn>).mockReturnValue({
      open: false,
      setOpen: mockSetOpen,
      toggle: vi.fn(),
      filterStage: "fermenting",
      setFilterStage: mockSetFilterStage,
    });

    render(<BatchListDrawer batches={batches} />, { wrapper: createWrapper });

    await waitFor(() => {
      expect(mockSetFilterStage).toHaveBeenCalledWith(null);
    });
  });
});
