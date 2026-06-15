import { Trophy, Clock, Users, ChevronRight, Loader2, Bell, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useChallenges, useJoinChallenge } from "@/hooks/useChallenges";

const typeColor: Record<string, string> = {
  kombucha: "from-teal/20 to-teal/5 border-teal/20",
  mead: "from-gold/20 to-gold/5 border-gold/20",
  sourdough: "from-copper/15 to-gold/10 border-gold/15",
  cider: "from-copper/20 to-copper/5 border-copper/20",
  beer: "from-copper/20 to-copper/5 border-copper/20",
  ferment: "from-teal/20 to-teal/5 border-teal/20",
  wine: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
};

const progressColor: Record<string, string> = {
  kombucha: "bg-teal",
  mead: "bg-gold",
  sourdough: "bg-copper",
  cider: "bg-copper",
  beer: "bg-copper",
  ferment: "bg-teal",
  wine: "bg-purple-500",
};

const challengeTypeLabel: Record<string, string> = {
  official: "Official",
  community: "Community",
};

const challengeTypeColor: Record<string, string> = {
  official: "bg-gold/20 text-gold border-gold/30",
  community: "bg-teal/20 text-teal border-teal/30",
};

const moderationColor: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-600 border-green-500/30",
  rejected: "bg-red-500/20 text-red-600 border-red-500/30",
  needs_edits: "bg-orange-500/20 text-orange-600 border-orange-500/30",
};

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function daysUntilStart(startDate: string) {
  const diff = new Date(startDate).getTime() - Date.now();
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

function getChallengeStatus(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return "active";
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "active";
  return "past";
}

interface ChallengeCardProps {
  challenge: any;
  onJoin?: () => void;
  isJoining?: boolean;
}

function ChallengeCard({ challenge, onJoin, isJoining }: ChallengeCardProps) {
  const navigate = useNavigate();
  const status = getChallengeStatus(challenge.start_date, challenge.end_date);
  const entries = challenge.challenge_entries ?? [];
  const participantCount = Array.isArray(entries) ? entries.length : 0;
  const dLeft = challenge.end_date ? daysLeft(challenge.end_date) : 0;
  const dUntilStart = challenge.start_date ? daysUntilStart(challenge.start_date) : 0;
  const progress =
    challenge.start_date && challenge.end_date
      ? challengeProgress(challenge.start_date, challenge.end_date)
      : 0;

  const isOfficial = challenge.challenge_type === "official";

  return (
    <div
      className={`glass-panel rounded-xl p-5 border bg-gradient-to-br ${
        typeColor[challenge.type ?? "ferment"] ?? typeColor.ferment
      } hover:shadow-xl transition-all duration-300 cursor-pointer group`}
      onClick={() => navigate(`/challenge/${challenge.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Trophy
            size={18}
            className={status === "active" ? "text-gold" : "text-muted-foreground"}
          />
          {challenge.challenge_type && (
            <span className={`text-[10px] uppercase tracking-widest font-semibold border px-1.5 py-0.5 rounded ${challengeTypeColor[challenge.challenge_type]}`}>
              {challengeTypeLabel[challenge.challenge_type] ?? challenge.challenge_type}
            </span>
          )}
          {challenge.moderation_status && challenge.moderation_status !== "approved" && (
            <span className={`text-[10px] uppercase tracking-widest font-semibold border px-1.5 py-0.5 rounded ${moderationColor[challenge.moderation_status]}`}>
              {challenge.moderation_status}
            </span>
          )}
          {status === "upcoming" && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Upcoming
            </span>
          )}
          {status === "past" && (
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

      <h3 className="font-slab font-semibold text-lg mb-2">{challenge.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
        {challenge.description}
      </p>

      {status === "active" && (
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full ${
              progressColor[challenge.type ?? "ferment"] ?? "bg-muted"
            } transition-all duration-1000`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users size={12} /> {participantCount}
        </span>
        {status === "active" && dLeft > 0 && (
          <span className="flex items-center gap-1">
            <Clock size={12} /> {dLeft}d left
          </span>
        )}
        {status === "upcoming" && (
          <span className="flex items-center gap-1">
            <Clock size={12} /> Starts in {dUntilStart}d
          </span>
        )}
        {status === "past" && (
          <span className="flex items-center gap-1">
            <BarChart3 size={12} /> Ended
          </span>
        )}
        {status === "active" && (
          <span className="ml-auto font-medium">{progress}%</span>
        )}
      </div>

      {status === "active" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          disabled={isJoining}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isJoining ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trophy size={16} />
          )}
          Join Challenge
        </button>
      )}

      {status === "upcoming" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.success("Reminder set! We'll notify you when the challenge starts.");
          }}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-all"
        >
          <Bell size={16} />
          Remind Me
        </button>
      )}

      {status === "past" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/challenge/${challenge.id}`);
          }}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-copper/20 text-copper text-sm font-medium hover:bg-copper/30 transition-all"
        >
          <BarChart3 size={16} />
          View Results
        </button>
      )}
    </div>
  );
}

const ChallengesPanel = () => {
  const { data: challenges, isLoading } = useChallenges();
  const joinChallenge = useJoinChallenge();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-56 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const all = challenges ?? [];
  const active = all.filter((c: any) => getChallengeStatus(c.start_date, c.end_date) === "active");
  const upcoming = all.filter((c: any) => getChallengeStatus(c.start_date, c.end_date) === "upcoming");
  const past = all.filter((c: any) => getChallengeStatus(c.start_date, c.end_date) === "past");

  if (all.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center">
        <p className="text-muted-foreground">No challenges yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {active.length > 0 && (
        <section>
          <h2 className="font-slab text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-gold" />
            Active Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((c: any) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onJoin={() =>
                  joinChallenge.mutate(
                    { challengeId: c.id },
                    { onError: (err: any) => toast.error(err?.message || "Failed to join challenge") }
                  )
                }
                isJoining={joinChallenge.isPending}
              />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="font-slab text-xl font-bold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-teal" />
            Upcoming Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((c: any) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="font-slab text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-muted-foreground" />
            Past Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {past.map((c: any) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ChallengesPanel;