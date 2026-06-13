import { Trophy, Clock, Users, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useChallenges, useJoinChallenge } from "@/hooks/useChallenges";

const typeColor: Record<string, string> = {
  kombucha: "from-teal/20 to-teal/5 border-teal/20",
  mead: "from-gold/20 to-gold/5 border-gold/20",
  sourdough: "from-copper/15 to-gold/10 border-gold/15",
  cider: "from-copper/20 to-copper/5 border-copper/20",
  beer: "from-copper/20 to-copper/5 border-copper/20",
  ferment: "from-teal/20 to-teal/5 border-teal/20",
};

const progressColor: Record<string, string> = {
  kombucha: "bg-teal",
  mead: "bg-gold",
  sourdough: "bg-copper",
  cider: "bg-copper",
  beer: "bg-copper",
  ferment: "bg-teal",
};

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function challengeProgress(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (end <= start) return 100;
  const p = ((now - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, Math.round(p)));
}

const ChallengesPanel = () => {
  const { data: challenges, isLoading } = useChallenges();
  const joinChallenge = useJoinChallenge();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if ((challenges ?? []).length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center">
        <p className="text-muted-foreground">No challenges active right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(challenges ?? []).map((c: any) => {
        const entries = c.challenge_entries ?? [];
        const participantCount = Array.isArray(entries) ? entries.length : 0;
        const dLeft = c.end_date ? daysLeft(c.end_date) : 0;
        const progress =
          c.start_date && c.end_date
            ? challengeProgress(c.start_date, c.end_date)
            : 0;
        const isActive = c.is_active && dLeft > 0;

        return (
          <div
            key={c.id}
            className={`glass-panel rounded-xl p-5 border bg-gradient-to-br ${
              typeColor[c.type] ?? typeColor.ferment
            } hover:shadow-xl transition-all duration-300 cursor-pointer group`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy
                  size={18}
                  className={isActive ? "text-gold" : "text-muted-foreground"}
                />
                {!isActive && (
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Completed
                  </span>
                )}
              </div>
              <ChevronRight
                size={16}
                className="text-muted-foreground group-hover:text-foreground transition-colors"
              />
            </div>

            <h3 className="font-slab font-semibold text-lg mb-2">{c.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {c.description}
            </p>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full ${
                  progressColor[c.type] ?? "bg-muted"
                } transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={12} /> {participantCount}
              </span>
              {dLeft > 0 ? (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {dLeft}d left
                </span>
              ) : (
                <span className="text-muted-foreground">Ended</span>
              )}
              <span className="ml-auto font-medium">{progress}%</span>
            </div>

            {isActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  joinChallenge.mutate(
                    { challengeId: c.id },
                    {
                      onError: (err: any) => {
                        toast.error(err?.message || "Failed to join challenge");
                      },
                    }
                  );
                }}
                disabled={joinChallenge.isPending}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {joinChallenge.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trophy size={16} />
                )}
                Join Challenge
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChallengesPanel;