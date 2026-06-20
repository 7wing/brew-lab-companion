/**
 * Shared lifecycle stage definitions for batch grouping.
 */

export type LifecycleStatus = 
  | "brew_day" 
  | "fermenting" 
  | "conditioning" 
  | "packaging"
  | "batch_shelf";

export const LIFECYCLE_ORDER: LifecycleStatus[] = [
  "brew_day",
  "fermenting",
  "conditioning",
  "packaging",
  "batch_shelf",
];

export const LIFECYCLE_LABELS: Record<LifecycleStatus, string> = {
  brew_day: "Brew day",
  fermenting: "Active fermentation",
  conditioning: "Conditioning",
  packaging: "Packaging",
  batch_shelf: "Batch shelf",
};