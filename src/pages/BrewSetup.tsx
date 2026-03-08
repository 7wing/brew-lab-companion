import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical,
  BookOpen,
  Package,
  Settings,
  Play,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

const steps = [
  { label: "Recipe", icon: BookOpen },
  { label: "Ingredients", icon: Package },
  { label: "Setup", icon: Settings },
  { label: "Start", icon: Play },
];

const recipes = [
  { id: 1, name: "New England IPA", type: "beer", time: "14 days" },
  { id: 2, name: "Ginger Kombucha", type: "kombucha", time: "14 days" },
  { id: 3, name: "Orange Blossom Mead", type: "mead", time: "90 days" },
  { id: 4, name: "Dry Farmhouse Cider", type: "cider", time: "28 days" },
  { id: 5, name: "Custom Recipe", type: "custom", time: "Variable" },
];

const ingredients = [
  { name: "Pale Malt (2-Row)", amount: "10 lb", inStock: true },
  { name: "Crystal 40L", amount: "1 lb", inStock: true },
  { name: "Citra Hops", amount: "3 oz", inStock: true },
  { name: "Mosaic Hops", amount: "2 oz", inStock: false },
  { name: "WLP001 Yeast", amount: "1 pack", inStock: true },
  { name: "Corn Sugar (Priming)", amount: "5 oz", inStock: true },
];

const fermenters = [
  { name: "6.5 Gal Carboy", available: true },
  { name: "5 Gal Bucket", available: true },
  { name: "Conical Fermenter", available: false },
  { name: "1 Gal Jug", available: true },
];

const BrewSetup = () => {
  const [step, setStep] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
  const [selectedFermenter, setSelectedFermenter] = useState<number | null>(null);
  const navigate = useNavigate();

  const fillPercent = ((step + 1) / steps.length) * 100;

  const canNext =
    (step === 0 && selectedRecipe !== null) ||
    step === 1 ||
    (step === 2 && selectedFermenter !== null) ||
    step === 3;

  const handleStart = () => {
    navigate("/");
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h1 className="font-slab text-2xl md:text-3xl font-bold mb-2">New Brew</h1>
      <p className="text-muted-foreground text-sm mb-6">Set up your next batch step by step</p>

      {/* Beaker progress */}
      <div className="flex items-end gap-6 mb-8">
        <div className="relative w-16 h-24 shrink-0">
          {/* Beaker shape */}
          <div className="absolute inset-x-1 bottom-0 top-4 rounded-b-xl border-2 border-border bg-muted/20 overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-copper/50 to-copper/20 transition-all duration-700 ease-out"
              style={{ height: `${fillPercent}%` }}
            >
              {/* Bubbles */}
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
          {steps.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  i < step
                    ? "bg-teal/20 border-teal/40 text-teal"
                    : i === step
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/30 border-border/40 text-muted-foreground"
                }`}
              >
                {i < step ? <Check size={18} /> : <s.icon size={18} />}
              </div>
              <span className={`text-[10px] font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="glass-panel rounded-xl p-5 mb-6 min-h-[300px]">
        {step === 0 && (
          <div className="animate-fade-in">
            <h2 className="font-slab font-semibold text-lg mb-4">Select Recipe</h2>
            <div className="space-y-2">
              {recipes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRecipe(r.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                    selectedRecipe === r.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FlaskConical size={16} className={selectedRecipe === r.id ? "text-primary" : "text-muted-foreground"} />
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r.type} · {r.time}</p>
                    </div>
                  </div>
                  {selectedRecipe === r.id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="font-slab font-semibold text-lg mb-1">Ingredients Check</h2>
            <p className="text-xs text-muted-foreground mb-4">Verify you have everything on hand</p>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-muted/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${ing.inStock ? "bg-teal" : "bg-destructive"}`} />
                    <div>
                      <p className="text-sm font-medium">{ing.name}</p>
                      <p className="text-xs text-muted-foreground">{ing.amount}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${ing.inStock ? "text-teal" : "text-destructive"}`}>
                    {ing.inStock ? "In Stock" : "Needed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="font-slab font-semibold text-lg mb-1">Fermenter Setup</h2>
            <p className="text-xs text-muted-foreground mb-4">Choose your vessel</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fermenters.map((f, i) => (
                <button
                  key={i}
                  onClick={() => f.available && setSelectedFermenter(i)}
                  disabled={!f.available}
                  className={`px-4 py-4 rounded-xl border text-left transition-all ${
                    !f.available
                      ? "opacity-40 cursor-not-allowed border-border/30"
                      : selectedFermenter === i
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border/50 hover:bg-muted/30"
                  }`}
                >
                  <Settings size={20} className={selectedFermenter === i ? "text-primary mb-2" : "text-muted-foreground mb-2"} />
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {f.available ? "Available" : "Unavailable"}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Target Temperature (°F)</label>
                <input
                  type="number"
                  defaultValue={66}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any setup notes..."
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in text-center py-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-copper/20 to-teal/20 flex items-center justify-center mb-4">
              <FlaskConical size={36} className="text-copper" />
            </div>
            <h2 className="font-slab font-semibold text-xl mb-2">Ready to Brew!</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Your batch is configured. Hit start to begin tracking fermentation.
            </p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-copper to-copper/80 text-copper-foreground font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Play size={18} />
              Start Fermentation
            </button>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {step < 3 && (
        <div className="flex justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={() => setStep(Math.min(3, step + 1))}
            disabled={!canNext}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BrewSetup;
