import { useContext } from "react";
import { MobileBatchDrawerContext } from "@/contexts/MobileBatchDrawerContext";

export function useMobileBatchDrawer() {
  return useContext(MobileBatchDrawerContext);
}
