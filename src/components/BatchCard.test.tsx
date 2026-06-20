import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BatchCard from "./BatchCard";

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("BatchCard", () => {
  it("renders fermentation card with gravity and progress", () => {
    render(
      <BatchCard
        id="b1"
        name="Batch #001"
        type="beer"
        gravity={1.045}
        targetGravity={1.01}
        daysElapsed={5}
        totalDays={14}
        status="fermenting"
      />,
      { wrapper }
    );

    expect(screen.getByText("Batch #001")).toBeInTheDocument();
    expect(screen.getByText("beer")).toBeInTheDocument();
    expect(screen.getByText("1.045")).toBeInTheDocument();
    expect(screen.getByText("5d")).toBeInTheDocument();
    expect(screen.getByText("/ 14d")).toBeInTheDocument();
  });

  it("renders brew day card with checklist progress", () => {
    render(
      <BatchCard
        id="b2"
        name="Batch #002"
        type="cider"
        status="brew_day"
        checklistProgress={65}
      />,
      { wrapper }
    );

    expect(screen.getByText("Batch #002")).toBeInTheDocument();
    expect(screen.getByText("cider")).toBeInTheDocument();
    expect(screen.getByText("Brew day checklist")).toBeInTheDocument();
    expect(screen.getByText("65% complete")).toBeInTheDocument();
  });

  it("renders brew day card gracefully when checklist progress is missing", () => {
    render(
      <BatchCard
        id="b3"
        name="Batch #003"
        type="mead"
        status="brew_day"
      />,
      { wrapper }
    );

    expect(screen.getByText("Batch #003")).toBeInTheDocument();
    expect(screen.getByText("Brew day checklist")).toBeInTheDocument();
    expect(screen.getByText("Checklist not started")).toBeInTheDocument();
  });

  it("renders conditioning card with method and days remaining", () => {
    render(
      <BatchCard
        id="b4"
        name="Batch #004"
        type="beer"
        status="conditioning"
        conditioningMethod="Cold crash"
        daysElapsed={2}
        totalDays={7}
      />,
      { wrapper }
    );

    expect(screen.getByText("Batch #004")).toBeInTheDocument();
    expect(screen.getByText("Cold crash")).toBeInTheDocument();
    expect(screen.getByText("5d")).toBeInTheDocument();
    expect(screen.getByText("remaining")).toBeInTheDocument();
  });

  it("renders conditioning card gracefully when method is missing", () => {
    render(
      <BatchCard
        id="b5"
        name="Batch #005"
        type="kombucha"
        status="conditioning"
        daysElapsed={1}
        totalDays={3}
      />,
      { wrapper }
    );

    expect(screen.getByText("Batch #005")).toBeInTheDocument();
    expect(screen.getByText("2d")).toBeInTheDocument();
    expect(screen.queryByText("Cold crash")).not.toBeInTheDocument();
  });

  it("renders packaging card with method and estimated completion", () => {
    render(
      <BatchCard
        id="b6"
        name="Batch #006"
        type="sourdough"
        status="packaging"
        packagingMethod="Bottle"
        estimatedCompletion="Jun 30"
      />,
      { wrapper }
    );

    expect(screen.getByText("Batch #006")).toBeInTheDocument();
    expect(screen.getByText("Bottle")).toBeInTheDocument();
    expect(screen.getByText("Jun 30")).toBeInTheDocument();
  });

  it("renders packaging card gracefully when method or completion is missing", () => {
    render(
      <BatchCard
        id="b7"
        name="Batch #007"
        type="beer"
        status="packaging"
      />,
      { wrapper }
    );

    expect(screen.getByText("Batch #007")).toBeInTheDocument();
    expect(screen.queryByText("Bottle")).not.toBeInTheDocument();
    expect(screen.queryByText("Est. completion:")).not.toBeInTheDocument();
  });

  it("falls back to fermentation display for unknown status", () => {
    render(
      <BatchCard
        id="b8"
        name="Batch #008"
        type="beer"
        gravity={1.05}
        targetGravity={1.01}
        daysElapsed={3}
        totalDays={10}
      />,
      { wrapper }
    );

    expect(screen.getByText("Batch #008")).toBeInTheDocument();
    expect(screen.getByText("1.050")).toBeInTheDocument();
    expect(screen.getByText("3d")).toBeInTheDocument();
  });

  it("links to the batch detail page", () => {
    render(
      <BatchCard
        id="batch-123"
        name="Batch #123"
        type="beer"
        status="fermenting"
      />,
      { wrapper }
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/batch/batch-123");
  });
});
