import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Camera,
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
import GravityCurve from "@/components/GravityCurve";
import { useBatches } from "@/hooks/useBatches";
import { useReadings, useCreateReading } from "@/hooks/useReadings";
import { useUpload } from "@/hooks/useUpload";
import { useQueryClient } from "@tanstack/react-query";

const readingSchema = z.object({
  gravity: z.coerce.number().min(0.9).max(1.2),
  temp_f: z.coerce.number().optional(),
  ph: z.coerce.number().min(0).max(14).optional(),
  notes: z.string().optional(),
});

type ReadingForm = z.infer<typeof readingSchema>;

const FermentationMonitor = () => {
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const batchId = selectedBatchId ?? batches?.[0]?.id ?? null;
  const batch = useMemo(
    () => batches?.find((b: any) => b.id === batchId),
    [batches, batchId]
  );

  const { data: readings, isLoading: readingsLoading } = useReadings(batchId);
  const createReading = useCreateReading();
  const { upload: uploadPhoto, uploading: photoUploading } = useUpload('batch-photos');
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReadingForm>({
    resolver: zodResolver(readingSchema),
    defaultValues: {
      gravity: undefined,
      temp_f: undefined,
      ph: undefined,
      notes: "",
    },
  });

  const latestReading = readings?.[0] ?? null;
  const og = batch?.og ?? 1.05;
  const currentGravity = latestReading?.gravity ?? og;
  const estAbv = ((og - currentGravity) * 131.25).toFixed(1);

  function onSubmit(data: ReadingForm) {
    if (!batchId) return;
    createReading.mutate(
      {
        batch_id: batchId,
        gravity: data.gravity,
        temp_f: data.temp_f ?? null,
        ph: data.ph ?? null,
        notes: data.notes || null,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          reset();
        },
      }
    );
  }

  if (batchesLoading) {
    return (
      <div className="animate-fade-in">
        <div className="h-6 w-40 bg-muted/50 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="animate-fade-in">
        <h1 className="font-slab text-2xl md:text-3xl font-bold mb-2">
          Fermentation Monitor
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          No active batches to monitor.
        </p>
      </div>
    );
  }

  const daysElapsed = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(batch.start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-slab text-2xl md:text-3xl font-bold">
            Fermentation Monitor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {batch.name} — Day {daysElapsed} of {batch.target_days}
          </p>
        </div>
        {batches && batches.length > 1 && (
          <select
            value={batchId ?? ""}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
          >
            {batches.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Live readings */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Current SG",
                value: readingsLoading
                  ? "..."
                  : currentGravity.toFixed(3),
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
            ].map((stat, i) => (
              <div key={i} className="glass-panel rounded-xl p-4 text-center">
                <stat.icon
                  size={20}
                  className={`${stat.color} mx-auto mb-2`}
                />
                <p
                  className={`text-2xl md:text-3xl font-mono font-bold ${stat.color}`}
                >
                  {stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Main chart */}
          <GravityCurve readings={readings ?? undefined} />

          {/* Photo check */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3">Visual Check</h3>
            <label className="border-2 border-dashed border-border/60 rounded-lg h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-copper/40 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !batchId) return;
                  const url = await uploadPhoto(file, `${batchId}/${Date.now()}.jpg`);
                  if (url) {
                    createReading.mutate({
                      batch_id: batchId,
                      gravity: currentGravity,
                      photo_url: url,
                    }, {
                      onSuccess: () => {
                        qc.invalidateQueries({ queryKey: ['readings', batchId] });
                      },
                    });
                  }
                  e.target.value = '';
                }}
              />
              {photoUploading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Camera size={24} />
              )}
              <p className="text-xs">
                {photoUploading ? 'Uploading…' : 'Upload photo or tap to capture'}
              </p>
            </label>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 hover:bg-muted text-sm transition-colors">
                    <Plus size={16} className="text-copper" />
                    Log Reading
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-w-full">
                  <DialogHeader>
                    <DialogTitle className="font-slab">
                      Log Reading
                    </DialogTitle>
                    <DialogDescription>
                      Record a new gravity, temperature, or pH measurement for{" "}
                      {batch.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="gravity">Gravity (SG)</Label>
                      <Input
                        id="gravity"
                        type="number"
                        step="0.001"
                        placeholder="1.048"
                        {...register("gravity")}
                      />
                      {errors.gravity && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.gravity.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="temp">Temperature (°F)</Label>
                      <Input
                        id="temp"
                        type="number"
                        step="0.1"
                        placeholder="68"
                        {...register("temp_f")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ph">pH</Label>
                      <Input
                        id="ph"
                        type="number"
                        step="0.1"
                        placeholder="4.2"
                        {...register("ph")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        placeholder="Optional notes..."
                        {...register("notes")}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={createReading.isPending}
                      >
                        {createReading.isPending ? (
                          <Loader2 size={16} className="animate-spin mr-2" />
                        ) : null}
                        Save Reading
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 hover:bg-muted text-sm transition-colors">
                <MessageSquare size={16} className="text-copper" />
                Tasting Note
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 hover:bg-muted text-sm transition-colors">
                <Camera size={16} className="text-copper" />
                Upload Photo
              </button>
            </div>
          </div>

          {/* Fermentation timeline */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3">Stage Timeline</h3>
            <div className="space-y-3">
              {(batch.batch_stages ?? [])
                .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        s.completed
                          ? "bg-teal border-teal"
                          : "border-border bg-transparent"
                      }`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          s.completed ? "" : "text-muted-foreground"
                        }`}
                      >
                        {s.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.scheduled ?? "TBD"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Community chat placeholder */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-2 flex items-center gap-2">
              <MessageSquare size={14} className="text-teal" />
              Brew Chat
            </h3>
            <p className="text-xs text-muted-foreground">
              Connect with fellow brewers monitoring their batches live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FermentationMonitor;
