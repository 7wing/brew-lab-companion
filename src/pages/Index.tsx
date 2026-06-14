import { useState } from "react";
import {
  FlaskConical,
  Plus,
  Calendar,
  Search,
  Beaker,
  Thermometer,
  ArrowRightLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import BatchCard from "@/components/BatchCard";
import ReadingsTable from "@/components/ReadingsTable";
import GravityCurve from "@/components/GravityCurve";
import { useBatches } from "@/hooks/useBatches";
import { useReadings } from "@/hooks/useReadings";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

const typeColors: Record<string, string> = {
  beer: "bg-copper/20 text-copper",
  kombucha: "bg-teal/20 text-teal",
  mead: "bg-gold/20 text-gold",
  cider: "bg-copper/15 text-copper",
};

function daysSince(start: string) {
  const diff = Date.now() - new Date(start).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function nextAction(batch: any): string | undefined {
  const stages = (batch.batch_stages ?? []) as Array<{
    name: string;
    scheduled: string | null;
    completed: boolean;
  }>;
  const pending = stages
    .filter((s) => !s.completed)
    .sort(
      (a, b) =>
        (a.scheduled ?? "").localeCompare(b.scheduled ?? "")
    );
  return pending[0]?.name;
}

const Index = () => {
  const { data: batches, isLoading } = useBatches();
  const firstBatchId = batches?.[0]?.id;
  const { data: dashboardReadings } = useReadings(firstBatchId);

  const upcoming = (batches ?? [])
    .flatMap((b: any) =>
      (b.batch_stages ?? []).map((s: any) => ({
        ...s,
        batchName: b.name,
        batchType: b.type,
      }))
    )
    .filter((s: any) => !s.completed && s.scheduled)
    .sort(
      (a: any, b: any) =>
        (a.scheduled ?? "").localeCompare(b.scheduled ?? "")
    )
    .slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-slab text-2xl md:text-3xl font-bold">Brew Bench</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading
              ? "Loading batches…"
              : `${batches?.length ?? 0} active batch${
                  batches?.length === 1 ? "" : "es"
                }`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/new-brew"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper/80 text-copper-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Start New Brew
          </Link>
          <div className="flex items-center gap-1 xl:hidden">
            <Link
              to="/recipes"
              className="p-2.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Recipe Search"
            >
              <Search size={18} />
            </Link>
            <AbvCalculatorTrigger iconOnly />
            <TempConverterTrigger iconOnly />
            <UpcomingSheet upcoming={upcoming} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr_320px] gap-6">
        {/* Lab Tools Panel - left */}
        <aside className="hidden xl:block space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3 flex items-center gap-2">
              <Beaker size={16} className="text-copper" />
              Lab Tools
            </h3>
            <div className="space-y-2">
              <Link
                to="/recipes"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-left transition-colors"
              >
                <Search size={14} className="text-muted-foreground" />
                Recipe Search
              </Link>
              <AbvCalculatorTrigger />
              <TempConverterTrigger />
            </div>
          </div>

          {/* Milestones */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-teal" />
              Upcoming
            </h3>
            <div className="space-y-3">
              {upcoming.length === 0 ? (
                <p className="text-xs text-muted-foreground">No upcoming actions.</p>
              ) : (
                upcoming.map((m: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 mt-1.5 rounded-full ${
                        typeColors[m.batchType]?.split(" ")[0] || "bg-muted"
                      }`}
                    />
                    <div>
                      <p className="text-xs font-semibold">{m.scheduled}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.name} — {m.batchName}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sponsor */}
          <div className="glass-panel rounded-xl p-4 border-copper/20">
            <p className="text-[10px] uppercase tracking-widest text-copper font-semibold mb-2">
              Featured Lab Partner
            </p>
            <p className="text-sm font-medium">BrewCraft Yeasts</p>
            <p className="text-xs text-muted-foreground mt-1">
              Premium Belgian & Wild strains for craft fermentation
            </p>
          </div>
        </aside>

        {/* Central batch shelf */}
        <section>
          <h2 className="font-slab text-lg font-semibold mb-4">Active Fermentations</h2>

          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[260px] h-48 bg-muted/50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (batches ?? []).length === 0 ? (
            <div className="glass-panel rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No active fermentations yet.
              </p>
              <Link
                to="/new-brew"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper/80 text-copper-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <Plus size={16} />
                Start New Brew
              </Link>
            </div>
          ) : (
            <>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory xl:grid xl:grid-cols-2 2xl:grid-cols-3 xl:overflow-visible">
                {(batches ?? []).map((batch: any) => (
                  <div key={batch.id} className="snap-start shrink-0 xl:shrink">
                    <BatchCard
                      id={batch.id}
                      name={batch.name}
                      type={batch.type}
                      gravity={batch.og ?? 1.0}
                      targetGravity={batch.target_fg ?? 1.0}
                      daysElapsed={daysSince(batch.start_date)}
                      totalDays={batch.target_days}
                      nextAction={nextAction(batch)}
                      style={batch.recipe?.title ?? undefined}
                    />
                  </div>
                ))}
              </div>

              {/* Gravity Curve */}
              <div className="mt-6">
                <GravityCurve readings={dashboardReadings ?? undefined} />
              </div>
            </>
          )}
        </section>

        {/* Right panel - Readings */}
        <aside className="space-y-4">
          <ReadingsTable batchId={firstBatchId} />

          {/* Quick Stats */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3">Lab Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Active", value: String(batches?.length ?? 0), accent: "text-copper" },
                { label: "Completed", value: "—", accent: "text-teal" },
                { label: "This Month", value: "—", accent: "text-gold" },
                { label: "Avg Days", value: "—", accent: "text-muted-foreground" },
              ].map((s, i) => (
                <div key={i} className="text-center p-2 rounded-lg bg-muted/30">
                  <p className={`text-xl font-mono font-bold ${s.accent}`}>
                    {s.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

function AbvCalculatorTrigger({ iconOnly = false }: { iconOnly?: boolean }) {
  const [og, setOg] = useState("");
  const [fg, setFg] = useState("");
  const abv =
    og && fg
      ? ((parseFloat(og) - parseFloat(fg)) * 131.25).toFixed(2)
      : null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {iconOnly ? (
          <button
            className="p-2.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="ABV Calculator"
          >
            <FlaskConical size={18} />
          </button>
        ) : (
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-left transition-colors">
            <FlaskConical size={14} className="text-muted-foreground" />
            ABV Calculator
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="font-slab flex items-center gap-2">
            <FlaskConical size={18} className="text-copper" />
            ABV Calculator
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="og">Original Gravity (OG)</Label>
            <input
              id="og"
              type="number"
              step="0.001"
              min="1"
              max="1.2"
              placeholder="1.050"
              value={og}
              onChange={(e) => setOg(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
            />
          </div>
          <div>
            <Label htmlFor="fg">Final Gravity (FG)</Label>
            <input
              id="fg"
              type="number"
              step="0.001"
              min="0.99"
              max="1.2"
              placeholder="1.010"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-copper/30"
            />
          </div>
          <div className="glass-panel rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Estimated ABV
            </p>
            <p className="text-3xl font-mono font-bold text-copper">
              {abv ? `${abv}%` : "—"}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Formula: (OG − FG) × 131.25
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function UpcomingSheet({ upcoming }: { upcoming: any[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="p-2.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative"
          aria-label="Upcoming Actions"
        >
          <Calendar size={18} />
          {upcoming.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal" />
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="font-slab flex items-center gap-2">
            <Calendar size={18} className="text-teal" />
            Upcoming
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming actions.</p>
          ) : (
            upcoming.map((m: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 mt-1.5 rounded-full ${
                    typeColors[m.batchType]?.split(" ")[0] || "bg-muted"
                  }`}
                />
                <div>
                  <p className="text-xs font-semibold">{m.scheduled}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.name} — {m.batchName}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TempConverterTrigger({ iconOnly = false }: { iconOnly?: boolean }) {
  const [fahrenheit, setFahrenheit] = useState("");
  const [celsius, setCelsius] = useState("");

  function updateFromF(val: string) {
    setFahrenheit(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setCelsius(((num - 32) * 5 / 9).toFixed(1));
    } else {
      setCelsius("");
    }
  }

  function updateFromC(val: string) {
    setCelsius(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setFahrenheit((num * 9 / 5 + 32).toFixed(1));
    } else {
      setFahrenheit("");
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {iconOnly ? (
          <button
            className="p-2.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Temp Converter"
          >
            <Thermometer size={18} />
          </button>
        ) : (
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-left transition-colors">
            <Thermometer size={14} className="text-muted-foreground" />
            Temp Converter
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="font-slab flex items-center gap-2">
            <Thermometer size={18} className="text-teal" />
            Temperature Converter
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="f">Fahrenheit (°F)</Label>
            <input
              id="f"
              type="number"
              step="0.1"
              placeholder="68"
              value={fahrenheit}
              onChange={(e) => updateFromF(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <div className="flex justify-center">
            <ArrowRightLeft size={16} className="text-muted-foreground" />
          </div>
          <div>
            <Label htmlFor="c">Celsius (°C)</Label>
            <input
              id="c"
              type="number"
              step="0.1"
              placeholder="20"
              value={celsius}
              onChange={(e) => updateFromC(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default Index;
