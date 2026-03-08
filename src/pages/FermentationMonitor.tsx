import { Camera, MessageSquare, Plus, Droplets, Thermometer, FlaskConical } from "lucide-react";
import GravityCurve from "@/components/GravityCurve";

const FermentationMonitor = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-slab text-2xl md:text-3xl font-bold">Fermentation Monitor</h1>
        <p className="text-muted-foreground text-sm mt-1">Autumn Amber Ale — Day 9 of 14</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Live readings */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Current SG", value: "1.048", icon: Droplets, color: "text-copper" },
              { label: "Temperature", value: "68°F", icon: Thermometer, color: "text-teal" },
              { label: "Est. ABV", value: "3.2%", icon: FlaskConical, color: "text-gold" },
            ].map((stat, i) => (
              <div key={i} className="glass-panel rounded-xl p-4 text-center">
                <stat.icon size={20} className={`${stat.color} mx-auto mb-2`} />
                <p className={`text-2xl md:text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main chart */}
          <GravityCurve />

          {/* Photo check */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3">Visual Check</h3>
            <div className="border-2 border-dashed border-border/60 rounded-lg h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-copper/40 transition-colors cursor-pointer">
              <Camera size={24} />
              <p className="text-xs">Upload photo or connect cam</p>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Log Reading", icon: Plus },
                { label: "Tasting Note", icon: MessageSquare },
                { label: "Upload Photo", icon: Camera },
              ].map((action, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 hover:bg-muted text-sm transition-colors"
                >
                  <action.icon size={16} className="text-copper" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fermentation timeline */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-3">Stage Timeline</h3>
            <div className="space-y-3">
              {[
                { stage: "Brew Day", day: "Feb 28", done: true },
                { stage: "Primary Ferment", day: "Mar 1", done: true },
                { stage: "Dry Hop", day: "Mar 9", done: false },
                { stage: "Cold Crash", day: "Mar 11", done: false },
                { stage: "Bottle", day: "Mar 14", done: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full border-2 ${s.done ? "bg-teal border-teal" : "border-border bg-transparent"}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${s.done ? "" : "text-muted-foreground"}`}>{s.stage}</p>
                    <p className="text-[10px] text-muted-foreground">{s.day}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community chat placeholder */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="font-slab font-semibold text-sm mb-2 flex items-center gap-2">
              <MessageSquare size={14} className="text-teal" />
              Brew Chat
            </h3>
            <p className="text-xs text-muted-foreground">Connect with fellow brewers monitoring their batches live.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FermentationMonitor;
