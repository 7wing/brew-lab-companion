import {
  FlaskConical,
  Plus,
  Calendar,
  Search,
  Beaker,
  Thermometer,
} from "lucide-react";
import BatchCard from "@/components/BatchCard";
import ReadingsTable from "@/components/ReadingsTable";
import GravityCurve from "@/components/GravityCurve";

const batches = [
  {
    id: "1",
    name: "Autumn Amber Ale",
    type: "beer" as const,
    gravity: 1.048,
    targetGravity: 1.012,
    daysElapsed: 9,
    totalDays: 14,
    nextAction: "Dry Hop Tomorrow",
    style: "American Amber",
  },
  {
    id: "2",
    name: "Ginger Kombucha F2",
    type: "kombucha" as const,
    gravity: 1.018,
    targetGravity: 1.005,
    daysElapsed: 4,
    totalDays: 7,
    nextAction: "Bottle Today",
    style: "Ginger Lemon",
  },
  {
    id: "3",
    name: "Wildflower Mead",
    type: "mead" as const,
    gravity: 1.095,
    targetGravity: 1.01,
    daysElapsed: 21,
    totalDays: 90,
    style: "Traditional Sweet",
  },
  {
    id: "4",
    name: "Apple Cider Reserve",
    type: "cider" as const,
    gravity: 1.052,
    targetGravity: 1.0,
    daysElapsed: 12,
    totalDays: 28,
    nextAction: "Rack to Secondary",
    style: "Dry Farmhouse",
  },
  {
    id: "5",
    name: "Rye Sourdough #47",
    type: "sourdough" as const,
    gravity: 1.0,
    targetGravity: 1.0,
    daysElapsed: 2,
    totalDays: 3,
    nextAction: "Feed Starter",
    style: "Dark Rye",
  },
];

const milestones = [
  { date: "Mar 9", label: "Dry Hop — Amber Ale", type: "beer" },
  { date: "Mar 8", label: "Bottle — Kombucha F2", type: "kombucha" },
  { date: "Mar 15", label: "Rack — Cider Reserve", type: "cider" },
  { date: "Apr 2", label: "First Tasting — Mead", type: "mead" },
];

const typeColors: Record<string, string> = {
  beer: "bg-copper/20 text-copper",
  kombucha: "bg-teal/20 text-teal",
  mead: "bg-gold/20 text-gold",
  cider: "bg-copper/15 text-copper",
};

const Index = () => {
  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-slab text-2xl md:text-3xl font-bold">Brew Bench</h1>
          <p className="text-muted-foreground text-sm mt-1">
            5 active batches — 2 actions pending
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper/80 text-copper-foreground font-medium text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          <Plus size={16} />
          Start New Brew
        </button>
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
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-left transition-colors">
                <Search size={14} className="text-muted-foreground" />
                Recipe Search
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-left transition-colors">
                <FlaskConical size={14} className="text-muted-foreground" />
                ABV Calculator
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-left transition-colors">
                <Thermometer size={14} className="text-muted-foreground" />
                Temp Converter
              </button>
            </div>
          </div>

          {/* Milestones */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-teal" />
              Upcoming
            </h3>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${typeColors[m.type]?.split(" ")[0] || "bg-muted"}`} />
                  <div>
                    <p className="text-xs font-semibold">{m.date}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsor */}
          <div className="glass-panel rounded-xl p-4 border-copper/20">
            <p className="text-[10px] uppercase tracking-widest text-copper font-semibold mb-2">Featured Lab Partner</p>
            <p className="text-sm font-medium">BrewCraft Yeasts</p>
            <p className="text-xs text-muted-foreground mt-1">Premium Belgian & Wild strains for craft fermentation</p>
          </div>
        </aside>

        {/* Central batch shelf */}
        <section>
          <h2 className="font-slab text-lg font-semibold mb-4">Active Fermentations</h2>

          {/* Scrollable batch shelf */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory xl:grid xl:grid-cols-2 2xl:grid-cols-3 xl:overflow-visible">
            {batches.map((batch) => (
              <div key={batch.id} className="snap-start shrink-0 xl:shrink">
                <BatchCard {...batch} />
              </div>
            ))}
          </div>

          {/* Gravity Curve */}
          <div className="mt-6">
            <GravityCurve />
          </div>
        </section>

        {/* Right panel - Readings */}
        <aside className="space-y-4">
          <ReadingsTable />

          {/* Quick Stats */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3">Lab Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Active", value: "5", accent: "text-copper" },
                { label: "Completed", value: "23", accent: "text-teal" },
                { label: "This Month", value: "3", accent: "text-gold" },
                { label: "Avg Days", value: "18", accent: "text-muted-foreground" },
              ].map((s, i) => (
                <div key={i} className="text-center p-2 rounded-lg bg-muted/30">
                  <p className={`text-xl font-mono font-bold ${s.accent}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
