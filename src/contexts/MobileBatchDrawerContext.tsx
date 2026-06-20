import { createContext, useState, useCallback } from "react";
import { LifecycleStatus } from "@/lib/lifecycle";

interface MobileBatchDrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  filterStage: LifecycleStatus | null;
  setFilterStage: (stage: LifecycleStatus | null) => void;
}

export const MobileBatchDrawerContext = createContext<MobileBatchDrawerContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
  filterStage: null,
  setFilterStage: () => {},
});

export function MobileBatchDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [filterStage, setFilterStage] = useState<LifecycleStatus | null>(null);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <MobileBatchDrawerContext.Provider value={{ open, setOpen, toggle, filterStage, setFilterStage }}>
      {children}
    </MobileBatchDrawerContext.Provider>
  );
}

