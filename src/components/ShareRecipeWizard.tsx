import { useState } from "react"
import { toast } from "sonner"
import { Plus, X, ChevronRight, ChevronLeft, Loader2, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateRecipe } from "@/hooks/useRecipes"
import { RECIPE, ACTIONS } from "@/constants/copy"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

// ─── Types ───────────────────────────────────────────────────────────────────

type BrewType = "beer" | "cider" | "mead" | "kombucha" | "wine" | "sourdough" | "ferment"
type Difficulty = 1 | 2 | 3

interface MaltRow { name: string; amount: string; unit: string }
interface HopsRow { name: string; amount: string; time: string }
interface BrewStep { instruction: string }
interface FermentStage { day: number; action: string; notes: string }

interface Step1Data { title: string; type: BrewType; style: string; difficulty: Difficulty; batchSize: number; batchUnit: string }
interface Step2Data { malts: MaltRow[]; hops: HopsRow[]; yeast: string; waterAdditions: string; adjuncts: string }
interface Step3Data { brewSteps: BrewStep[]; fermentStages: FermentStage[] }
interface Step4Data { targetOg: string; targetFg: string; abv: string; ibu: string; srm: string }

interface WizardData {
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  step4: Step4Data
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BREW_TYPES: { value: BrewType; label: string }[] = [
  { value: "beer", label: "Beer" },
  { value: "cider", label: "Cider" },
  { value: "mead", label: "Mead" },
  { value: "kombucha", label: "Kombucha" },
  { value: "wine", label: "Wine" },
  { value: "sourdough", label: "Sourdough" },
  { value: "ferment", label: "Ferment" },
]

const STYLE_OPTIONS = [
  "IPA","Stout","Saison","Lager","Wheat","Sour","Pilsner","Porter",
  "Blonde","Amber","PALE_ALE","BROWN_ALE","BITTER","BARLEYWINE",
  "CIDER","PERRY","PYMENT","CYSER","MELOMEL","BOOCH","GINGER_BOOCH",
  "ROSE","PORT","SHERKY","Rye_Bread","SANTE_FE_UNLEAVENED",
]

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
}

const STEPS = [
  { n: 1, label: "Basics" },
  { n: 2, label: "Ingredients" },
  { n: 3, label: "Instructions" },
  { n: 4, label: "Targets" },
  { n: 5, label: "Review" },
]

const EMPTY_DEFAULT: WizardData = {
  step1: { title: "", type: "beer", style: "", difficulty: 1, batchSize: 5, batchUnit: "gal" },
  step2: { malts: [{ name: "", amount: "", unit: "lb" }], hops: [{ name: "", amount: "", time: "" }], yeast: "", waterAdditions: "", adjuncts: "" },
  step3: { brewSteps: [{ instruction: "" }], fermentStages: [{ day: 1, action: "", notes: "" }] },
  step4: { targetOg: "", targetFg: "", abv: "", ibu: "", srm: "" },
}

// ─── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              s.n < current
                ? "bg-copper text-copper-foreground"
                : s.n === current
                ? "bg-teal text-teal-foreground shadow-md ring-2 ring-teal/30"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s.n < current ? <Check size={12} /> : s.n}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-6 h-0.5 ${s.n < current ? "bg-copper" : "bg-muted"}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-muted-foreground font-medium">
        {STEPS[current - 1].label}
      </span>
    </div>
  )
}

// ─── Step 1 — Basics ──────────────────────────────────────────────────────────

