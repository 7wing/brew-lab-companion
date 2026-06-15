import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  Share2,
  MessageSquare,
  Plus,
  Droplets,
  Thermometer,
  FlaskConical,
  Loader2,
  MoreHorizontal,
  Edit2,
  Trash2,
  Star,
  Check,
  AlertTriangle,
  Beer,
  Package,
  BarChart3,
  Calendar,
  Clock,
  Wind,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import GravityCurve from "@/components/GravityCurve";
import ReadingsTable from "@/components/ReadingsTable";
import { useBatch } from "@/hooks/useBatches";
import { useReadings, useCreateReading } from "@/hooks/useReadings";
import { useUpload } from "@/hooks/useUpload";
import { useCreatePost } from "@/hooks/usePosts";
import { useCreateTastingNote, useTastingSessions } from "@/hooks/useTastingNotes";
import { useDeleteBatch } from "@/hooks/useDeleteBatch";
import { useUpdateBatchStage } from "@/hooks/useUpdateBatchStage";
import { LIFECYCLE_ORDER, LIFECYCLE_LABELS, type LifecycleStatus } from "@/lib/lifecycle";
import { ACTIONS, BREW } from "@/constants/copy";

const BatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: batch, isLoading: batchLoading } = useBatch(id);
  const { data: readings, isLoading: readingsLoading } = useReadings(id);
  const createReading = useCreateReading();
  const { upload: uploadPhoto, uploading: photoUploading } = useUpload("batch-photos");
  const createPost = useCreatePost();
  const createTastingNote = useCreateTastingNote();
  const tastingSession = useTastingSessions(id);
  const updateBatchStage = useUpdateBatchStage();
  const deleteBatch = useDeleteBatch();

  const [logOpen, setLogOpen] = useState(false);
  const [tastingOpen, setTastingOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [stageConfirmOpen, setStageConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [logGravity, setLogGravity] = useState("");
  const [logTemp, setLogTemp] = useState("");
  const [logPh, setLogPh] = useState("");
  const [logNotes, setLogNotes] = useState("");

  const [tastingAroma, setTastingAroma] = useState("");
  const [tastingFlavor, setTastingFlavor] = useState("");
  const [tastingMouthfeel, setTastingMouthfeel] = useState("");
  const [tastingOverall, setTastingOverall] = useState("");

  const [shareTitle, setShareTitle] = useState("");
  const [shareContent, setShareContent] = useState("");

  // Stage-specific edit state
  const [clarityNotes, setClarityNotes] = useState(batch?.notes ?? "");
  const [packageVolume, setPackageVolume] = useState(batch?.volume ? String(batch.volume) : "");
  const [tastingNotesText, setTastingNotesText] = useState("");
  const [starRating, setStarRating] = useState(batch?.star_rating ?? 0);

  if (batchLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-8 w-32 bg-muted/50 rounded animate-pulse" />
        <div className="h-40 bg-muted/50 rounded-xl animate-pulse" />
        <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Brew Bench
        </Link>
        <h1 className="font-slab text-2xl font-bold">Batch not found</h1>
      </div>
    );
  }

  const currentStatus: LifecycleStatus = (batch.status as LifecycleStatus) ?? "brew_day";
  const currentStageIndex = LIFECYCLE_ORDER.indexOf(currentStatus);
  const nextStage: LifecycleStatus | null = LIFECYCLE_ORDER[currentStageIndex + 1] ?? null;
  const nextStageLabel = nextStage ? LIFECYCLE_LABELS[nextStage] : null;

  const latestReading = readings?.[0] ?? null;
  const og = batch.og ?? 1.05;
  const currentGravity = latestReading?.gravity ?? og;
  const estAbv = ((og - currentGravity) * 131.25).toFixed(1);
  const daysElapsed = Math.max(
    0,
    Math.floor((Date.now() - new Date(batch.start_date).getTime()) / (1000 * 60 * 60 * 24))
  );

  // SRM colour swatch
  const srmToColor = (srm: number | null) => {
    if (!srm) return "bg-amber-200";
    if (srm < 4) return "bg-yellow-200";
    if (srm < 8) return "bg-amber-300";
    if (srm < 12) return "bg-amber-500";
    if (srm < 17) return "bg-amber-700";
    if (srm < 22) return "bg-red-800";
    if (srm < 27) return "bg-red-950";
    if (srm < 35) return "bg-black";
    return "bg-black";
  };

  async function handleLogReading() {
    if (!id) return;
    try {
      await createReading.mutateAsync({
        batch_id: id,
        gravity: parseFloat(logGravity) || og,
        temp_f: logTemp ? parseFloat(logTemp) : null,
        ph: logPh ? parseFloat(logPh) : null,
        notes: logNotes || null,
      });
      setLogOpen(false);
      setLogGravity("");
      setLogTemp("");
      setLogPh("");
      setLogNotes("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to log reading");
    }
  }

  async function handleTastingNote() {
    if (!id) return;
    try {
      const session = await tastingSession.createSession(`${batch.name} Tasting`);
      await createTastingNote.mutateAsync({
        sessionId: session.id,
        aroma: tastingAroma,
        flavor: tastingFlavor,
        mouthfeel: tastingMouthfeel,
        overall: tastingOverall,
      });
      setTastingOpen(false);
      setTastingAroma("");
      setTastingFlavor("");
      setTastingMouthfeel("");
      setTastingOverall("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save tasting note");
    }
  }

  async function handleShare() {
    if (!id) return;
    try {
      await createPost.mutateAsync({
        category: "tasting",
        title: shareTitle || `${batch.name} — Tasting Notes`,
        content:
          shareContent ||
          `Sharing my progress on ${batch.name}. Day ${daysElapsed} of ${batch.target_days}.`,
        type: batch.type,
      });
      setShareOpen(false);
      setShareTitle("");
      setShareContent("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to share post");
    }
  }

  async function handleMoveToNextStage() {
    if (!id || !nextStage) return;
    try {
      await updateBatchStage.mutateAsync({ batchId: id, status: nextStage });
      setStageConfirmOpen(false);
      toast.success(`Batch moved to ${LIFECYCLE_LABELS[nextStage]}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to move batch to next stage");
    }
  }

  async function handleDeleteBatch() {
    if (!id) return;
    try {
      await deleteBatch.mutateAsync(id);
      toast.success("Batch deleted");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete batch");
    }
  }

  // Stage badge colour helper
  const stageBadgeVariant = (stage: LifecycleStatus) => {
    switch (stage) {
      case "brew_day": return "bg-copper/20 text-copper border-copper/30";
      case "fermenting": return "bg-teal/20 text-teal border-teal/30";
      case "conditioning": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "packaging": return "bg-gold/20 text-gold border-gold/30";
      case "batch_shelf": return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Back nav */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={16} /> Back to Brew Bench
      </Link>

      {/* Hero header */}
      <div className="glass-panel rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Lifecycle stage badge + type tag */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stageBadgeVariant(
                  currentStatus
                )}`}
              >
                <Beer size={10} className="mr-1" />
                {LIFECYCLE_LABELS[currentStatus]}
              </span>
              <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                {batch.type}
              </Badge>
            </div>
            <h1 className="font-slab text-2xl md:text-3xl font-bold">{batch.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Batch #{id || "?"} · Day {daysElapsed} of {batch.target_days}
            </p>
            {/* Source recipe link */}
            {batch.recipe?.id && (
              <Link
                to={`/recipes/${batch.recipe.id}`}
                className="inline-flex items-center gap-1 text-xs text-copper hover:underline mt-1"
              >
                Based on: {batch.recipe.title ?? "Recipe"}
              </Link>
            )}
          </div>

          {/* ⋯ options menu top-right */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="shrink-0 p-2 rounded-lg border border-border/40 hover:bg-muted transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={() => toast.info("Edit batch — coming soon")}
                className="cursor-pointer"
              >
                <Edit2 size={14} className="mr-2" />
                Edit batch
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-500 cursor-pointer focus:text-red-500"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete batch
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-w-full">
                  <DialogHeader>
                    <DialogTitle className="font-slab">Delete {batch.name}?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete this batch and all its readings. This cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteBatch}
                      disabled={deleteBatch.isPending}
                    >
                      {deleteBatch.isPending && <Loader2 size={14} className="animate-spin mr-2" />}
                      {ACTIONS.delete}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            {
              label: "Current SG",
              value: readingsLoading ? "..." : currentGravity.toFixed(3),
              icon: Droplets,
              color: "text-copper",
            },
            {
              label: "Temperature",
              value: readingsLoading
                ? "..."
                : latestReading?.temp_f
                  ? `${latestReading.temp_f}°F`
                  : "—",
              icon: Thermometer,
              color: "text-teal",
            },
            {
              label: "Est. ABV",
              value: readingsLoading ? "..." : `${estAbv}%`,
              icon: FlaskConical,
              color: "text-gold",
            },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <s.icon size={16} className={s.color} />
              <div>
                <p className="text-sm font-mono font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons row (Log Reading) */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <Dialog open={logOpen} onOpenChange={setLogOpen}>
            <DialogTrigger asChild>
              <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-copper to-copper/80 text-copper-foreground text-sm font-medium flex items-center gap-2">
                <Plus size={14} /> Log Reading
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-w-full">
              <DialogHeader>
                <DialogTitle className="font-slab">Log Reading</DialogTitle>
                <DialogDescription>Record a measurement for {batch.name}.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Gravity (SG)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="1.048"
                    value={logGravity}
                    onChange={(e) => setLogGravity(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Temperature (°F)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="68"
                    value={logTemp}
                    onChange={(e) => setLogTemp(e.target.value)}
                  />
                </div>
                <div>
                  <Label>pH</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="4.2"
                    value={logPh}
                    onChange={(e) => setLogPh(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    placeholder="Optional notes..."
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleLogReading} disabled={createReading.isPending}>
                  {createReading.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
                  Save Reading
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ─── Stage-adaptive content ─── */}
      <div className="space-y-6">

        {/* ── BREW DAY ── */}
        {currentStatus === "brew_day" && (
          <>
            {/* Brew day checklist from batch_stages */}
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Check size={16} className="text-copper" />
                <h2 className="font-slab font-semibold text-lg">{BREW.brewDay} Checklist</h2>
              </div>
              <div className="space-y-3">
                {(batch.batch_stages ?? [])
                  .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((stage: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${
                          stage.completed
                            ? "bg-teal border-teal"
                            : "bg-background border-border/60"
                        }`}
                      >
                        {stage.completed && <Check size={10} className="text-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${stage.completed ? "line-through opacity-60" : ""}`}>
                          {stage.name}
                        </p>
                        {stage.scheduled && (
                          <p className="text-xs text-muted-foreground">{stage.scheduled}</p>
                        )}
                        {stage.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{stage.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Ingredient list + Target OG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel rounded-xl p-5">
                <h2 className="font-slab font-semibold text-sm mb-3">Ingredients</h2>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {batch.recipe?.ingredients ? (
                    (Array.isArray(batch.recipe.ingredients)
                      ? batch.recipe.ingredients
                      : typeof batch.recipe.ingredients === "object"
                        ? Object.entries(batch.recipe.ingredients as Record<string, any>).map(
                            ([category, items]) => (
                              <div key={category}>
                                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                  {category}
                                </p>
                                {(items as string[]).map((item, idx) => (
                                  <p key={idx} className="pl-2">• {item}</p>
                                ))}
                              </div>
                            )
                          )
                        : null)
                  ) : (
                    <p className="italic">No ingredient list available.</p>
                  )}
                </div>
              </div>

              <div className="glass-panel rounded-xl p-5">
                <h2 className="font-slab font-semibold text-sm mb-3">Target Parameters</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target OG</span>
                    <span className="font-mono font-bold text-copper">
                      {batch.og ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target FG</span>
                    <span className="font-mono font-bold">
                      {batch.target_fg ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Batch Size</span>
                    <span className="font-mono">
                      {batch.batch_size ? `${batch.batch_size} gal` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Yeast Strain</span>
                    <span>{batch.yeast_strain ?? "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── FERMENTING ── */}
        {currentStatus === "fermenting" && (
          <>
            <GravityCurve readings={readings ?? undefined} />

            <ReadingsTable batchId={id} />

            {/* Fermentation schedule from batch_stages */}
            <div className="glass-panel rounded-xl p-5">
              <h2 className="font-slab font-semibold text-lg mb-4">Fermentation Schedule</h2>
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border/60" />
                <div className="space-y-6">
                  {(batch.batch_stages ?? [])
                    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    .map((stage: any, i: number) => (
                      <div key={i} className="flex gap-4 relative">
                        <div
                          className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 z-10 ${
                            stage.completed
                              ? "bg-teal border-teal"
                              : "bg-background border-border"
                          }`}
                        />
                        <div className={`flex-1 ${!stage.completed ? "opacity-60" : ""}`}>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-sm font-semibold">{stage.name}</h3>
                            <span className="text-[10px] text-muted-foreground">
                              {stage.scheduled ?? "TBD"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {stage.notes ?? "—"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Something's wrong / troubleshooting */}
            <div className="glass-panel rounded-xl p-5 border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-slab font-semibold text-sm mb-1">Something not going right?</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    If fermentation has stalled or looks off, check your temperature, sanitation,
                    and nutrient additions.
                  </p>
                  <button
                    onClick={() => toast.info("Troubleshooting flow — coming soon")}
                    className="text-xs text-copper hover:underline"
                  >
                    Open troubleshooting guide →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── CONDITIONING ── */}
        {currentStatus === "conditioning" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Wind size={14} className="text-teal" />
                  <h3 className="font-slab font-semibold text-sm">Conditioning Method</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {batch.notes?.includes("cold") ? "Cold Crash" : batch.fermenter ?? "Standard conditioning"}
                </p>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Thermometer size={14} className="text-copper" />
                  <h3 className="font-slab font-semibold text-sm">Target Temp</h3>
                </div>
                <p className="text-sm font-mono font-bold">{batch.target_temp_f ?? "—"}°F</p>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-gold" />
                  <h3 className="font-slab font-semibold text-sm">Days Remaining</h3>
                </div>
                <p className="text-sm font-mono font-bold">
                  {Math.max(0, batch.target_days - daysElapsed)} days
                </p>
              </div>
            </div>

            {/* Clarity notes */}
            <div className="glass-panel rounded-xl p-5">
              <h2 className="font-slab font-semibold text-sm mb-3">Clarity Notes</h2>
              <Textarea
                placeholder="Log observations about clarity, off-flavors, and conditioning progress..."
                value={clarityNotes}
                onChange={(e) => setClarityNotes(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Observations are saved to batch notes on save.
              </p>
            </div>
          </div>
        )}

        {/* ── PACKAGING ── */}
        {currentStatus === "packaging" && (
          <div className="space-y-4">
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package size={16} className="text-copper" />
                <h2 className="font-slab font-semibold text-lg">Packaging Checklist</h2>
              </div>
              <div className="space-y-3">
                {[
                  "Carbonation calculated — priming sugar or keg pressure set",
                  "Bottles / kegs cleaned and sanitized",
                  "Transfer tubing purged with CO2",
                  "Dissolved oxygen minimized during transfer",
                  "Sample taken for final gravity",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-4 rounded border-2 border-border/60 shrink-0" />
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel rounded-xl p-5">
                <h3 className="font-slab font-semibold text-sm mb-3">Carbonation Target</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target CO₂ (vol)</span>
                    <span className="font-mono font-bold text-copper">
                      {batch.notes?.includes("2.5") ? "2.5" : "2.2"} vol
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Style</span>
                    <span>{batch.fermenter ?? "Bottled"}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-5">
                <h3 className="font-slab font-semibold text-sm mb-3">Volume Being Packaged</h3>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="5.0"
                    value={packageVolume}
                    onChange={(e) => setPackageVolume(e.target.value)}
                    className="max-w-[120px]"
                  />
                  <span className="text-sm text-muted-foreground">gallons</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Batch size: {batch.batch_size ? `${batch.batch_size} gal` : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── BATCH SHELF ── */}
        {currentStatus === "batch_shelf" && (
          <div className="space-y-4">
            <div className="glass-panel rounded-xl p-5">
              <h2 className="font-slab font-semibold text-lg mb-4">Tasting Notes</h2>
              <Textarea
                placeholder="Describe the appearance, aroma, flavor, mouthfeel, and overall impression of this batch..."
                value={tastingNotesText}
                onChange={(e) => setTastingNotesText(e.target.value)}
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Star rating */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="font-slab font-semibold text-sm mb-3">Your Rating</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setStarRating(n)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={22}
                        className={n <= starRating ? "text-gold fill-gold" : "text-border"}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{starRating}/5 stars</p>
              </div>

              {/* SRM colour swatch */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="font-slab font-semibold text-sm mb-3">Colour (SRM)</h3>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg border border-border/40 ${srmToColor(
                      batch.srm
                    )}`}
                  />
                  <div>
                    <p className="font-mono font-bold">{batch.srm ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">SRM</p>
                  </div>
                </div>
              </div>

              {/* Remaining volume + packaged date */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="font-slab font-semibold text-sm mb-3">Batch Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-mono font-bold">
                      {batch.volume ? `${batch.volume} gal` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Packaged</span>
                    <span className="font-mono">
                      {batch.packaged_date
                        ? new Date(batch.packaged_date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mark as finished */}
            {batch.status !== "finished" && (
              <div className="glass-panel rounded-xl p-5 border border-green-500/20 bg-green-500/5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm font-medium">Ready to mark this batch as finished?</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-green-500"
                      >
                        Mark as Finished
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-w-full">
                      <DialogHeader>
                        <DialogTitle className="font-slab">Mark {batch.name} as finished?</DialogTitle>
                        <DialogDescription>
                          This batch will move to your completed history and no longer appear on
                          the Brew Bench.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="ghost">Cancel</Button>
                        <Button
                          onClick={async () => {
                            if (!id) return;
                            try {
                              await updateBatchStage.mutateAsync({ batchId: id, status: "finished" });
                              toast.success("Batch marked as finished");
                            } catch (err: any) {
                              toast.error(err?.message || "Failed to update batch");
                            }
                          }}
                        >
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Generic sidebar (shown for most stages except batch_shelf) ── */}
        {currentStatus !== "batch_shelf" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div />
            <div className="space-y-4">
              {/* Tasting note + Share + Upload Photo */}
              <div className="glass-panel rounded-xl p-4">
                <h3 className="font-slab font-semibold text-sm mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {/* Upload Photo */}
                  <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 hover:bg-muted text-sm transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !id) return;
                        try {
                          const url = await uploadPhoto(
                            file,
                            `${id}/${Date.now()}.jpg`
                          );
                          if (url) {
                            await createReading.mutateAsync({
                              batch_id: id,
                              gravity: currentGravity,
                              photo_url: url,
                            });
                          }
                        } catch (err: any) {
                          toast.error(err?.message || "Failed to upload photo");
                        }
                        e.target.value = "";
                      }}
                    />
                    {photoUploading ? (
                      <Loader2 size={14} className="animate-spin text-copper" />
                    ) : (
                      <Camera size={14} className="text-copper" />
                    )}
                    {photoUploading ? "Uploading…" : "Upload Photo"}
                  </label>

                  {/* Tasting Note */}
                  <Dialog open={tastingOpen} onOpenChange={setTastingOpen}>
                    <DialogTrigger asChild>
                      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 hover:bg-muted text-sm transition-colors">
                        <MessageSquare size={14} className="text-copper" />
                        Tasting Note
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-w-full">
                      <DialogHeader>
                        <DialogTitle className="font-slab">Tasting Note</DialogTitle>
                        <DialogDescription>Log your sensory impressions.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        {[
                          { label: "Aroma", value: tastingAroma, set: setTastingAroma, placeholder: "What do you smell?" },
                          { label: "Flavor", value: tastingFlavor, set: setTastingFlavor, placeholder: "What do you taste?" },
                          { label: "Mouthfeel", value: tastingMouthfeel, set: setTastingMouthfeel, placeholder: "Body, carbonation, finish..." },
                          { label: "Overall", value: tastingOverall, set: setTastingOverall, placeholder: "Overall impression..." },
                        ].map(({ label, value, set, placeholder }) => (
                          <div key={label}>
                            <Label>{label}</Label>
                            <Textarea
                              placeholder={placeholder}
                              value={value}
                              onChange={(e) => set(e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button onClick={handleTastingNote} disabled={createTastingNote.isPending}>
                          {createTastingNote.isPending && (
                            <Loader2 size={16} className="animate-spin mr-2" />
                          )}
                          Save Tasting Note
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Share to Community */}
                  <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                    <DialogTrigger asChild>
                      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 hover:bg-muted text-sm transition-colors">
                        <Share2 size={14} className="text-copper" />
                        Share to Community
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-w-full">
                      <DialogHeader>
                        <DialogTitle className="font-slab">Share to Community</DialogTitle>
                        <DialogDescription>
                          Post your batch progress to the community feed.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div>
                          <Label>Title</Label>
                          <Input
                            placeholder="Post title"
                            value={shareTitle}
                            onChange={(e) => setShareTitle(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea
                            placeholder="What's happening with this batch?"
                            value={shareContent}
                            onChange={(e) => setShareContent(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleShare} disabled={createPost.isPending}>
                          {createPost.isPending && (
                            <Loader2 size={16} className="animate-spin mr-2" />
                          )}
                          Share
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Recipe info sidebar */}
              <div className="glass-panel rounded-xl p-4">
                <h3 className="font-slab font-semibold text-sm mb-2">Recipe</h3>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p>Style: {batch.recipe?.title ?? batch.name}</p>
                  <p>
                    OG: {batch.og ?? "?"} → FG: {batch.target_fg ?? "?"}
                  </p>
                  <p>Fermenter: {batch.fermenter ?? "—"}</p>
                  <p>Target Temp: {batch.target_temp_f ?? "—"}°F</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Move to next stage button ─── */}
      {nextStage && batch.status !== "finished" && (
        <div className="mt-8 flex justify-center">
          <Dialog open={stageConfirmOpen} onOpenChange={setStageConfirmOpen}>
            <DialogTrigger asChild>
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal to-teal/80 text-white font-medium text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-teal/20 transition-all">
                Move to {nextStageLabel} →
                <ArrowLeft size={14} className="rotate-180" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-w-full">
              <DialogHeader>
                <DialogTitle className="font-slab">
                  Move {batch.name} to {nextStageLabel}?
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to move Batch #{id} to {nextStageLabel}? This cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setStageConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMoveToNextStage} disabled={updateBatchStage.isPending}>
                  {updateBatchStage.isPending && <Loader2 size={14} className="animate-spin mr-2" />}
                  {ACTIONS.confirm}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default BatchDetail;