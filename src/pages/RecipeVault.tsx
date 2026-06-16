import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  FlaskConical,
  Filter,
  Star,
  Clock,
  Percent,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Award,
} from "lucide-react";
import { ShareRecipeWizard } from "@/components/ShareRecipeWizard"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRecipes, useFeaturedRecipes, useUpdateRecipe, useDeleteRecipe, type RecipeFilters } from "@/hooks/useRecipes";
import { RECIPE, ACTIONS } from "@/constants/copy";

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  beer: { label: "Beer", color: "text-copper", bg: "bg-copper/10 border-copper/20" },
  kombucha: { label: "Kombucha", color: "text-teal", bg: "bg-teal/10 border-teal/20" },
  mead: { label: "Mead", color: "text-gold", bg: "bg-gold/10 border-gold/20" },
  cider: { label: "Cider", color: "text-copper", bg: "bg-copper/10 border-copper/15" },
  sourdough: { label: "Sourdough", color: "text-gold", bg: "bg-gold/10 border-gold/15" },
  ferment: { label: "Ferment", color: "text-teal", bg: "bg-teal/10 border-teal/15" },
  wine: { label: "Wine", color: "text-copper", bg: "bg-copper/10 border-copper/20" },
};

const BREW_TYPES = ["Beer", "Cider", "Mead", "Kombucha", "Wine", "Sourdough"] as const;
const DIFFICULTY_OPTIONS = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Intermediate" },
  { value: 3, label: "Advanced" },
] as const;
const BATCH_SIZES = [
  { value: 1, label: "1 gal" },
  { value: 5, label: "5 gal" },
  { value: 10, label: "10 gal" },
] as const;
const STYLE_OPTIONS = ["IPA", "Stout", "Saison", "Lager", "Wheat", "Sour", "Pilsner", "Porter", "Blonde", "Amber"];
const SORT_OPTIONS = [
  { value: "most_brewed", label: "Most Brewed" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "quickest", label: "Quickest" },
] as const;



function DifficultyDots({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < (value ?? 1) ? "bg-copper" : "bg-muted"}`}
        />
      ))}
    </span>
  );
}

function SrmSwatch({ srm }: { srm: number | null }) {
  if (!srm || srm <= 0) {
    return (
      <span
        className="w-3 h-3 rounded-full border border-border/40 bg-muted/40 shrink-0"
        title="SRM not set"
      />
    );
  }
  // SRM color approximation
  const color =
    srm < 3 ? "#FFE500" :
    srm < 6 ? "#F5C200" :
    srm < 9 ? "#D4850A" :
    srm < 14 ? "#BF4D05" :
    srm < 20 ? "#620E02" :
    srm < 30 ? "#250100" :
    "#0A0000";
  return (
    <span
      className="w-3 h-3 rounded-full shrink-0 border border-border/30"
      style={{ backgroundColor: color }}
      title={`SRM ${srm}`}
    />
  );
}

function RecipeCard({ recipe, onToggleStar }: { recipe: any; onToggleStar: () => void }) {
  const navigate = useNavigate();
  const config = typeConfig[recipe.type] ?? typeConfig.ferment;
  return (
    <div
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      className={`glass-panel rounded-xl p-4 border ${config.bg} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col gap-2`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${config.color}`}>
            {config.label}
          </span>
          {recipe.style && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium">
              {recipe.style}
            </span>
          )}
          {recipe.featured && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/20 text-gold font-semibold">
              Featured
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
          className="p-1 rounded-md hover:bg-muted transition-colors shrink-0"
          aria-label="Toggle star"
        >
          <Star
            size={14}
            className={recipe.starred ? "text-gold fill-gold" : "text-muted-foreground"}
          />
        </button>
      </div>

      <h3 className="font-slab font-semibold text-base leading-tight">{recipe.title}</h3>

      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        {recipe.abv != null && recipe.abv > 0 && (
          <span className="flex items-center gap-1">
            <Percent size={11} /> {recipe.abv}% ABV
          </span>
        )}
        {recipe.ibu != null && recipe.ibu > 0 && (
          <span className="flex items-center gap-1">
            {recipe.ibu} IBU
          </span>
        )}
        <SrmSwatch srm={recipe.srm} />
        <DifficultyDots value={recipe.difficulty} />
        <span className="flex items-center gap-1">
          <Clock size={11} /> {recipe.estimated_days ?? "?"}d
        </span>
        {recipe.star_rating != null && recipe.star_rating > 0 && (
          <span className="flex items-center gap-0.5 ml-auto">
            <Star size={11} className="text-gold fill-gold" />
            {Number(recipe.star_rating).toFixed(1)}
          </span>
        )}
      </div>

      {/* Desktop: Submitted by / Curated badge */}
      <div className="hidden md:flex items-center gap-1.5 mt-auto pt-1 border-t border-border/20">
        {recipe.curated ? (
          <span className="flex items-center gap-1 text-[10px] text-gold font-semibold">
            <Award size={10} /> Curated
          </span>
        ) : recipe.profiles ? (
          <>
            {recipe.profiles.avatar_url ? (
              <img
                src={recipe.profiles.avatar_url}
                alt={recipe.profiles.username}
                className="w-4 h-4 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">
                {(recipe.profiles.username ?? recipe.profiles.display_name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-[10px] text-muted-foreground">
              @ {recipe.profiles.username ?? recipe.profiles.display_name}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

function FeaturedCard({ recipe, onSelect }: { recipe: any; onSelect: () => void }) {
  const config = typeConfig[recipe.type] ?? typeConfig.ferment;
  return (
    <div
      onClick={onSelect}
      className={`glass-panel rounded-xl p-4 border border-gold/20 ${config.bg} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer min-w-[260px] max-w-[280px] shrink-0`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold uppercase tracking-widest ${config.color}`}>
              {config.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gold/20 text-gold font-semibold">
              <Award size={9} /> Featured
            </span>
          </div>
          {recipe.style && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground w-fit">
              {recipe.style}
            </span>
          )}
        </div>
        <Star className="text-gold fill-gold shrink-0" size={14} />
      </div>
      <h3 className="font-slab font-semibold text-sm mb-2 leading-snug">{recipe.title}</h3>
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        {recipe.abv != null && recipe.abv > 0 && (
          <span className="flex items-center gap-1"><Percent size={10} /> {recipe.abv}%</span>
        )}
        {recipe.ibu != null && recipe.ibu > 0 && <span>{recipe.ibu} IBU</span>}
        <SrmSwatch srm={recipe.srm} />
        <DifficultyDots value={recipe.difficulty} />
        <span className="flex items-center gap-1"><Clock size={10} /> {recipe.estimated_days ?? "?"}d</span>
      </div>
      {recipe.star_rating && (
        <div className="flex items-center gap-0.5 mt-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={9} className={i < (recipe.star_rating ?? 0) ? "text-gold fill-gold" : "text-muted/50"} />
          ))}
        </div>
      )}
    </div>
  );
}

function FiltersPanel({
  filters,
  onChange,
  onClear,
}: {
  filters: RecipeFilters;
  onChange: (f: RecipeFilters) => void;
  onClear: () => void;
}) {
  const [localFilters, setLocalFilters] = useState<RecipeFilters>(filters);

  function apply() {
    onChange(localFilters);
  }

  function handleTypeChange(type: string) {
    setLocalFilters((prev) => ({ ...prev, type: prev.type === type ? undefined : type }));
  }

  return (
    <div className="space-y-4">
      {/* Brew Type */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Brew Type
        </Label>
        <div className="flex flex-wrap gap-2">
          {BREW_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                localFilters.type === t
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Style
        </Label>
        <Select
          value={localFilters.style ?? ""}
          onValueChange={(v) => setLocalFilters((prev) => ({ ...prev, style: v || undefined }))}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Any style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any style</SelectItem>
            {STYLE_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Difficulty
        </Label>
        <div className="flex gap-2">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() =>
                setLocalFilters((prev) => ({
                  ...prev,
                  difficulty: prev.difficulty === d.value ? undefined : d.value,
                }))
              }
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                localFilters.difficulty === d.value
                  ? "bg-copper text-copper-foreground shadow-sm border border-copper/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Size */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Batch Size
        </Label>
        <div className="flex gap-2">
          {BATCH_SIZES.map((b) => (
            <button
              key={b.value}
              onClick={() =>
                setLocalFilters((prev) => ({
                  ...prev,
                  batchSize: prev.batchSize === b.value ? undefined : b.value,
                }))
              }
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                localFilters.batchSize === b.value
                  ? "bg-teal text-teal-foreground shadow-sm border border-teal/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* ABV Range */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          ABV Range
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            max={30}
            step={0.1}
            className="h-9 text-sm"
            value={localFilters.abvMin ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                abvMin: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            max={30}
            step={0.1}
            className="h-9 text-sm"
            value={localFilters.abvMax ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                abvMax: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <span className="text-muted-foreground text-xs">%</span>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onClear} className="flex-1">
          {ACTIONS.cancel}
        </Button>
        <Button size="sm" onClick={apply} className="flex-1">
          Apply
        </Button>
      </div>
    </div>
  );
}

const RecipeVault = () => {
  const [activeView, setActiveView] = useState<"all" | "curated">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<RecipeFilters["sort"]>("newest");
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const resolvedFilters: RecipeFilters = {
    ...filters,
    search: search || undefined,
    sort,
    curated: activeView === "curated" ? true : undefined,
  };

  const { data: recipes, isLoading } = useRecipes(resolvedFilters);
  const { data: featured } = useFeaturedRecipes();

  const updateRecipe = useUpdateRecipe();
  const deleteRecipe = useDeleteRecipe();

  return (
    <div className="animate-fade-in">
      {/* Search + Filters Row */}
      <div className="glass-panel rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Dominant Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Filters Dropdown */}
          <DropdownMenu open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                <SlidersHorizontal size={14} />
                Filters
                {Object.keys(filters).length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-copper text-copper-foreground text-[10px] font-bold flex items-center justify-center">
                    {Object.keys(filters).filter((k) => {
                      const v = (filters as any)[k];
                      return v !== undefined && v !== "" && k !== "sort" && k !== "search";
                    }).length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-4">
              <FiltersPanel
                filters={filters}
                onChange={(f) => { setFilters(f); }}
                onClear={() => { setFilters({}); setFiltersOpen(false); }}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Share Recipe Button — outlined */}
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal/40 text-teal text-sm font-medium hover:bg-teal/10 transition-all shrink-0"
          >
            <Plus size={16} />
            {RECIPE.shareRecipe}
          </button>

          <ShareRecipeWizard open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>

        {/* All / Curated Toggle + Sort Row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 gap-4 flex-wrap">
          {/* All / Curated toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/40">
            <button
              onClick={() => setActiveView("all")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeView === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveView("curated")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeView === "curated"
                  ? "bg-gold/20 text-gold shadow-sm border border-gold/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Curated
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{ACTIONS.sort}:</span>
            <Select value={sort} onValueChange={(v: RecipeFilters["sort"]) => setSort(v)}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Featured Horizontal Strip */}
      {!isLoading && (featured ?? []).length > 0 && activeView === "all" && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-gold" />
            <h2 className="font-slab text-sm font-semibold">{RECIPE.featuredRecipes}</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
            {featured!.map((recipe: any) => (
              <div key={recipe.id} className="snap-start">
                <FeaturedCard
                  recipe={recipe}
                  onSelect={() => navigate(`/recipe/${recipe.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Grid */}

      {/* Recipe Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (recipes ?? []).length === 0 ? (
        <div className="glass-panel rounded-xl p-8 text-center">
          <p className="text-muted-foreground mb-4">No recipes found.</p>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal to-teal/80 text-teal-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Add Your First Recipe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {(recipes ?? []).map((recipe: any) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onToggleStar={() =>
                updateRecipe.mutate({ id: recipe.id, starred: !recipe.starred })
              }
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default RecipeVault;