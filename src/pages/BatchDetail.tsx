import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GravityCurve from "@/components/GravityCurve";
import { useBatch } from "@/hooks/useBatches";
import { useReadings, useCreateReading } from "@/hooks/useReadings";
import { useUpload } from "@/hooks/useUpload";
import { useCreatePost } from "@/hooks/usePosts";
import { useCreateTastingNote, useTastingSessions } from "@/hooks/useTastingNotes";

const BatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: batch, isLoading: batchLoading } = useBatch(id);
  const { data: readings, isLoading: readingsLoading } = useReadings(id);
  const createReading = useCreateReading();
  const { upload: uploadPhoto, uploading: photoUploading } = useUpload('batch-photos');
  const createPost = useCreatePost();
  const createTastingNote = useCreateTastingNote();
  const tastingSession = useTastingSessions(id);

  const [logOpen, setLogOpen] = useState(false);
  const [tastingOpen, setTastingOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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

  const latestReading = readings?.[0] ?? null;
  const og = batch.og ?? 1.05;
  const currentGravity = latestReading?.gravity ?? og;
  const estAbv = ((og - currentGravity) * 131.25).toFixed(1);
  const daysElapsed = Math.max(
    0,
    Math.floor((Date.now() - new Date(batch.start_date).getTime()) / (1000 * 60 * 60 * 24))
  );

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
        category: 'tasting',
        title: shareTitle || `${batch.name} — Tasting Notes`,
        content: shareContent || `Sharing my progress on ${batch.name}. Day ${daysElapsed} of ${batch.target_days}.`,
        type: batch.type,
      });
      setShareOpen(false);
      setShareTitle("");
      setShareContent("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to share post");
    }
  }

  return (
    <div className="animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft size={16} /> Back to Brew Bench
      </Link>

      {/* Hero */}
      <div className="glass-panel rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-1">
              {batch.type} — {batch.recipe?.title ?? batch.name}
            </p>
            <h1 className="font-slab text-2xl md:text-3xl font-bold">{batch.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Batch #{id || "?"} · Day {daysElapsed} of {batch.target_days} · {batch.status}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShareOpen(true)}
              className="px-3 py-2 rounded-lg border border-border/50 text-sm hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Share2 size={14} /> Share
            </button>
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

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Current SG", value: readingsLoading ? "..." : currentGravity.toFixed(3), icon: Droplets, color: "text-copper" },
            { label: "Temperature", value: readingsLoading ? "..." : (latestReading?.temp_f ? `${latestReading.temp_f}°F` : "—"), icon: Thermometer, color: "text-teal" },
            { label: "Est. ABV", value: readingsLoading ? "..." : `${estAbv}%`, icon: FlaskConical, color: "text-gold" },
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Timeline */}
        <div className="space-y-6">
          <GravityCurve readings={readings ?? undefined} />

          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-slab font-semibold text-lg mb-4">Fermentation Log</h2>
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border/60" />
              <div className="space-y-6">
                {(batch.batch_stages ?? [])
                  .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((stage: any, i: number) => (
                    <div key={i} className="flex gap-4 relative">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 z-10 ${
                          stage.completed ? "bg-teal border-teal" : "bg-background border-border"
                        }`}
                      />
                      <div className={`flex-1 ${!stage.completed ? "opacity-60" : ""}`}>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-sm font-semibold">{stage.name}</h3>
                          <span className="text-[10px] text-muted-foreground">{stage.scheduled ?? "TBD"}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{stage.notes ?? "—"}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setLogOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 hover:bg-muted text-sm transition-colors"
              >
                <Plus size={14} className="text-copper" />
                Add Reading
              </button>

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
                      const url = await uploadPhoto(file, `${id}/${Date.now()}.jpg`);
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
                    <div>
                      <Label>Aroma</Label>
                      <Textarea
                        placeholder="What do you smell?"
                        value={tastingAroma}
                        onChange={(e) => setTastingAroma(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Flavor</Label>
                      <Textarea
                        placeholder="What do you taste?"
                        value={tastingFlavor}
                        onChange={(e) => setTastingFlavor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Mouthfeel</Label>
                      <Textarea
                        placeholder="Body, carbonation, finish..."
                        value={tastingMouthfeel}
                        onChange={(e) => setTastingMouthfeel(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Overall</Label>
                      <Textarea
                        placeholder="Overall impression..."
                        value={tastingOverall}
                        onChange={(e) => setTastingOverall(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleTastingNote} disabled={createTastingNote.isPending}>
                      {createTastingNote.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
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
                    <DialogDescription>Post your batch progress to the community feed.</DialogDescription>
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
                      {createPost.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
                      Share
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-2">Recipe</h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>Style: {batch.recipe?.title ?? batch.name}</p>
              <p>OG: {batch.og ?? "?"} → FG: {batch.target_fg ?? "?"}</p>
              <p>Fermenter: {batch.fermenter ?? "—"}</p>
              <p>Target Temp: {batch.target_temp_f ?? "—"}°F</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetail;
