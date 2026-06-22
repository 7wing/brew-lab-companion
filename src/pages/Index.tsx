import { useState } from "react";
import {
  FlaskConical,
  Calendar,
  Beaker,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Droplets,
} from "lucide-react";
import SpeedFAB from "@/components/SpeedFAB";
import { Link } from "react-router-dom";
import BatchCard from "@/components/BatchCard";
import BatchListDrawer from "@/components/BatchListDrawer";
import { useBatches } from "@/hooks/useBatches";
import { useAllReadings } from "@/hooks/useReadings";
import { useMobileBatchDrawer } from "@/hooks/useMobileBatchDrawer";
import { BREW } from "@/constants/copy";
import { LIFECYCLE_ORDER, LIFECYCLE_LABELS, LifecycleStatus } from "@/lib/lifecycle";

function daysSince(start: string) {
  const diff = Date.now() - new Date(start).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function nextAction(batch: any): string | undefined {
  const stages = (batch.batch_stages ?? []) as Array<{
    name: string;
    scheduled: string | null;
    completed: boolean;
  }>;
  const pending = stages
    .filter((s) => !s.completed)
    .sort((a, b) => (a.scheduled ?? "").localeCompare(b.scheduled ?? ""));
  return pending[0]?.name;
}

function checklistProgress(batch: any): number {
  const stages = (batch.batch_stages ?? []) as Array<{ completed: boolean }>;
  if (stages.length === 0) return 0;
  const completed = stages.filter((s) => s.completed).length;
  return (completed / stages.length) * 100;
}

interface UpcomingStage {
  name: string;
  scheduled: string | null;
  completed: boolean;
  batchName: string;
  batchType: string;
  batchId: string;
}

function getUrgencyLevel(scheduled: string | null): "overdue" | "today" | "upcoming" {
  if (!scheduled) return "upcoming";
  const today = new Date().toISOString().split("T")[0];
  if (scheduled < today) return "overdue";
  if (scheduled === today) return "today";
  return "upcoming";
}

function sortByUrgency(items: UpcomingStage[]): UpcomingStage[] {
  return [...items].sort((a, b) => {
    const urgencyOrder = { overdue: 0, today: 1, upcoming: 2 };
    const aLevel = urgencyOrder[getUrgencyLevel(a.scheduled)];
    const bLevel = urgencyOrder[getUrgencyLevel(b.scheduled)];
    if (aLevel !== bLevel) return aLevel - bLevel;
    return (a.scheduled ?? "").localeCompare(b.scheduled ?? "");
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function UrgencyDot({ level }: { level: "overdue" | "today" | "upcoming" }) {
  if (level === "overdue")
    return <span className="inline-block w-2 h-2 rounded-full bg-red-400 shrink-0" />;
  if (level === "today")
    return <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shrink-0" />;
  return <span className="inline-block w-2 h-2 rounded-full bg-teal shrink-0" />;
}

const Index = () => {
  const { data: batches, isLoading } = useBatches();
  const { data: allReadings } = useAllReadings(5);
  const { setOpen, setFilterStage } = useMobileBatchDrawer();

  // Build upcoming actions from all batch stages
  const upcomingActions = sortByUrgency(
    (batches ?? []).flatMap((b: any) =>
      (b.batch_stages ?? [])
        .filter((s: any) => !s.completed && s.scheduled)
        .map((s: any) => ({
          ...s,
          batchName: b.name,
          batchType: b.type,
          batchId: b.id,
        }))
    )
  );

  // Group batches by lifecycle status
  const batchesByStage = LIFECYCLE_ORDER.reduce(
    (acc, stage) => {
      acc[stage] = (batches ?? []).filter((b: any) => b.status === stage);
      return acc;
    },
    {} as Record<LifecycleStatus, any[]>
  );

  // Check if there are any active batches
  const hasActiveBatches = LIFECYCLE_ORDER.some(
    (stage) => batchesByStage[stage].length > 0
  );

  // Get recent completed batches for fallback
  const recentCompletedBatches = (batches ?? [])
    .filter((b: any) =>
      ["completed", "finished", "batch_shelf"].includes(b.status)
    )
    .slice(0, 3);

  function handleViewAll(stage: LifecycleStatus) {
    setFilterStage(stage);
    setOpen(true);
  }

  return (
    <div className="animate-fade-in">
      {/* ─── Mobile upcoming actions strip ─── */}
      {upcomingActions.length > 0 && (
        <div className="xl:hidden glass-panel rounded-xl p-4 mb-6">
          <h2 className="font-slab font-semibold text-sm mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-teal" />
            {BREW.upcomingActions}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {upcomingActions.slice(0, 6).map((action, i) => {
              const urgency = getUrgencyLevel(action.scheduled);
              return (
                <Link
                  key={i}
                  to={`/batch/${action.batchId}`}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:-translate-y-0.5 ${
                    urgency === "overdue"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : urgency === "today"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-muted/50 text-muted-foreground border border-border/50"
                  }`}
                >
                  {urgency === "overdue" ? (
                    <AlertCircle size={14} className="text-red-400" />
                  ) : urgency === "today" ? (
                    <Clock size={14} className="text-amber-400" />
                  ) : (
                    <CheckCircle2 size={14} className="text-teal" />
                  )}
                  <span>{action.name}</span>
                  <span className="text-muted-foreground/70">·</span>
                  <span className="font-mono">{action.batchName}</span>
                  {action.scheduled && (
                    <>
                      <span className="text-muted-foreground/70">·</span>
                      <span className="font-mono">
                        {formatDate(action.scheduled)}
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Main 3-column layout (sidebar | main | right panel) ─── */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Batch sidebar — hidden on mobile, visible on xl+ */}
        <BatchListDrawer batches={batches ?? []} />

        {/* Main content area */}
        <section className="flex-1 space-y-8 min-w-0">
          {isLoading ? (
            <>
              {LIFECYCLE_ORDER.map((stage) => (
                <div key={stage}>
                  <div className="h-6 w-32 bg-muted/50 rounded animate-pulse mb-4" />
                  <div className="flex gap-4 overflow-x-auto">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="min-w-[260px] h-48 bg-muted/30 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : !hasActiveBatches ? (
            /* Fallback: No active batches */
            <div className="glass-panel rounded-xl p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Beaker size={32} className="text-muted-foreground" />
                </div>
                <h2 className="font-slab text-xl font-semibold mb-2">
                  Nothing brewing right now
                </h2>
                <p className="text-muted-foreground text-sm">
                  Start a new batch to begin your fermentation journey.
                </p>
              </div>

              {recentCompletedBatches.length > 0 && (
                <div className="mt-8 text-left">
                  <h3 className="font-slab font-semibold text-sm mb-4 text-muted-foreground">
                    Recent batches
                  </h3>
                  <div className="space-y-2">
                    {recentCompletedBatches.map((batch: any) => (
                      <Link
                        key={batch.id}
                        to={`/batch/${batch.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-copper/10 flex items-center justify-center">
                          <Droplets size={16} className="text-copper" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {batch.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {batch.type} · {batch.og?.toFixed(3) ?? "—"} OG
                          </p>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-muted-foreground"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Lifecycle Sections */
            LIFECYCLE_ORDER.map((stage) => {
              const stageBatches = batchesByStage[stage];
              if (stageBatches.length === 0) return null;

              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-slab text-lg font-semibold">
                      {LIFECYCLE_LABELS[stage]}
                    </h2>
                    {stageBatches.length > 2 && (
                      <button
                        onClick={() => handleViewAll(stage)}
                        className="text-sm text-copper hover:text-copper/80 transition-colors flex items-center gap-1"
                      >
                        View all {stageBatches.length} {LIFECYCLE_LABELS[stage].toLowerCase()}
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory xl:grid xl:grid-cols-2 xl:overflow-visible">
                    {stageBatches.slice(0, 2).map((batch: any) => (
                      <div key={batch.id} className="snap-start shrink-0 xl:shrink">
                        <BatchCard
                          id={batch.id}
                          name={batch.name}
                          type={batch.type}
                          status={batch.status}
                          gravity={batch.og ?? 1.0}
                          targetGravity={batch.target_fg ?? 1.0}
                          daysElapsed={daysSince(batch.start_date)}
                          totalDays={batch.target_days}
                          nextAction={nextAction(batch)}
                          style={batch.recipe?.title ?? undefined}
                          checklistProgress={batch.status === "brew_day" ? checklistProgress(batch) : undefined}
                          conditioningMethod={batch.conditioning_method ?? undefined}
                          packagingMethod={batch.packaging_method ?? undefined}
                          estimatedCompletion={batch.estimated_completion ? formatDate(batch.estimated_completion) : undefined}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Right panel — upcoming actions (desktop) + recent readings */}
        <aside className="w-full xl:w-[280px] shrink-0 space-y-4">
          {/* Desktop upcoming actions */}
          {upcomingActions.length > 0 && (
            <div className="hidden xl:block glass-panel rounded-xl p-4">
              <h2 className="font-slab font-semibold text-sm mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-teal" />
                {BREW.upcomingActions}
              </h2>
              <div className="space-y-2">
                {upcomingActions.slice(0, 5).map((action, i) => {
                  const urgency = getUrgencyLevel(action.scheduled);
                  return (
                    <Link
                      key={i}
                      to={`/batch/${action.batchId}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                    >
                      <UrgencyDot level={urgency} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {action.name} — {action.batchName}
                        </p>
                        {action.scheduled && (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(action.scheduled)}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Readings */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h3 className="font-slab font-semibold text-sm flex items-center gap-2">
                <Droplets size={16} className="text-copper" />
                {BREW.recentReadings}
              </h3>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
                ))}
              </div>
            ) : (allReadings ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center">
                No readings yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                        SG
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                        °F
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                        pH
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        Batch
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(allReadings ?? []).map((r: any, idx: number) => (
                      <tr
                        key={r.id}
                        className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-medium">
                          {r.read_at
                            ? formatDate(r.read_at)
                            : "—"}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-mono ${idx === 0 ? "text-copper font-semibold" : ""}`}>
                          {Number(r.gravity).toFixed(3)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {r.temp_f ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right">{r.ph ?? "—"}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[80px] truncate">
                          {r.batch?.name ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Speed FAB */}
      <SpeedFAB />
    </div>
  );
};

export default Index;
