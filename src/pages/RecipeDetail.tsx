import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useNavigate as useNav } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Star,
  Share2,
  Bookmark,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  GitFork,
  Percent,
  Clock,
  Scale,
  Flame,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRecipe, useRecipeStages, useUpdateRecipe, useDeleteRecipe } from "@/hooks/useRecipes";
import { useAuth } from "@/contexts/AuthContext";
import { RECIPE, ACTIONS } from "@/constants/copy";
import type { Database } from "@/types/database";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeStage = Database["public"]["Tables"]["recipe_stages"]["Row"];

// ─── SRM colour swatch ────────────────────────────────────────────────────────

function SrmSwatch({ srm, size = "sm" }: { srm: number | null; size?: "sm" | "lg" }) {
  const color =
    !srm || srm <= 0 ? "#6B7280" :
    srm < 3 ? "#FFE500" :
    srm < 6 ? "#F5C200" :
    srm < 9 ? "#D4850A" :
    srm < 14 ? "#BF4D05" :
    srm < 20 ? "#620E02" :
    srm < 30 ? "#250100" :
    "#0A0000";
  const dim = size === "lg" ? "w-5 h-5" : "w-3 h-3";
  return (
    <span
      className={`${dim} rounded-full shrink-0 border border-black/20`}
      style={{ backgroundColor: color }}
      title={`SRM ${srm ?? "—" }`}
    />
  );
}

// ─── Star rating display ──────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "text-gold fill-gold" : "text-muted/50"}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}/5</span>
    </div>
  );
}

// ─── Difficulty dots ─────────────────────────────────────────────────────────

function DifficultyDots({ value }: { value: number | null }) {
  if (!value) return null;
  const labels = ["Beginner", "Intermediate", "Advanced"];
  return (
    <span className="flex items-center gap-1" title={labels[value - 1] ?? ""}>
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < value ? "bg-copper" : "bg-muted"}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-0.5">{labels[value - 1]}</span>
    </span>
  );
}

// ─── Ingredient type ─────────────────────────────────────────────────────────

interface Ingredients {
  malts?: string[];
  hops?: string[];
  yeast?: string[];
  water?: string[];
  adjuncts?: string[];
}

// ─── Step type ───────────────────────────────────────────────────────────────

interface BrewStep {
  step?: number;
  instruction?: string;
  [key: string]: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseIngredients(raw: unknown): Ingredients {
  if (Array.isArray(raw)) {
    // Plain string array
    return { malts: raw.map(String) };
  }
  if (raw && typeof raw === "object") return raw as Ingredients;
  return {};
}

function parseSteps(raw: unknown): BrewStep[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((s): BrewStep =>
      typeof s === "string" ? { instruction: s } : (s as BrewStep)
    );
  }
  return [];
}

