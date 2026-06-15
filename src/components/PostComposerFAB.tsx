import { useState, useEffect } from "react";
import { Pencil, Loader2, Star, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePost } from "@/hooks/usePosts";
import { useRecipes } from "@/hooks/useRecipes";
import { copy } from "@/constants/copy";
import type { Database } from "@/types/database";

type PostCategory = Database["public"]["Enums"]["post_category"];
type FermentType = Database["public"]["Enums"]["ferment_type"];

const BREW_TYPES: FermentType[] = ["beer", "kombucha", "mead", "cider", "sourdough", "ferment", "wine"];

const BATCH_STAGES = [
  { value: "brew_day", label: "Brew day" },
  { value: "fermenting", label: "Fermenting" },
  { value: "conditioning", label: "Conditioning" },
  { value: "packaging", label: "Packaging" },
];

interface PostComposerFABProps {
  activeTabCategory?: string;
  activeTabPanel?: string;
}

export default function PostComposerFAB({ activeTabCategory, activeTabPanel }: PostComposerFABProps) {
  // Hide on challenges tab
  if (activeTabPanel === "challenges" || activeTabCategory === "challenges") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <ComposerButton activeTabCategory={activeTabCategory} />
    </div>
  );
}

function ComposerButton({ activeTabCategory }: { activeTabCategory?: string }) {
  const [open, setOpen] = useState(false);

  const categoryMap: Record<string, PostCategory> = {
    brew_log: "brew_log",
    troubleshooting: "troubleshooting",
    tasting: "tasting",
  };

  const defaultCategory: PostCategory = categoryMap[activeTabCategory ?? "brew_log"] ?? "brew_log";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-xl bg-teal hover:bg-teal/90 text-teal-foreground"
        onClick={() => setOpen(true)}
        aria-label="Create post"
      >
        <Pencil size={22} />
      </Button>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col max-h-[90vh]">
        <SheetHeader className="px-6 py-4 border-b border-border/50 shrink-0">
          <SheetTitle className="font-slab text-lg">
            {copy.community.newPost ?? "New Post"}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {defaultCategory === "brew_log" && (
            <BrewLogComposer onClose={() => setOpen(false)} />
          )}
          {defaultCategory === "troubleshooting" && (
            <TroubleshootingComposer onClose={() => setOpen(false)} />
          )}
          {defaultCategory === "tasting" && (
            <TastingComposer onClose={() => setOpen(false)} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Brew Log Composer ───────────────────────────────────────────────────────

function BrewLogComposer({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [brewType, setBrewType] = useState<FermentType | "">("");
  const [starRating, setStarRating] = useState<number | null>(null);

  const createPost = useCreatePost();
  const { data: recipes } = useRecipes();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const photosArray = photos
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    createPost.mutate(
      {
        category: "brew_log",
        title: title.trim(),
        content: description.trim(),
        type: brewType || null,
        recipe_id: recipeId || null,
        photos: photosArray.length > 0 ? photosArray : null,
        star_rating: starRating,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setPhotos("");
          setRecipeId("");
          setBrewType("");
          setStarRating(null);
          onClose();
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
        Brew Log
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="bl-title">Title *</Label>
        <Input
          id="bl-title"
          placeholder="e.g. My first lager batch..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bl-description">Description *</Label>
        <Textarea
          id="bl-description"
          placeholder="What happened today? How did it go?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bl-photos">Photos (one URL per line)</Label>
        <Textarea
          id="bl-photos"
          placeholder="https://example.com/photo1.jpg"
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bl-recipe">Tag a Recipe</Label>
        <Select value={recipeId} onValueChange={setRecipeId}>
          <SelectTrigger id="bl-recipe">
            <SelectValue placeholder="Select recipe (optional)" />
          </SelectTrigger>
          <SelectContent>
            {(recipes ?? []).map((r: any) => (
              <SelectItem key={r.id} value={r.id}>
                {r.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bl-type">Brew Type</Label>
        <Select
          value={brewType}
          onValueChange={(v) => setBrewType(v as FermentType)}
        >
          <SelectTrigger id="bl-type">
            <SelectValue placeholder="Select type (optional)" />
          </SelectTrigger>
          <SelectContent>
            {BREW_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Star Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStarRating(s === starRating ? null : s)}
              className="p-1 rounded transition-colors hover:text-gold"
            >
              <Star
                size={24}
                className={starRating !== null && s <= starRating ? "fill-gold text-gold" : "text-muted-foreground"}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={createPost.isPending || !title.trim() || !description.trim()}
          className="flex-1 bg-teal hover:bg-teal/90"
        >
          {createPost.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            copy.actions?.submit ?? "Submit"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          {copy.common?.cancel ?? "Cancel"}
        </Button>
      </div>
    </form>
  );
}

// ─── Troubleshooting Composer ─────────────────────────────────────────────────

function TroubleshootingComposer({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [whatHappening, setWhatHappening] = useState("");
  const [batchStage, setBatchStage] = useState("");
  const [currentSg, setCurrentSg] = useState("");
  const [currentTemp, setCurrentTemp] = useState("");
  const [currentPh, setCurrentPh] = useState("");
  const [photos, setPhotos] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [brewType, setBrewType] = useState<FermentType | "">("");

  const createPost = useCreatePost();
  const { data: recipes } = useRecipes();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !whatHappening.trim() || !batchStage) return;

    const photosArray = photos
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    createPost.mutate(
      {
        category: "troubleshooting",
        title: title.trim(),
        content: whatHappening.trim(),
        batch_stage: batchStage,
        current_sg: currentSg ? parseFloat(currentSg) : null,
        current_temp: currentTemp ? parseFloat(currentTemp) : null,
        current_ph: currentPh ? parseFloat(currentPh) : null,
        type: brewType || null,
        recipe_id: recipeId || null,
        photos: photosArray.length > 0 ? photosArray : null,
      },
      {
        onSuccess: () => {
          setTitle("");
          setWhatHappening("");
          setBatchStage("");
          setCurrentSg("");
          setCurrentTemp("");
          setCurrentPh("");
          setPhotos("");
          setRecipeId("");
          setBrewType("");
          onClose();
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
        Troubleshooting
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="ts-title">Title *</Label>
        <Input
          id="ts-title"
          placeholder="e.g. Fermentation stuck at day 3..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ts-happening">What is happening? *</Label>
        <Textarea
          id="ts-happening"
          placeholder="Describe the issue in detail..."
          value={whatHappening}
          onChange={(e) => setWhatHappening(e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ts-stage">Which stage? *</Label>
        <Select value={batchStage} onValueChange={setBatchStage} required>
          <SelectTrigger id="ts-stage">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {BATCH_STAGES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ts-sg">Current SG</Label>
          <Input
            id="ts-sg"
            type="number"
            step="0.001"
            placeholder="e.g. 1.045"
            value={currentSg}
            onChange={(e) => setCurrentSg(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ts-temp">Temp (°F)</Label>
          <Input
            id="ts-temp"
            type="number"
            step="0.1"
            placeholder="e.g. 68"
            value={currentTemp}
            onChange={(e) => setCurrentTemp(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ts-ph">pH</Label>
          <Input
            id="ts-ph"
            type="number"
            step="0.01"
            placeholder="e.g. 4.2"
            value={currentPh}
            onChange={(e) => setCurrentPh(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ts-photos">Photos (one URL per line)</Label>
        <Textarea
          id="ts-photos"
          placeholder="https://example.com/photo1.jpg"
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ts-recipe">Tag a Recipe</Label>
        <Select value={recipeId} onValueChange={setRecipeId}>
          <SelectTrigger id="ts-recipe">
            <SelectValue placeholder="Select recipe (optional)" />
          </SelectTrigger>
          <SelectContent>
            {(recipes ?? []).map((r: any) => (
              <SelectItem key={r.id} value={r.id}>
                {r.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ts-type">Brew Type</Label>
        <Select
          value={brewType}
          onValueChange={(v) => setBrewType(v as FermentType)}
        >
          <SelectTrigger id="ts-type">
            <SelectValue placeholder="Select type (optional)" />
          </SelectTrigger>
          <SelectContent>
            {BREW_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={createPost.isPending || !title.trim() || !whatHappening.trim() || !batchStage}
          className="flex-1 bg-teal hover:bg-teal/90"
        >
          {createPost.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            copy.actions?.submit ?? "Submit"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          {copy.common?.cancel ?? "Cancel"}
        </Button>
      </div>
    </form>
  );
}

// ─── Tasting Composer ─────────────────────────────────────────────────────────

function TastingComposer({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState("");
  const [appearance, setAppearance] = useState("");
  const [aroma, setAroma] = useState("");
  const [flavor, setFlavor] = useState("");
  const [mouthfeel, setMouthfeel] = useState("");
  const [overall, setOverall] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [brewType, setBrewType] = useState<FermentType | "">("");

  const createPost = useCreatePost();
  const { data: recipes } = useRecipes();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !overall.trim()) return;

    const photosArray = photos
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    createPost.mutate(
      {
        category: "tasting",
        title: title.trim(),
        content: JSON.stringify({ appearance, aroma, flavor, mouthfeel, overall }),
        appearance: appearance || null,
        aroma: aroma || null,
        flavor: flavor || null,
        mouthfeel: mouthfeel || null,
        overall: overall || null,
        type: brewType || null,
        recipe_id: recipeId || null,
        photos: photosArray.length > 0 ? photosArray : null,
      },
      {
        onSuccess: () => {
          setTitle("");
          setPhotos("");
          setAppearance("");
          setAroma("");
          setFlavor("");
          setMouthfeel("");
          setOverall("");
          setRecipeId("");
          setBrewType("");
          onClose();
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
        Tasting
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="tc-title">Title *</Label>
        <Input
          id="tc-title"
          placeholder="e.g. Tasting notes: West Coast IPA"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tc-photos">Photos (one URL per line)</Label>
        <Textarea
          id="tc-photos"
          placeholder="https://example.com/photo1.jpg"
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tc-appearance">Appearance</Label>
          <Textarea
            id="tc-appearance"
            placeholder="e.g. Golden, clear, persistent head..."
            value={appearance}
            onChange={(e) => setAppearance(e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tc-aroma">Aroma</Label>
          <Textarea
            id="tc-aroma"
            placeholder="e.g. Citrusy hops, light malt..."
            value={aroma}
            onChange={(e) => setAroma(e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tc-flavor">Flavour</Label>
          <Textarea
            id="tc-flavor"
            placeholder="e.g. Grapefruit, caramel, dry finish..."
            value={flavor}
            onChange={(e) => setFlavor(e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tc-mouthfeel">Mouthfeel</Label>
          <Textarea
            id="tc-mouthfeel"
            placeholder="e.g. Medium body, creamy, warming..."
            value={mouthfeel}
            onChange={(e) => setMouthfeel(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tc-overall">Overall Notes *</Label>
        <Textarea
          id="tc-overall"
          placeholder="Your overall impressions..."
          value={overall}
          onChange={(e) => setOverall(e.target.value)}
          rows={2}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tc-recipe">Tag a Recipe</Label>
        <Select value={recipeId} onValueChange={setRecipeId}>
          <SelectTrigger id="tc-recipe">
            <SelectValue placeholder="Select recipe (optional)" />
          </SelectTrigger>
          <SelectContent>
            {(recipes ?? []).map((r: any) => (
              <SelectItem key={r.id} value={r.id}>
                {r.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tc-type">Brew Type</Label>
        <Select
          value={brewType}
          onValueChange={(v) => setBrewType(v as FermentType)}
        >
          <SelectTrigger id="tc-type">
            <SelectValue placeholder="Select type (optional)" />
          </SelectTrigger>
          <SelectContent>
            {BREW_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={createPost.isPending || !title.trim() || !overall.trim()}
          className="flex-1 bg-teal hover:bg-teal/90"
        >
          {createPost.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            copy.actions?.submit ?? "Submit"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          {copy.common?.cancel ?? "Cancel"}
        </Button>
      </div>
    </form>
  );
}