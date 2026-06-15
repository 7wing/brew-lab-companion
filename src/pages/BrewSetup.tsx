import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  FlaskConical,
  BookOpen,
  Leaf,
  Play,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Search,
} from "lucide-react";
import { useCreateBatch } from "@/hooks/useBatches";
import { useRecipes } from "@/hooks/useRecipes";
import { FORMS, BREW, ACTIONS } from "@/constants/copy";

// Step 1 schema
const step1Schema = z.object({
  name: z.string().min(1, FORMS.requiredField),
  type: z.enum(["beer", "cider", "mead", "kombucha", "wine", "sourdough"], {
    required_error: FORMS.requiredField,
  }),
  batch_size: z.coerce.number().min(0.1, "Must be at least 0.1"),
  brew_date: z.string().min(1, FORMS.requiredField),
});

// Step 2 — recipe selection is optional
const step2Schema = z.object({
  recipe_id: z.string().nullable(),
});

// Step 3 schema
const step3Schema = z.object({
  yeast_strain: z.string().min(1, FORMS.requiredField),
  target_og: z.coerce.number().min(0.5, "OG must be > 0.5").max(2.0, "OG must be < 2.0"),
  target_fg: z.coerce.number().min(0.5, "FG must be > 0.5").max(2.0, "FG must be < 2.0"),
  estimated_abv: z.coerce.number().min(0).max(30),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const BREW_TYPES = [
  { value: "beer", label: "Beer" },
  { value: "cider", label: "Cider" },
  { value: "mead", label: "Mead" },
  { value: "kombucha", label: "Kombucha" },
  { value: "wine", label: "Wine" },
  { value: "sourdough", label: "Sourdough" },
] as const;

const stepLabels = ["Basics", "Recipe", "Yeast & Targets", "Review"];
const stepIcons = [BookOpen, BookOpen, Leaf, Play];

function calcABV(og: number, fg: number): number {
  return parseFloat(((og - fg) * 131.25).toFixed(2));
}

const BrewSetup = () => {
  const navigate = useNavigate();
  const createBatch = useCreateBatch();

  // Step 1 form
  const step1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
      type: "beer",
      batch_size: 5,
      brew_date: new Date().toISOString().split("T")[0],
    },
  });

  // Step 2 — recipe selection
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [skipRecipe, setSkipRecipe] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState("");
  const { data: recipes = [] } = useRecipes();
  const [step2Confirmed, setStep2Confirmed] = useState(false);

  // Pre-fill from ?recipeId= URL param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get("recipeId");
    if (recipeId && recipes.length > 0) {
      const found = recipes.find((r: any) => r.id === recipeId);
      if (found) {
        setSelectedRecipeId(recipeId);
        setSkipRecipe(false);
        setStep2Confirmed(true);
        // Jump to step 1 (or let user review pre-filled data)
        setCurrentStep(0);
      }
    }
  }, [recipes]);

  // Step 3 form
  const step3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      yeast_strain: "",
      target_og: 1.050,
      target_fg: 1.010,
      estimated_abv: calcABV(1.050, 1.010),
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const fillPercent = ((currentStep + 1) / 4) * 100;

  // When a recipe is selected in step 2, pre-populate step 1 fields
  const selectedRecipe = recipes.find((r: any) => r.id === selectedRecipeId);

  useEffect(() => {
    if (selectedRecipe && !skipRecipe) {
      step1.setValue("name", selectedRecipe.title || "");
      step1.setValue("type", selectedRecipe.type || "beer");
      if (selectedRecipe.target_og) {
        step3.setValue("target_og", selectedRecipe.target_og);
      }
      if (selectedRecipe.target_fg) {
        step3.setValue("target_fg", selectedRecipe.target_fg);
      }
    }
  }, [selectedRecipe, skipRecipe]);

  // Recalculate ABV when OG or FG changes
  const watchedOg = step3.watch("target_og");
  const watchedFg = step3.watch("target_fg");
  useEffect(() => {
    const og = parseFloat(String(watchedOg)) || 0;
    const fg = parseFloat(String(watchedFg)) || 0;
    if (og > fg && fg > 0) {
      step3.setValue("estimated_abv", calcABV(og, fg), { shouldValidate: true });
    }
  }, [watchedOg, watchedFg]);

  // Validation per step
  const canNext = (() => {
    if (currentStep === 0) {
      const { name, type, batch_size, brew_date } = step1.getValues();
      return !!(name && type && batch_size && brew_date);
    }
    if (currentStep === 1) {
      return step2Confirmed;
    }
    if (currentStep === 2) {
      const { yeast_strain, target_og, target_fg } = step3.getValues();
      return !!(yeast_strain && target_og && target_fg && target_og > target_fg);
    }
    return true;
  })();

  const handleNext = async () => {
    if (currentStep === 0) {
      const valid = await step1.trigger();
      if (!valid) return;
    }
    if (currentStep === 1) {
      if (!selectedRecipeId && !skipRecipe) return;
      setStep2Confirmed(true);
    }
    if (currentStep === 2) {
      const valid = await step3.trigger();
      if (!valid) return;
      const { target_og, target_fg } = step3.getValues();
      if (target_og <= target_fg) {
        toast.error("Target OG must be greater than Target FG");
        return;
      }
    }
    setCurrentStep((s) => Math.min(3, s + 1));
  };

  const handleBack = () => setCurrentStep((s) => Math.max(0, s - 1));

  const handleStart = async () => {
    const s1 = step1.getValues();
    const s3 = step3.getValues();

    try {
      const data = await createBatch.mutateAsync({
        name: s1.name,
        type: s1.type as any,
        batch_size: s1.batch_size,
        brew_date: s1.brew_date,
        start_date: s1.brew_date,
        yeast_strain: s3.yeast_strain,
        og: s3.target_og,
        target_fg: s3.target_fg,
        status: "brew_day",
        target_days: 14,
        recipe_id: selectedRecipeId ?? undefined,
        notes: null,
      });

      if (data?.id) {
        toast.success("Batch created!");
        navigate(`/batch/${data.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create batch");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h1 className="font-slab text-2xl md:text-3xl font-bold mb-2">{BREW.startNewBrew}</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Set up your next batch — {stepLabels[currentStep]}
      </p>

      {/* Beaker progress */}
      <div className="flex items-end gap-6 mb-8">
        <div className="relative w-16 h-24 shrink-0">
          <div className="absolute inset-x-1 bottom-0 top-4 rounded-b-xl border-2 border-border bg-muted/20 overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-copper/50 to-copper/20 transition-all duration-700 ease-out"
              style={{ height: `${fillPercent}%` }}
            >
              <div className="absolute bottom-1 left-1/4 w-1.5 h-1.5 rounded-full bg-copper/30 animate-bubble-slow" style={{ animationDelay: "0s" }} />
              <div className="absolute bottom-2 left-2/3 w-1 h-1 rounded-full bg-copper/20 animate-bubble-slow" style={{ animationDelay: "1s" }} />
              <div className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full bg-copper/25 animate-bubble-slow" style={{ animationDelay: "2s" }} />
            </div>
          </div>
          <div className="absolute top-0 inset-x-0 h-4 flex items-center justify-center">
            <div className="w-10 h-3 rounded-t border-2 border-b-0 border-border bg-muted/30" />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex-1 flex gap-1">
          {stepLabels.map((label, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    i < currentStep
                      ? "bg-teal/20 border-teal/40 text-teal"
                      : i === currentStep
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted/30 border-border/40 text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span className={`text-[10px] font-medium ${i === currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="glass-panel rounded-xl p-5 mb-6 min-h-[320px]">

        {/* ── Step 1: Basics ── */}
        {currentStep === 0 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="font-slab font-semibold text-lg">Basics</h2>

            <div>
              <label className="text-sm font-medium block mb-1.5">Batch Name *</label>
              <input
                {...step1.register("name")}
                placeholder="e.g., Summer Haze IPA"
                className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
              />
              {step1.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">{step1.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Brew Type *</label>
              <select
                {...step1.register("type")}
                className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
              >
                {BREW_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Batch Size (gal) *</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                {...step1.register("batch_size")}
                className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
              />
              {step1.formState.errors.batch_size && (
                <p className="text-xs text-destructive mt-1">{step1.formState.errors.batch_size.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Brew Date *</label>
              <input
                type="date"
                max={today}
                {...step1.register("brew_date")}
                className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
              />
              {step1.formState.errors.brew_date && (
                <p className="text-xs text-destructive mt-1">{step1.formState.errors.brew_date.message}</p>
              )}
              {step1.watch("brew_date") > today && (
                <p className="text-xs text-destructive mt-1">Date cannot be in the future</p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Recipe ── */}
        {currentStep === 1 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="font-slab font-semibold text-lg">Link a Recipe</h2>
            <p className="text-xs text-muted-foreground">Search your saved recipes or skip to enter targets manually</p>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search recipes..."
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
              />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recipes
                .filter((r: any) =>
                  !recipeSearch ||
                  r.title?.toLowerCase().includes(recipeSearch.toLowerCase())
                )
                .slice(0, 20)
                .map((r: any) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRecipeId(r.id);
                      setSkipRecipe(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                      selectedRecipeId === r.id && !skipRecipe
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FlaskConical
                        size={16}
                        className={selectedRecipeId === r.id && !skipRecipe ? "text-primary" : "text-muted-foreground"}
                      />
                      <div>
                        <p className="text-sm font-medium">{r.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {r.type} {r.target_og ? `· OG ${r.target_og}` : ""}
                        </p>
                      </div>
                    </div>
                    {selectedRecipeId === r.id && !skipRecipe && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check size={12} className="text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
            </div>

            {recipes.length === 0 && !recipeSearch && (
              <p className="text-sm text-muted-foreground text-center py-4">No saved recipes yet.</p>
            )}

            <button
              onClick={() => {
                setSkipRecipe(true);
                setSelectedRecipeId(null);
                setStep2Confirmed(true);
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                skipRecipe
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border/50 hover:bg-muted/30"
              }`}
            >
              Skip — I'll enter targets manually
            </button>
          </div>
        )}

        {/* ── Step 3: Yeast & Targets ── */}
        {currentStep === 2 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="font-slab font-semibold text-lg">Yeast &amp; Targets</h2>

            <div>
              <label className="text-sm font-medium block mb-1.5">Yeast Strain *</label>
              <input
                {...step3.register("yeast_strain")}
                placeholder="e.g., WLP001 California Ale"
                className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
              />
              {step3.formState.errors.yeast_strain && (
                <p className="text-xs text-destructive mt-1">{step3.formState.errors.yeast_strain.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">Target OG *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.5"
                  max="2.0"
                  {...step3.register("target_og")}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
                />
                {step3.formState.errors.target_og && (
                  <p className="text-xs text-destructive mt-1">{step3.formState.errors.target_og.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Target FG *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.5"
                  max="2.0"
                  {...step3.register("target_fg")}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
                />
                {step3.formState.errors.target_fg && (
                  <p className="text-xs text-destructive mt-1">{step3.formState.errors.target_fg.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Estimated ABV (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  {...step3.register("estimated_abv")}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
                />
                <span className="text-xs text-muted-foreground shrink-0">Auto: {(parseFloat(String(watchedOg)) - parseFloat(String(watchedFg))) * 131.25 > 0 ? calcABV(parseFloat(String(watchedOg)) || 0, parseFloat(String(watchedFg)) || 0) : "—"}%</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Review & Start ── */}
        {currentStep === 3 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="font-slab font-semibold text-lg">Review &amp; Start</h2>

            <div className="space-y-3">
              <ReviewRow label="Batch Name" value={step1.getValues("name")} />
              <ReviewRow label="Type" value={BREW_TYPES.find(t => t.value === step1.getValues("type"))?.label ?? step1.getValues("type")} />
              <ReviewRow label="Batch Size" value={`${step1.getValues("batch_size")} gal`} />
              <ReviewRow label="Brew Date" value={step1.getValues("brew_date")} />
              <ReviewRow label="Yeast Strain" value={step3.getValues("yeast_strain")} />
              <ReviewRow label="Target OG" value={step3.getValues("target_og").toFixed(3)} />
              <ReviewRow label="Target FG" value={step3.getValues("target_fg").toFixed(3)} />
              <ReviewRow label="Est. ABV" value={`${step3.getValues("estimated_abv")}%`} />
              {selectedRecipe && (
                <ReviewRow label="Recipe" value={selectedRecipe.title} />
              )}
            </div>

            <div className="border-t border-border/40 pt-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-copper/20 to-teal/20 flex items-center justify-center">
                <FlaskConical size={24} className="text-copper" />
              </div>
              <div>
                <p className="text-sm font-medium">Ready to start fermentation?</p>
                <p className="text-xs text-muted-foreground">This batch will appear on your Brew Bench in the Brew day stage.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || createBatch.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} /> {ACTIONS.back}
        </button>

        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={createBatch.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper/80 text-copper-foreground font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createBatch.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}
            Start brew
          </button>
        )}
      </div>
    </div>
  );
};

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-muted/20 border border-border/30">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default BrewSetup;