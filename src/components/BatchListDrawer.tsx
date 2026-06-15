import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Menu } from "lucide-react";
import { LIFECYCLE_ORDER, LIFECYCLE_LABELS, LifecycleStatus } from "@/lib/lifecycle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Batch {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface BatchListDrawerProps {
  batches: Batch[];
  selectedBatchId?: string;
}

const typeColors: Record<string, string> = {
  beer: "text-copper",
  kombucha: "text-teal",
  mead: "text-gold",
  cider: "text-copper",
  sourdough: "text-gold",
  ferment: "text-teal",
};

function BatchListItem({
  batch,
  isSelected,
  onClick,
}: {
  batch: Batch;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
        isSelected
          ? "bg-copper/20 text-copper-foreground"
          : "hover:bg-muted/50 text-foreground"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{batch.name}</span>
          <span className={`text-xs capitalize ${typeColors[batch.type] || "text-muted-foreground"}`}>
            {batch.type}
          </span>
        </div>
      </div>
      <ChevronRight
        size={16}
        className={`shrink-0 ${isSelected ? "text-copper" : "text-muted-foreground group-hover:text-foreground"} transition-colors`}
      />
    </button>
  );
}

function BatchListContent({
  batches,
  selectedBatchId,
  onSelect,
}: {
  batches: Batch[];
  selectedBatchId?: string;
  onSelect: (id: string) => void;
}) {
  // Group batches by lifecycle stage
  const batchesByStage = LIFECYCLE_ORDER.reduce(
    (acc, stage) => {
      acc[stage] = batches.filter((b) => b.status === stage);
      return acc;
    },
    {} as Record<LifecycleStatus, Batch[]>
  );

  // Only show stages that have batches
  const activeStages = LIFECYCLE_ORDER.filter(
    (stage) => batchesByStage[stage].length > 0
  );

  if (activeStages.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No batches yet
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {activeStages.map((stage) => {
        const stageBatches = batchesByStage[stage];
        return (
          <div key={stage} className="mb-4">
            <div className="px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {LIFECYCLE_LABELS[stage]} ({stageBatches.length})
              </span>
            </div>
            <div className="space-y-1 px-2">
              {stageBatches.map((batch) => (
                <BatchListItem
                  key={batch.id}
                  batch={batch}
                  isSelected={batch.id === selectedBatchId}
                  onClick={() => onSelect(batch.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Combined BatchListDrawer component that handles both mobile (Sheet) and desktop (sidebar)
function BatchListDrawer({ batches, selectedBatchId }: BatchListDrawerProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id: string) => {
    navigate(`/batch/${id}`);
  };

  return (
    <>
      {/* Mobile: Sheet drawer trigger */}
      <div className="xl:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Open batch list"
            >
              <Menu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:max-w-[280px] flex flex-col">
            <SheetHeader className="shrink-0">
              <SheetTitle className="font-slab flex items-center gap-2">
                Batches
              </SheetTitle>
            </SheetHeader>
            <BatchListContent
              batches={batches}
              selectedBatchId={selectedBatchId}
              onSelect={(id) => {
                handleSelect(id);
                setMobileOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Fixed sidebar */}
      <aside className="hidden xl:flex flex-col w-[280px] shrink-0 border-r border-border/50 h-full">
        <div className="px-4 py-4 border-b border-border/50">
          <h2 className="font-slab font-semibold text-base">Batches</h2>
        </div>
        <BatchListContent
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelect={handleSelect}
        />
      </aside>
    </>
  );
}

export default BatchListDrawer;