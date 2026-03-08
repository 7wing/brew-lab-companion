import { Droplets, Timer, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BatchCardProps {
  id: string;
  name: string;
  type: "beer" | "kombucha" | "mead" | "cider" | "sourdough" | "ferment";
  gravity: number;
  targetGravity: number;
  daysElapsed: number;
  totalDays: number;
  nextAction?: string;
  style?: string;
}

const typeColors: Record<string, string> = {
  beer: "from-copper/20 to-copper/5 border-copper/30",
  kombucha: "from-teal/20 to-teal/5 border-teal/30",
  mead: "from-gold/20 to-gold/5 border-gold/30",
  cider: "from-copper/15 to-teal/10 border-copper/20",
  sourdough: "from-gold/15 to-copper/10 border-gold/20",
  ferment: "from-teal/15 to-gold/10 border-teal/20",
};

const typeAccent: Record<string, string> = {
  beer: "text-copper",
  kombucha: "text-teal",
  mead: "text-gold",
  cider: "text-copper",
  sourdough: "text-gold",
  ferment: "text-teal",
};

const BatchCard = ({
  id,
  name,
  type,
  gravity,
  targetGravity,
  daysElapsed,
  totalDays,
  nextAction,
  style,
}: BatchCardProps) => {
  const progress = Math.min(100, (daysElapsed / totalDays) * 100);
  const fillLevel = ((1.080 - gravity) / (1.080 - targetGravity)) * 100;

  return (
    <Link
      to={`/batch/${id}`}
      className={`group block glass-panel rounded-xl border bg-gradient-to-b ${typeColors[type]} p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-[260px] md:min-w-[300px]`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${typeAccent[type]}`}>
            {type}
          </p>
          <h3 className="font-slab font-semibold text-base mt-0.5">{name}</h3>
          {style && <p className="text-xs text-muted-foreground">{style}</p>}
        </div>
        <div className="relative w-10 h-14">
          {/* Vial */}
          <div className="absolute inset-x-1 bottom-0 top-2 rounded-b-lg border border-border/60 bg-muted/30 overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-copper/40 to-copper/10 transition-all duration-1000"
              style={{ height: `${Math.min(100, Math.max(10, fillLevel))}%` }}
            />
            {/* Bubbles in vial */}
            <div className="absolute bottom-1 left-1/2 w-1 h-1 rounded-full bg-copper/30 animate-bubble-slow" style={{ animationDelay: "0s" }} />
            <div className="absolute bottom-2 left-1/3 w-0.5 h-0.5 rounded-full bg-copper/20 animate-bubble-slow" style={{ animationDelay: "1.5s" }} />
          </div>
          <div className="absolute top-0 inset-x-0 h-2.5 rounded-t border border-border/60 bg-muted/50" />
        </div>
      </div>

      {/* Gravity reading */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <Droplets size={14} className={typeAccent[type]} />
          <span className="text-sm font-mono font-semibold">{gravity.toFixed(3)}</span>
          <span className="text-xs text-muted-foreground">SG</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Timer size={14} className="text-muted-foreground" />
          <span className="text-sm font-semibold">{daysElapsed}d</span>
          <span className="text-xs text-muted-foreground">/ {totalDays}d</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            type === "kombucha" || type === "ferment"
              ? "bg-gradient-to-r from-teal/60 to-teal"
              : type === "mead" || type === "sourdough"
              ? "bg-gradient-to-r from-gold/60 to-gold"
              : "bg-gradient-to-r from-copper/60 to-copper"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Next action */}
      {nextAction && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">
            {nextAction}
          </span>
          <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      )}
    </Link>
  );
};

export default BatchCard;
