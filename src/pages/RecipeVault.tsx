import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Search,
  FlaskConical,
  Filter,
  Star,
  Clock,
  Percent,
  Loader2,
  Plus,
  X,
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Slider } from "@/components/ui/slider";
import { useRecipes, useCreateRecipe, useUpdateRecipe } from "@/hooks/useRecipes";

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  beer: { label: "Beer", color: "text-copper", bg: "bg-copper/10 border-copper/20" },
  kombucha: { label: "Kombucha", color: "text-teal", bg: "bg-teal/10 border-teal/20" },
  mead: { label: "Mead", color: "text-gold", bg: "bg-gold/10 border-gold/20" },
  cider: { label: "Cider", color: "text-copper", bg: "bg-copper/10 border-copper/15" },
  sourdough: { label: "Sourdough", color: "text-gold", bg: "bg-gold/10 border-gold/15" },
  ferment: { label: "Ferment", color: "text-teal", bg: "bg-teal/10 border-teal/15" },
};

const filters = ["All", "Beer", "Kombucha", "Mead", "Cider", "Sourdough", "Ferment"];

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["beer", "kombucha", "mead", "cider", "sourdough", "ferment"]),
  abv: z.coerce.number().min(0).max(30).optional(),
  estimated_days: z.coerce.number().min(1).max(365).optional(),
  difficulty: z.coerce.number().min(1).max(3),
  description: z.string().optional(),
});

type RecipeForm = z.infer<typeof recipeSchema>;

const RecipeVault = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const typeFilter = activeFilter === "All" ? undefined : activeFilter.toLowerCase();
  const { data: recipes, isLoading } = useRecipes(typeFilter, search);

  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      type: "beer",
      difficulty: 2,
      abv: 5,
      estimated_days: 14,
    },
  });

  const difficultyValue = watch("difficulty") ?? 2;

  function onSubmit(data: RecipeForm) {
    createRecipe.mutate(
      {
        title: data.title,
        type: data.type,
        abv: data.abv ?? null,
        estimated_days: data.estimated_days ?? null,
        difficulty: data.difficulty,
        description: data.description || null,
        ingredients: [],
        steps: [],
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          reset();
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to create recipe");
        },
      }
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-slab text-2xl md:text-3xl font-bold">Recipe Vault</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? "Loading…" : `${recipes?.length ?? 0} recipes catalogued`}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal to-teal/80 text-teal-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              <Plus size={16} />
              New Recipe
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-slab">New Recipe</DialogTitle>
              <DialogDescription>
                Add a recipe to your vault.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Recipe name" {...register("title")} />
                {errors.title && (
                  <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(v) =>
                    setValue("type", v as RecipeForm["type"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(typeConfig).map((t) => (
                      <SelectItem key={t} value={t}>
                        {typeConfig[t].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="abv">ABV (%)</Label>
                  <Input
                    id="abv"
                    type="number"
                    step="0.1"
                    {...register("abv")}
                  />
                </div>
                <div>
                  <Label htmlFor="days">Est. Days</Label>
                  <Input
                    id="days"
                    type="number"
                    {...register("estimated_days")}
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center justify-between">
                  <span>Difficulty</span>
                  <span className="text-xs text-muted-foreground">
                    {Array.from({ length: 3 }, (_, i) => (
                      <span
                        key={i}
                        className={i < difficultyValue ? "text-copper" : "text-muted"}
                      >
                        ●
                      </span>
                    ))}
                  </span>
                </Label>
                <Slider
                  value={[difficultyValue]}
                  onValueChange={(v) => setValue("difficulty", v[0])}
                  min={1}
                  max={3}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional description..."
                  {...register("description")}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createRecipe.isPending}>
                  {createRecipe.isPending && (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  )}
                  Save Recipe
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Filters */}
      <div className="glass-panel rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:bg-muted transition-colors sm:hidden">
                <Filter size={14} /> Filters
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="sm:max-w-md max-w-full">
              <SheetHeader>
                <SheetTitle className="font-slab">Filter Recipes</SheetTitle>
              </SheetHeader>
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeFilter === f
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden sm:flex gap-2 mt-3 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
          {(recipes ?? []).map((recipe: any) => {
            const config = typeConfig[recipe.type] ?? typeConfig.ferment;
            return (
              <div
                key={recipe.id}
                className={`glass-panel rounded-xl p-4 border ${config.bg} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-widest ${config.color}`}>
                    {config.label}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateRecipe.mutate({
                        id: recipe.id,
                        starred: !recipe.starred,
                      });
                    }}
                    className="p-1 rounded-md hover:bg-muted transition-colors"
                    aria-label="Toggle star"
                  >
                    <Star
                      size={14}
                      className={
                        recipe.starred ? "text-gold fill-gold" : "text-muted-foreground"
                      }
                    />
                  </button>
                </div>
                <h3 className="font-slab font-semibold text-base mb-3">{recipe.title}</h3>

                <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                  {recipe.abv != null && recipe.abv > 0 && (
                    <span className="flex items-center gap-1">
                      <Percent size={12} /> {recipe.abv}% ABV
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {recipe.estimated_days ?? "?"}d
                  </span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < (recipe.difficulty ?? 1) ? "bg-copper" : "bg-muted"
                        }`}
                      />
                    ))}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const ings = Array.isArray(recipe.ingredients)
                      ? recipe.ingredients.map((ing: any) =>
                          typeof ing === "string" ? ing : ing.name
                        )
                      : [];
                    return (
                      <>
                        {ings.slice(0, 3).map((ing: string, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground"
                          >
                            {ing}
                          </span>
                        ))}
                        {ings.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                            +{ings.length - 3}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Featured Lab Partner */}
      <div className="mt-8 glass-panel rounded-xl p-5 border-copper/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-copper/20 flex items-center justify-center shrink-0">
          <FlaskConical size={24} className="text-copper" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-copper font-semibold mb-1">Featured Yeast — Lab Partner</p>
          <p className="text-sm font-medium">Belgian Saison WLP565</p>
          <p className="text-xs text-muted-foreground mt-0.5">Perfect for farmhouse ales. High attenuation, complex phenolics. Supplied by BrewCraft Yeasts.</p>
        </div>
      </div>
    </div>
  );
};

export default RecipeVault;