function Step1({
  data, onChange,
}: {
  data: Step1Data
  onChange: (d: Partial<Step1Data>) => void
}) {
  const hasRequired =
    data.title.trim().length > 0 && data.style.trim().length > 0

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="s1-title">Recipe Name *</Label>
        <Input
          id="s1-title"
          placeholder="e.g. Sunset Boulevard IPA"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="s1-type">Brew Type *</Label>
        <Select value={data.type} onValueChange={(v) => onChange({ type: v as BrewType })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BREW_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="s1-style">Style *</Label>
        <Select value={data.style} onValueChange={(v) => onChange({ style: v })}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {STYLE_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Difficulty *</Label>
        <div className="flex gap-2">
          {([1, 2, 3] as Difficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChange({ difficulty: d })}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                data.difficulty === d
                  ? d === 1
                    ? "bg-teal/20 border-teal/40 text-teal"
                    : d === 2
                    ? "bg-copper/20 border-copper/40 text-copper"
                    : "bg-gold/20 border-gold/40 text-gold"
                  : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted"
              }`}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-1 block">Batch Size *</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={0.5}
            step={0.5}
            value={data.batchSize}
            onChange={(e) => onChange({ batchSize: parseFloat(e.target.value) || 0 })}
            className="w-24"
          />
          <Select value={data.batchUnit} onValueChange={(v) => onChange({ batchUnit: v })}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["gal", "L", "bbl"].map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2 — Ingredients ─────────────────────────────────────────────────────

function Step2({
  data, onChange,
}: {
  data: Step2Data
  onChange: (d: Partial<Step2Data>) => void
}) {
  const setMalts = (malts: MaltRow[]) => onChange({ malts })
  const setHops = (hops: HopsRow[]) => onChange({ hops })

  const hasRequired = data.malts.some((m) => m.name.trim() && m.amount.trim()) &&
    data.hops.some((h) => h.name.trim() && h.amount.trim()) &&
    data.yeast.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Malts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Malts / Fermentables *</Label>
          <Button
            type="button" variant="ghost" size="sm" className="gap-1 text-xs h-7"
            onClick={() => setMalts([...data.malts, { name: "", amount: "", unit: "lb" }])}
          >
            <Plus size={12} /> Add Malt
          </Button>
        </div>
        <div className="space-y-2">
          {data.malts.map((m, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Malt name (e.g. Pilsner)"
                  value={m.name}
                  onChange={(e) => {
                    const malts = [...data.malts]; malts[i].name = e.target.value; setMalts(malts)
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  placeholder="Amt"
                  min={0}
                  step={0.1}
                  value={m.amount}
                  onChange={(e) => {
                    const malts = [...data.malts]; malts[i].amount = e.target.value; setMalts(malts)
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <Select value={m.unit} onValueChange={(v) => {
                const malts = [...data.malts]; malts[i].unit = v; setMalts(malts)
              }}>
                <SelectTrigger className="w-16 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["lb","kg","oz","g"].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                onClick={() => setMalts(data.malts.filter((_, j) => j !== i))}
              >
                <X size={14} className="text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Hops */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Hops * {data.type !== "beer" && <span className="text-xs text-muted-foreground">(optional)</span>}</Label>
          <Button
            type="button" variant="ghost" size="sm" className="gap-1 text-xs h-7"
            onClick={() => setHops([...data.hops, { name: "", amount: "", time: "" }])}
          >
            <Plus size={12} /> Add Hop
          </Button>
        </div>
        <div className="space-y-2">
          {data.hops.map((h, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Hop name (e.g. Centennial)"
                  value={h.name}
                  onChange={(e) => {
                    const hops = [...data.hops]; hops[i].name = e.target.value; setHops(hops)
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-20">
                <Input
                  type="number" placeholder="oz" min={0} step={0.1}
                  value={h.amount}
                  onChange={(e) => {
                    const hops = [...data.hops]; hops[i].amount = e.target.value; setHops(hops)
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-24">
                <Input
                  placeholder="Time (min)"
                  value={h.time}
                  onChange={(e) => {
                    const hops = [...data.hops]; hops[i].time = e.target.value; setHops(hops)
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                onClick={() => setHops(data.hops.filter((_, j) => j !== i))}
              >
                <X size={14} className="text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Yeast */}
      <div>
        <Label htmlFor="s2-yeast">Yeast Strain *</Label>
        <Input
          id="s2-yeast"
          placeholder="e.g. WLP001 California Ale"
          value={data.yeast}
          onChange={(e) => onChange({ yeast: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* Water additions */}
      <div>
        <Label htmlFor="s2-water">Water Additions</Label>
        <Input
          id="s2-water"
          placeholder="e.g. Gypsum 1 tsp, CaCl 0.5 tsp"
          value={data.waterAdditions}
          onChange={(e) => onChange({ waterAdditions: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* Adjuncts */}
      <div>
        <Label htmlFor="s2-adjuncts">Adjuncts</Label>
        <Input
          id="s2-adjuncts"
          placeholder="e.g. Coriander, orange peel, vanilla bean"
          value={data.adjuncts}
          onChange={(e) => onChange({ adjuncts: e.target.value })}
          className="mt-1"
        />
      </div>
    </div>
  )
}

// ─── Step 3 — Instructions ─────────────────────────────────────────────────────

function Step3({
  data, onChange,
}: {
  data: Step3Data
  onChange: (d: Partial<Step3Data>) => void
}) {
  const setBrewSteps = (brewSteps: BrewStep[]) => onChange({ brewSteps })
  const setFermentStages = (stages: FermentStage[]) => onChange({ fermentStages })

  return (
    <div className="space-y-6">
      {/* Brew day instructions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Brew Day Instructions *</Label>
          <Button
            type="button" variant="ghost" size="sm" className="gap-1 text-xs h-7"
            onClick={() => setBrewSteps([...data.brewSteps, { instruction: "" }])}
          >
            <Plus size={12} /> Add Step
          </Button>
        </div>
        <div className="space-y-2">
          {data.brewSteps.map((s, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs font-bold text-copper mt-2 w-5 shrink-0 text-right">{i + 1}.</span>
              <Textarea
                placeholder={`Step ${i + 1} instructions...`}
                value={s.instruction}
                onChange={(e) => {
                  const steps = [...data.brewSteps]; steps[i].instruction = e.target.value; setBrewSteps(steps)
                }}
                className="min-h-[60px] text-sm resize-none"
                rows={2}
              />
              <Button
                type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 mt-1"
                onClick={() => setBrewSteps(data.brewSteps.filter((_, j) => j !== i))}
              >
                <X size={14} className="text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Fermentation schedule */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Fermentation Schedule *</Label>
          <Button
            type="button" variant="ghost" size="sm" className="gap-1 text-xs h-7"
            onClick={() =>
              setFermentStages([...data.fermentStages, { day: data.fermentStages.length + 1, action: "", notes: "" }])
            }
          >
            <Plus size={12} /> Add Stage
          </Button>
        </div>
        <div className="space-y-2">
          {data.fermentStages.map((fs, i) => (
            <div key={i} className="glass-panel rounded-lg p-3 space-y-2">
              <div className="flex gap-2 items-end">
                <div className="w-16 shrink-0">
                  <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Day</Label>
                  <Input
                    type="number"
                    min={1}
                    value={fs.day}
                    onChange={(e) => {
                      const stages = [...data.fermentStages]; stages[i].day = parseInt(e.target.value) || 1; setFermentStages(stages)
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Action</Label>
                  <Input
                    placeholder="e.g. D Rest, Crash cool"
                    value={fs.action}
                    onChange={(e) => {
                      const stages = [...data.fermentStages]; stages[i].action = e.target.value; setFermentStages(stages)
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                  onClick={() => setFermentStages(data.fermentStages.filter((_, j) => j !== i))}
                >
                  <X size={14} className="text-muted-foreground" />
                </Button>
              </div>
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Notes</Label>
                <Input
                  placeholder="Optional notes..."
                  value={fs.notes}
                  onChange={(e) => {
                    const stages = [...data.fermentStages]; stages[i].notes = e.target.value; setFermentStages(stages)
                  }}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 4 — Target Numbers ───────────────────────────────────────────────────

function Step4({ data, onChange }: { data: Step4Data; onChange: (d: Partial<Step4Data>) => void }) {
  // ABV formula: (OG - FG) * 131.25
  const calcAbv = () => {
    const og = parseFloat(data.targetOg)
    const fg = parseFloat(data.targetFg)
    if (og && fg && fg > 0 && og > fg) {
      return ((og - fg) * 131.25).toFixed(1)
    }
    return ""
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="s4-og">Target OG *</Label>
          <Input
            id="s4-og"
            type="number"
            step="0.001"
            min={0}
            placeholder="e.g. 1.055"
            value={data.targetOg}
            onChange={(e) => onChange({ targetOg: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="s4-fg">Target FG *</Label>
          <Input
            id="s4-fg"
            type="number"
            step="0.001"
            min={0}
            placeholder="e.g. 1.012"
            value={data.targetFg}
            onChange={(e) => onChange({ targetFg: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="s4-abv">ABV %</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="s4-abv"
            type="number"
            step="0.1"
            min={0}
            max={30}
            placeholder={calcAbv() || "Auto-calculated"}
            value={data.abv}
            onChange={(e) => onChange({ abv: e.target.value })}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ abv: calcAbv() })}
            className="text-xs shrink-0"
          >
            Auto
          </Button>
        </div>
        {data.targetOg && data.targetFg && parseFloat(data.targetOg) > parseFloat(data.targetFg) && (
          <p className="text-xs text-muted-foreground mt-1">
            Estimated: {calcAbv()}% — click Auto to apply
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="s4-ibu">IBU</Label>
          <Input
            id="s4-ibu"
            type="number"
            min={0}
            placeholder="e.g. 45"
            value={data.ibu}
            onChange={(e) => onChange({ ibu: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="s4-srm">SRM</Label>
          <Input
            id="s4-srm"
            type="number"
            min={0}
            placeholder="e.g. 8"
            value={data.srm}
            onChange={(e) => onChange({ srm: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Step 5 — Review & Submit ─────────────────────────────────────────────────

function ReviewSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h4 className="text-[10px] uppercase tracking-widest text-copper font-semibold">{label}</h4>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  )
}

function Step5({ data, onSubmit, isPending }: { data: WizardData; onSubmit: () => void; isPending: boolean }) {
  const ingredients: string[] = []
  data.step2.malts.filter((m) => m.name).forEach((m) => ingredients.push(`${m.amount} ${m.unit} ${m.name}`))
  data.step2.hops.filter((h) => h.name).forEach((h) => ingredients.push(`${h.amount} oz ${h.name} @ ${h.time || "?"} min`))
  if (data.step2.yeast) ingredients.push(`Yeast: ${data.step2.yeast}`)
  if (data.step2.waterAdditions) ingredients.push(`Water: ${data.step2.waterAdditions}`)
  if (data.step2.adjuncts) ingredients.push(`Adjuncts: ${data.step2.adjuncts}`)

  return (
    <div className="space-y-4">
      <ReviewSection label="Basics">
        <p><span className="font-semibold">{data.step1.title}</span> — {data.step1.style.replace(/_/g, " ")}</p>
        <p className="text-xs text-muted-foreground">
          {BREW_TYPES.find((t) => t.value === data.step1.type)?.label} &middot;{" "}
          {DIFFICULTY_LABELS[data.step1.difficulty]} &middot;{" "}
          {data.step1.batchSize} {data.step1.batchUnit}
        </p>
      </ReviewSection>

      <div className="border-t border-border/30 pt-3">
        <ReviewSection label="Ingredients">
          {ingredients.length > 0 ? (
            <ul className="space-y-0.5">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-copper mt-1.5 shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          ) : <p className="text-muted-foreground italic text-xs">No ingredients added</p>}
        </ReviewSection>
      </div>

      <div className="border-t border-border/30 pt-3">
        <ReviewSection label="Brew Day Instructions">
          {data.step3.brewSteps.filter((s) => s.instruction).length > 0 ? (
            <ol className="space-y-1">
              {data.step3.brewSteps.filter((s) => s.instruction).map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-copper mt-0.5 shrink-0">{i + 1}.</span>
                  {s.instruction}
                </li>
              ))}
            </ol>
          ) : <p className="text-muted-foreground italic text-xs">No instructions added</p>}
        </ReviewSection>
      </div>

      <div className="border-t border-border/30 pt-3">
        <ReviewSection label="Fermentation Schedule">
          {data.step3.fermentStages.filter((f) => f.action).length > 0 ? (
            <div className="space-y-1">
              {data.step3.fermentStages.filter((f) => f.action).map((f, i) => (
                <p key={i} className="text-xs">
                  <span className="font-semibold text-copper">Day {f.day}:</span> {f.action}
                  {f.notes && <span className="text-muted-foreground"> — {f.notes}</span>}
                </p>
              ))}
            </div>
          ) : <p className="text-muted-foreground italic text-xs">No schedule added</p>}
        </ReviewSection>
      </div>

      <div className="border-t border-border/30 pt-3">
        <ReviewSection label="Target Numbers">
          <div className="flex gap-4 text-xs flex-wrap">
            {data.step4.targetOg && <span>OG: <strong>{data.step4.targetOg}</strong></span>}
            {data.step4.targetFg && <span>FG: <strong>{data.step4.targetFg}</strong></span>}
            {data.step4.abv && <span>ABV: <strong>{data.step4.abv}%</strong></span>}
            {data.step4.ibu && <span>IBU: <strong>{data.step4.ibu}</strong></span>}
            {data.step4.srm && <span>SRM: <strong>{data.step4.srm}</strong></span>}
          </div>
        </ReviewSection>
      </div>

      <div className="border-t border-border/30 pt-3">
        <p className="text-xs text-muted-foreground">
          Submitting puts your recipe in the moderation queue. You'll be notified when it's approved or rejected.
        </p>
      </div>

      <Button
        onClick={onSubmit}
        disabled={isPending}
        className="w-full gap-2"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
        {isPending ? "Submitting..." : "Submit for Review"}
      </Button>
    </div>
  )
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function canAdvance(current: number, data: WizardData): boolean {
  if (current === 1) {
    return data.step1.title.trim().length > 0 && data.step1.style.trim().length > 0
  }
  if (current === 2) {
    return data.step2.yeast.trim().length > 0
  }
  return true
}

// ─── Main Wizard ───────────────────────────────────────────────────────────────

interface ShareRecipeWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareRecipeWizard({ open, onOpenChange }: ShareRecipeWizardProps) {
  const [step, setStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>(EMPTY_DEFAULT)
  const createRecipe = useCreateRecipe()
  const { user } = useAuth()

  const handleChange = <K extends keyof WizardData>(
    stepKey: K,
    changes: Partial<WizardData[K]>
  ) => {
    setWizardData((prev) => ({ ...prev, [stepKey]: { ...prev[stepKey], ...changes } }))
  }

  const handleSubmit = async () => {
    if (!user) return
    const { step1, step2, step3, step4 } = wizardData

    // Build ingredients JSON
    const ingredients: Record<string, unknown>[] = []
    step2.malts.filter((m) => m.name.trim()).forEach((m) => {
      ingredients.push({ category: "malt", name: m.name, amount: m.amount, unit: m.unit })
    })
    step2.hops.filter((h) => h.name.trim()).forEach((h) => {
      ingredients.push({ category: "hops", name: h.name, amount: h.amount, time: h.time })
    })
    if (step2.yeast.trim()) {
      ingredients.push({ category: "yeast", name: step2.yeast })
    }
    if (step2.waterAdditions.trim()) {
      ingredients.push({ category: "water", name: step2.waterAdditions })
    }
    if (step2.adjuncts.trim()) {
      ingredients.push({ category: "adjuncts", name: step2.adjuncts })
    }

    // Build steps JSON
    const steps = step3.brewSteps.filter((s) => s.instruction.trim())

    const ogVal = parseFloat(step4.targetOg)
    const fgVal = parseFloat(step4.targetFg)
    const abvVal = parseFloat(step4.abv) || undefined
    const estimatedDays =
      step3.fermentStages.length > 0
        ? Math.max(...step3.fermentStages.map((f) => f.day))
        : undefined

    const recipePayload = {
      title: step1.title,
      type: step1.type,
      style: step1.style,
      difficulty: step1.difficulty,
      batch_size: step1.batchSize,
      ingredients: ingredients.length > 0 ? ingredients : [],
      steps,
      target_og: ogVal || null,
      target_fg: fgVal || null,
      abv: abvVal ?? null,
      ibu: step4.ibu ? parseFloat(step4.ibu) : null,
      srm: step4.srm ? parseFloat(step4.srm) : null,
      estimated_days: estimatedDays ?? null,
      is_public: true,
      moderation_status: "pending" as const,
    }

    try {
      // Insert recipe
      const { data: recipe, error: recipeErr } = await supabase
        .from("recipes")
        .insert({ ...recipePayload, user_id: user.id })
        .select()
        .single()

      if (recipeErr || !recipe) {
        toast.error(recipeErr?.message || "Failed to submit recipe")
        return
      }

      // Insert recipe_stages from fermentation schedule
      const validStages = step3.fermentStages.filter((f) => f.action.trim())
      if (validStages.length > 0) {
        const stagesPayload = validStages.map((f, i) => ({
          recipe_id: recipe.id,
          day: f.day,
          action: f.action,
          notes: f.notes || null,
          sort_order: i,
        }))
        await supabase.from("recipe_stages").insert(stagesPayload)
      }

      toast.success("Recipe submitted for review!")
      onOpenChange(false)
      setStep(1)
      setWizardData(EMPTY_DEFAULT)
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit recipe")
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) { setStep(1); setWizardData(EMPTY_DEFAULT) }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-slab">{RECIPE.shareRecipe}</DialogTitle>
          <DialogDescription>
            Share your recipe with the community. It goes live after review.
          </DialogDescription>
        </DialogHeader>

        <StepIndicator current={step} />

        {step === 1 && (
          <Step1
            data={wizardData.step1}
            onChange={(d) => handleChange("step1", d)}
          />
        )}
        {step === 2 && (
          <Step2
            data={wizardData.step2}
            onChange={(d) => handleChange("step2", d)}
          />
        )}
        {step === 3 && (
          <Step3
            data={wizardData.step3}
            onChange={(d) => handleChange("step3", d)}
          />
        )}
        {step === 4 && (
          <Step4
            data={wizardData.step4}
            onChange={(d) => handleChange("step4", d)}
          />
        )}
        {step === 5 && (
          <Step5
            data={wizardData}
            onSubmit={handleSubmit}
            isPending={createRecipe.isPending}
          />
        )}

        {step < 5 && (
          <DialogFooter className="gap-2 mt-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => s - 1)}
                className="gap-1"
              >
                <ChevronLeft size={14} />
                Back
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance(step, wizardData)}
              className="gap-1 ml-auto"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}