// ─── Main component ──────────────────────────────────────────────────────────

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: recipe, isLoading } = useRecipe(id);
  const { data: stages = [] } = useRecipeStages(id);

  const updateRecipe = useUpdateRecipe();
  const deleteRecipe = useDeleteRecipe();

  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="text-muted-foreground text-sm">{ACTIONS.loading}</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">Recipe not found.</p>
        <Button variant="outline" onClick={() => navigate("/recipes")}>
          <ArrowLeft size={16} className="mr-2" /> Back to Recipe Vault
        </Button>
      </div>
    );
  }

  const ingredients = parseIngredients(recipe.ingredients);
  const steps = parseSteps(recipe.steps);
  const isOwner = user?.id === recipe.user_id;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateRecipe.mutateAsync({ id: recipe.id, starred: !recipe.starred });
      toast.success(recipe.starred ? "Removed from saved" : "Saved recipe");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: recipe.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecipe.mutateAsync(recipe.id);
      toast.success("Recipe deleted");
      navigate("/recipes");
    } catch {
      toast.error("Failed to delete recipe");
    }
  };

  const handleFork = async () => {
    if (!user) return;
    // Fork: copy recipe with forked_from set to this recipe's id, title prefixed
    const updateFn = useUpdateRecipe();
    try {
      await updateFn.mutateAsync({
        id: recipe.id,
        forked_from: recipe.id,
        title: `${recipe.title} (Fork)`,
      } as Parameters<typeof updateFn.mutateAsync>[0]);
      toast.success("Recipe forked");
    } catch {
      toast.error("Failed to fork recipe");
    }
  };

  const typeConfig: Record<string, { label: string; color: string }> = {
    beer: { label: "Beer", color: "text-copper" },
    kombucha: { label: "Kombucha", color: "text-teal" },
    mead: { label: "Mead", color: "text-gold" },
    cider: { label: "Cider", color: "text-copper" },
    sourdough: { label: "Sourdough", color: "text-gold" },
    wine: { label: "Wine", color: "text-copper" },
    ferment: { label: "Ferment", color: "text-teal" },
  };
  const typeInfo = typeConfig[recipe.type] ?? { label: recipe.type, color: "text-copper" };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto pb-16">
      {/* ─── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate("/recipes")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          {ACTIONS.back}
        </button>

        <div className="flex items-center gap-2">
          {/* Save / Star */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5"
          >
            <Bookmark
              size={15}
              className={recipe.starred ? "text-gold fill-gold" : "text-muted-foreground"}
            />
            <span className="text-xs hidden sm:inline">{recipe.starred ? "Saved" : "Save"}</span>
          </Button>

          {/* Share */}
          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1.5">
            <Share2 size={15} />
            <span className="text-xs hidden sm:inline">{ACTIONS.share}</span>
          </Button>

          {/* Options menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to={`/recipe/edit/${recipe.id}`} className="flex items-center gap-2 cursor-pointer">
                      <Edit size={14} /> {ACTIONS.edit}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 size={14} /> {ACTIONS.delete}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Flag size={14} /> Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleFork} className="flex items-center gap-2 cursor-pointer">
                    <GitFork size={14} /> Fork recipe
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
          {recipe.style && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium">
              {recipe.style}
            </span>
          )}
          {recipe.curated && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/20 text-gold font-semibold">
              Curated
            </span>
          )}
          {recipe.forked_from && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal/20 text-teal font-semibold">
              Forked
            </span>
          )}
        </div>

        <h1 className="font-slab text-2xl md:text-3xl font-bold leading-tight">{recipe.title}</h1>

        {/* Author */}
        {!isOwner && (recipe as any).profiles && (
          <p className="text-xs text-muted-foreground mt-1">
            by <span className="text-foreground">@{(recipe as any).profiles?.username ?? "unknown"}</span>
          </p>
        )}

        {/* Star rating */}
        <div className="mt-2">
          <StarRating rating={recipe.star_rating ?? null} />
        </div>
      </div>

      {/* ─── Stats row ───────────────────────────────────────────────────── */}
      <div className="glass-panel rounded-xl p-4 mb-5 flex flex-wrap items-center gap-3 text-sm">
        {recipe.abv != null && recipe.abv > 0 && (
          <span className="flex items-center gap-1.5">
            <Percent size={14} className="text-muted-foreground" />
            <span className="font-medium">{recipe.abv}%</span>
            <span className="text-muted-foreground text-xs">ABV</span>
          </span>
        )}
        {recipe.ibu != null && recipe.ibu > 0 && (
          <span className="flex items-center gap-1.5">
            <Flame size={14} className="text-muted-foreground" />
            <span className="font-medium">{recipe.ibu}</span>
            <span className="text-muted-foreground text-xs">IBU</span>
          </span>
        )}
        {recipe.srm != null && (
          <span className="flex items-center gap-1.5">
            <SrmSwatch srm={recipe.srm} size="lg" />
            <span className="font-medium">{recipe.srm}</span>
            <span className="text-muted-foreground text-xs">SRM</span>
          </span>
        )}
        {recipe.difficulty != null && (
          <span className="flex items-center gap-1.5">
            <DifficultyDots value={recipe.difficulty} />
          </span>
        )}
        {recipe.batch_size != null && (
          <span className="flex items-center gap-1.5">
            <Scale size={14} className="text-muted-foreground" />
            <span className="font-medium">{recipe.batch_size}</span>
            <span className="text-muted-foreground text-xs">gal</span>
          </span>
        )}
        {recipe.estimated_days != null && (
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-muted-foreground" />
            <span className="font-medium">{recipe.estimated_days}</span>
            <span className="text-muted-foreground text-xs">days</span>
          </span>
        )}
      </div>

      {/* ─── Brew This (primary CTA) ─────────────────────────────────────── */}
      <Link
        to={`/new-brew?recipeId=${recipe.id}`}
        className="block w-full text-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-copper to-copper/80 text-copper-foreground font-slab font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 mb-6"
      >
        {RECIPE.brewThis}
      </Link>

      {/* ─── Description ─────────────────────────────────────────────────── */}
      {recipe.description && (
        <div className="glass-panel rounded-xl p-4 mb-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{recipe.description}</p>
        </div>
      )}

      {/* ─── Two-column layout: Ingredients + Instructions ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Ingredients */}
        <div className="glass-panel rounded-xl p-4">
          <h2 className="font-slab font-semibold text-base mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-copper shrink-0" />
            Ingredients
          </h2>

          {recipe.ingredients ? (
            <div className="space-y-3">
              {ingredients.malts && ingredients.malts.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-copper font-semibold mb-1">Malts &amp; Grains</p>
                  <ul className="space-y-1">
                    {ingredients.malts.map((m, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-copper mt-1.5 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ingredients.hops && ingredients.hops.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-teal font-semibold mb-1">Hops</p>
                  <ul className="space-y-1">
                    {ingredients.hops.map((h, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-teal mt-1.5 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ingredients.yeast && ingredients.yeast.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold font-semibold mb-1">Yeast</p>
                  <ul className="space-y-1">
                    {ingredients.yeast.map((y, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-gold mt-1.5 shrink-0" />
                        {y}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ingredients.water && ingredients.water.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Water</p>
                  <ul className="space-y-1">
                    {ingredients.water.map((w, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ingredients.adjuncts && ingredients.adjuncts.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Adjuncts</p>
                  <ul className="space-y-1">
                    {ingredients.adjuncts.map((a, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No ingredients listed.</p>
          )}
        </div>

        {/* Brew day instructions */}
        <div className="glass-panel rounded-xl p-4">
          <h2 className="font-slab font-semibold text-base mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-teal shrink-0" />
            Brew Day Instructions
          </h2>

          {steps.length > 0 ? (
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-teal/20 text-teal text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {(step.step ?? i + 1)}
                  </span>
                  <p className="text-sm leading-relaxed">{step.instruction ?? String(step)}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground italic">No instructions listed.</p>
          )}
        </div>
      </div>

      {/* ─── Fermentation schedule (day-by-day) ─────────────────────────── */}
      <div className="glass-panel rounded-xl p-4 mb-5">
        <h2 className="font-slab font-semibold text-base mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-gold shrink-0" />
          Fermentation Schedule
        </h2>

        {stages.length > 0 ? (
          <div className="space-y-3">
            {/* Group by day */}
            {Object.entries(
              stages.reduce<Record<number, RecipeStage[]>>((acc, stage) => {
                const day = stage.day ?? 1;
                if (!acc[day]) acc[day] = [];
                acc[day].push(stage);
                return acc;
              }, {})
            )
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, dayStages]) => (
                <div key={day} className="flex gap-3">
                  {/* Day badge */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                      <span className="text-gold text-xs font-bold">D{day}</span>
                    </div>
                    {dayStages.length > 1 && (
                      <div className="flex-1 w-px bg-gold/20 my-1" />
                    )}
                  </div>

                  {/* Events for this day */}
                  <div className="flex-1 space-y-1.5 pb-2">
                    {dayStages.map((stage) => (
                      <div key={stage.id} className="flex items-start gap-2">
                        <span className="text-[10px] font-semibold text-gold mt-0.5 shrink-0">
                          {stage.action}
                        </span>
                        {stage.notes && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{stage.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No fermentation schedule available.</p>
        )}
      </div>

      {/* ─── Target numbers ──────────────────────────────────────────────── */}
      <div className="glass-panel rounded-xl p-4 mb-6">
        <h2 className="font-slab font-semibold text-base mb-3 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-copper shrink-0" />
          Target Numbers
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "OG", value: recipe.target_og ? recipe.target_og.toFixed(3) : "—" },
            { label: "FG", value: recipe.target_fg ? recipe.target_fg.toFixed(3) : "—" },
            { label: "ABV", value: recipe.abv != null ? `${recipe.abv}%` : "—" },
            { label: "IBU", value: recipe.ibu != null ? String(recipe.ibu) : "—" },
            { label: "SRM", value: recipe.srm != null ? String(recipe.srm) : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
              <span className="font-slab font-bold text-base">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Brew This (repeated CTA) ────────────────────────────────────── */}
      <Link
        to={`/new-brew?recipeId=${recipe.id}`}
        className="block w-full text-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-copper to-copper/80 text-copper-foreground font-slab font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
      >
        {RECIPE.brewThis}
      </Link>
    </div>
  );
};

export default RecipeDetail;