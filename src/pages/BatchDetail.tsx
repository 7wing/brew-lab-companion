import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Camera, Share2, MessageSquare, Plus, Droplets, Thermometer, FlaskConical } from "lucide-react";
import GravityCurve from "@/components/GravityCurve";

const stages = [
  { name: "Brew Day", date: "Feb 28", notes: "Mashed at 152°F for 60 min. OG 1.072. Pitched WLP001 at 65°F.", done: true },
  { name: "Primary Ferment", date: "Mar 1", notes: "Active airlock activity within 12 hours. Krausen formed by day 2.", done: true },
  { name: "Gravity Check", date: "Mar 5", notes: "SG 1.052 — fermenting nicely. Temp stable at 67°F.", done: true },
  { name: "Dry Hop", date: "Mar 9", notes: "Add 2oz Citra, 1oz Mosaic. Scheduled.", done: false },
  { name: "Cold Crash", date: "Mar 11", notes: "Drop to 34°F for 48 hours.", done: false },
  { name: "Bottle / Keg", date: "Mar 14", notes: "Target FG: 1.012. Prime with corn sugar.", done: false },
];

const BatchDetail = () => {
  const { id } = useParams();

  return (
    <div className="animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft size={16} /> Back to Brew Bench
      </Link>

      {/* Hero */}
      <div className="glass-panel rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-1">Beer — American Amber</p>
            <h1 className="font-slab text-2xl md:text-3xl font-bold">Autumn Amber Ale</h1>
            <p className="text-sm text-muted-foreground mt-1">Batch #{id || "1"} · Day 9 of 14 · Active</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-lg border border-border/50 text-sm hover:bg-muted transition-colors flex items-center gap-2">
              <Share2 size={14} /> Share
            </button>
            <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-copper to-copper/80 text-copper-foreground text-sm font-medium flex items-center gap-2">
              <Plus size={14} /> Log Reading
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Current SG", value: "1.048", icon: Droplets, color: "text-copper" },
            { label: "Temperature", value: "68°F", icon: Thermometer, color: "text-teal" },
            { label: "Est. ABV", value: "3.2%", icon: FlaskConical, color: "text-gold" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <s.icon size={16} className={s.color} />
              <div>
                <p className="text-sm font-mono font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Timeline */}
        <div className="space-y-6">
          <GravityCurve />

          <div className="glass-panel rounded-xl p-5">
            <h2 className="font-slab font-semibold text-lg mb-4">Fermentation Log</h2>
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border/60" />
              <div className="space-y-6">
                {stages.map((stage, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 z-10 ${
                      stage.done ? "bg-teal border-teal" : "bg-background border-border"
                    }`} />
                    <div className={`flex-1 ${!stage.done ? "opacity-60" : ""}`}>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-semibold">{stage.name}</h3>
                        <span className="text-[10px] text-muted-foreground">{stage.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{stage.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Add Reading", icon: Plus },
                { label: "Upload Photo", icon: Camera },
                { label: "Tasting Note", icon: MessageSquare },
                { label: "Share to Community", icon: Share2 },
              ].map((a, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 hover:bg-muted text-sm transition-colors"
                >
                  <a.icon size={14} className="text-copper" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-2">Recipe</h3>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>Style: American Amber Ale</p>
              <p>OG: 1.072 → FG: 1.012</p>
              <p>IBU: 35 | SRM: 14</p>
              <p>Yeast: WLP001</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetail;
