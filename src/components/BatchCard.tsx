import { Droplets, Timer, ArrowRight, ClipboardList, Snowflake, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { LifecycleStatus } from "@/lib/lifecycle";

interface BatchCardProps {
  id: string;
  name: string;
  type: "beer" | "kombucha" | "mead" | "cider" | "sourdough" | "ferment";
  gravity?: number;
  targetGravity?: number;
  daysElapsed?: number;
  totalDays?: number;
  nextAction?: string;
  style?: string;
  status?: LifecycleStatus;
  conditioningMethod?: string;
  packagingMethod?: string;
  estimatedCompletion?: string;
  checklistProgress?: number;
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
  gravity = 1.0,
  targetGravity = 1.0,
  daysElapsed = 0,
  totalDays = 1,
  nextAction,
  style,
  status = "fermenting",
  conditioningMethod,
  packagingMethod,
  estimatedCompletion,
  checklistProgress,
}: BatchCardProps) => {
  const safeTotalDays = Math.max(1, totalDays);
  const progress = Math.min(100, (daysElapsed / safeTotalDays) * 100);
  const fillLevel = ((1.080 - gravity) / (1.080 - targetGravity)) * 100;
  const daysRemaining = Math.max(0, safeTotalDays - daysElapsed);

  const renderBrewDay = () => (
    <>
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList size={16} className={typeAccent[type]} />
        <span className="text-sm font-medium">Brew day checklist</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-copper/60 to-copper transition-all duration-1000"
          style={{ width: `${Math.min(100, Math.max(0, checklistProgress ?? 0))}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {checklistProgress !== undefined
            ? `${Math.round(checklistProgress)}% complete`
            : "Checklist not started"}
        </span>
        <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </>
  );

  const renderConditioning = () => (
    <>
      <div className="flex items-center gap-4 mb-3">
        {conditioningMethod && (
          <div className="flex items-center gap-1.5">
            <Snowflake size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium">{conditioningMethod}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Timer size={14} className="text-muted-foreground" />
          <span className="text-sm font-semibold">{daysRemaining}d</span>
          <span className="text-xs text-muted-foreground">remaining</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        {nextAction && (
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">
            {nextAction}
          </span>
        )}
        <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
      </div>
    </>
  );

  const renderPackaging = () => (
    <>
      <div className="flex items-center gap-4 mb-3">
        {packagingMethod && (
          <div className="flex items-center gap-1.5">
            <Package size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium">{packagingMethod}</span>
          </div>
        )}
      </div>
      {estimatedCompletion && (
        <div className="flex items-center gap-1.5 mb-3">
          <Timer size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Est. completion:</span>
          <span className="text-sm font-medium">{estimatedCompletion}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        {nextAction && (
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">
            {nextAction}
          </span>
        )}
        <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
      </div>
    </>
  );

  const renderFermentation = () => (
    <>
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
          <span className="text-xs text-muted-foreground">/ {safeTotalDays}d</span>
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
      <div className="flex items-center justify-between">
        {nextAction && (
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">
            {nextAction}
          </span>
        )}
        <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
      </div>
    </>
  );

  return (
    <Link
      to={`/batch/${id}`}
      className={`group block glass-panel rounded-xl border bg-gradient-to-b ${typeColors[type]} p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-[260px] md:min-w-[300px] xl:min-w-0`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${typeAccent[type]}`}>
            {type}
          </p>
          <h3 className="font-slab font-semibold text-base mt-0.5">{name}</h3>
          {style && <p className="text-xs text-muted-foreground">{style}</p>}
        </div>
        {status === "fermenting" && (
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
        )}
      </div>

      {status === "brew_day" && renderBrewDay()}
      {status === "conditioning" && renderConditioning()}
      {status === "packaging" && renderPackaging()}
      {(status === "fermenting" || status === "batch_shelf" || !status) && renderFermentation()}
    </Link>
  );
};

export default BatchCard;
