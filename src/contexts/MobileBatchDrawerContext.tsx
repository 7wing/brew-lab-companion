import { createContext, useState, useCallback } from "react";

interface MobileBatchDrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const MobileBatchDrawerContext = createContext<MobileBatchDrawerContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function MobileBatchDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <MobileBatchDrawerContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </MobileBatchDrawerContext.Provider>
  );
}

