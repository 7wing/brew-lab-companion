import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trophy, Clock, Users, Pencil, Trash2, Send, Star,
  ChevronLeft, Loader2, FlaskConical, BarChart3, Award,
  Heart, MoreVertical, Medal
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useChallengeDetail, useChallengeEntries, useJoinChallenge, useDeleteChallenge } from "@/hooks/useChallenges";
import { useCreatePost } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { copy } from "@/constants/copy";
import { formatPostTime, getInitial } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

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

function getChallengeStatus(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return "active";
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "active";
  return "past";
}

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function daysUntilStart(startDate: string) {
  const diff = new Date(startDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const typeAccent: Record<string, string> = {
  beer: "text-copper",
  kombucha: "text-teal",
  mead: "text-gold",
  cider: "text-copper",
  sourdough: "text-gold",
  ferment: "text-teal",
  wine: "text-purple-500",
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitContent, setSubmitContent] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);

  const { data: challenge, isLoading: challengeLoading } = useChallengeDetail(id ?? "");
  const { data: entries, isLoading: entriesLoading } = useChallengeEntries(id ?? "");
  const joinChallenge = useJoinChallenge();
  const deleteChallenge = useDeleteChallenge();
  const createPost = useCreatePost();

  if (challengeLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
        <div className="h-40 bg-muted/50 rounded-xl animate-pulse" />
        <div className="h-60 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Challenge not found.</p>
        <button onClick={() => navigate("/community?tab=challenges")} className="mt-4 text-teal hover:underline">
          Back to challenges
        </button>
      </div>
    );
  }

  const status = getChallengeStatus(challenge.start_date, challenge.end_date);
  const entriesList = entries ?? [];
  const participantCount = entriesList.length;
  const isCreator = user?.id === challenge.created_by;

  const userEntry = entriesList.find((e: any) => e.user_id === user?.id);
  const hasJoined = !!userEntry;

  const ratedEntries = [...entriesList]
    .filter((e: any) => e.rating != null)
    .sort((a: any, b: any) => b.rating - a.rating);

  const topEntries = ratedEntries.slice(0, 3);
  const totalSubmissions = ratedEntries.length;

  function handleJoin() {
    joinChallenge.mutate(
      { challengeId: challenge.id },
      {
        onSuccess: () => toast.success("You've joined the challenge!"),
        onError: (err: any) => toast.error(err?.message || "Failed to join"),
      }
    );
  }

  function handleDelete() {
    deleteChallenge.mutate(
      { challengeId: challenge.id },
      {
        onSuccess: () => {
          toast.success("Challenge deleted");
          navigate("/community?tab=challenges");
        },
        onError: (err: any) => toast.error(err?.message || "Failed to delete"),
      }
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submitTitle.trim() || !submitContent.trim()) return;
    createPost.mutate(
      {
        category: "brew_log",
        title: submitTitle.trim(),
        content: submitContent.trim(),
        type: challenge.type ?? null,
        challenge_id: challenge.id,
      },
      {
        onSuccess: () => {
          toast.success("Submission posted!");
          setSubmitTitle("");
          setSubmitContent("");
          setShowSubmitForm(false);
        },
        onError: (err: any) => toast.error(err?.message || "Failed to submit"),
      }
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate("/community?tab=challenges")}
          className="mt-1 p-2 rounded-lg glass-panel hover:bg-muted transition-colors shrink-0"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Trophy size={24} className={status === "active" ? "text-gold" : "text-muted-foreground"} />
            {challenge.challenge_type && (
              <span className={`text-xs uppercase tracking-widest font-semibold border px-2 py-0.5 rounded ${challengeTypeColor[challenge.challenge_type]}`}>
                {challengeTypeLabel[challenge.challenge_type] ?? challenge.challenge_type}
              </span>
            )}
            {challenge.moderation_status && challenge.moderation_status !== "approved" && (
              <span className={`text-xs uppercase tracking-widest font-semibold border px-2 py-0.5 rounded ${moderationColor[challenge.moderation_status]}`}>
                {challenge.moderation_status}
              </span>
            )}
            {status === "upcoming" && (
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold border px-2 py-0.5 rounded bg-muted/50">
                Upcoming
              </span>
            )}
            {status === "past" && (
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold border px-2 py-0.5 rounded bg-muted/50">
                Completed
              </span>
            )}
          </div>
          <h1 className="font-slab text-2xl md:text-3xl font-bold">{challenge.title}</h1>
        </div>
        {isCreator && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="mt-1 p-2 rounded-lg glass-panel hover:bg-muted transition-colors shrink-0">
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/challenge/${challenge.id}/edit`)}>
                <Pencil size={14} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-red-500 focus:text-red-500">
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Info card */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
              <Users size={12} /> Participants
            </div>
            <p className="font-slab font-bold text-lg">{participantCount}</p>
          </div>
          {status === "active" && (
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                <Clock size={12} /> Days Left
              </div>
              <p className="font-slab font-bold text-lg">
                {challenge.end_date ? daysLeft(challenge.end_date) : "—"}
              </p>
            </div>
          )}
          {status === "upcoming" && (
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                <Clock size={12} /> Starts In
              </div>
              <p className="font-slab font-bold text-lg">
                {challenge.start_date ? daysUntilStart(challenge.start_date) : "—"}
              </p>
            </div>
          )}
          {challenge.start_date && (
            <div>
              <div className="text-muted-foreground text-xs mb-1">Start Date</div>
              <p className="font-medium text-sm">
                {new Date(challenge.start_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {challenge.end_date && (
            <div>
              <div className="text-muted-foreground text-xs mb-1">End Date</div>
              <p className="font-medium text-sm">
                {new Date(challenge.end_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {challenge.description && (
          <div>
            <h3 className="font-slab font-semibold text-sm mb-1">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
          </div>
        )}

        {challenge.rules && (
          <div>
            <h3 className="font-slab font-semibold text-sm mb-1">Rules</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{challenge.rules}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {status === "active" && !hasJoined && (
            <button
              onClick={handleJoin}
              disabled={joinChallenge.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {joinChallenge.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
              Join Challenge
            </button>
          )}
          {status === "active" && hasJoined && !showSubmitForm && (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal text-teal-foreground font-medium hover:opacity-90 transition-all"
            >
              <Send size={16} />
              Submit My Brew
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Challenge</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this challenge? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteChallenge.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {deleteChallenge.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Yes, delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit brew form */}
      {showSubmitForm && (
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <h3 className="font-slab font-semibold">Submit Your Brew</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Title *</label>
              <input
                type="text"
                placeholder="Give your submission a title..."
                value={submitTitle}
                onChange={(e) => setSubmitTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Description *</label>
              <textarea
                placeholder="Describe your brew, what you learned, how it turned out..."
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 resize-none"
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createPost.isPending || !submitTitle.trim() || !submitContent.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-teal text-teal-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {createPost.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Post Submission
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                className="px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leaderboard (past challenges) */}
      {status === "past" && (
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Medal size={20} className="text-gold" />
            <h2 className="font-slab text-xl font-bold">Top brews</h2>
          </div>

          {entriesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : topEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No rated submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {(showAllLeaderboard ? ratedEntries : topEntries).map((entry: any, index: number) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/40"
                >
                  <div className="text-2xl w-8 text-center">{MEDALS[index] ?? "🏅"}</div>
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={entry.profiles?.avatar_url} alt={entry.profiles?.username ?? "Anonymous"} />
                    <AvatarFallback className="text-xs">
                      {getInitial(entry.profiles?.username ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-slab font-semibold text-sm truncate">
                      {entry.batch?.name ?? "Unnamed brew"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{entry.profiles?.username ?? "anonymous"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star
                      size={14}
                      className={entry.rating > 0 ? "fill-gold text-gold" : "text-muted-foreground"}
                    />
                    <span className="font-slab font-bold">{entry.rating ?? 0}</span>
                  </div>
                </div>
              ))}
              {totalSubmissions > 3 && !showAllLeaderboard && (
                <button
                  onClick={() => setShowAllLeaderboard(true)}
                  className="w-full text-center text-sm text-teal hover:underline mt-1"
                >
                  View all {totalSubmissions} submissions
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Live submissions feed (active challenges) */}
      {status === "active" && hasJoined && (
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-teal" />
            <h2 className="font-slab text-xl font-bold">Submissions Feed</h2>
          </div>
          <SubmissionFeed challengeId={challenge.id} participantCount={participantCount} />
        </div>
      )}

      {/* Participants list */}
      {participantCount > 0 && (
        <div className="glass-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-muted-foreground" />
            <h2 className="font-slab font-semibold">
              {participantCount} {participantCount === 1 ? "Brewer" : "Brewers"} Joined
            </h2>
          </div>
          <div className="space-y-2">
            {entriesList.slice(0, 10).map((entry: any) => (
              <div key={entry.id} className="flex items-center gap-3 py-2">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={entry.profiles?.avatar_url} alt={entry.profiles?.username ?? "Anonymous"} />
                  <AvatarFallback className="text-xs">
                    {getInitial(entry.profiles?.username ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">@{entry.profiles?.username ?? "anonymous"}</p>
                  {entry.submitted_at && (
                    <p className="text-xs text-muted-foreground">Submitted</p>
                  )}
                </div>
                {entry.rating != null && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={12} className="fill-gold text-gold" />
                    <span className="font-medium">{entry.rating}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {participantCount > 10 && (
            <p className="text-xs text-muted-foreground text-center">
              +{participantCount - 10} more participants
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Submission Feed ─────────────────────────────────────────────────────────

function SubmissionFeed({ challengeId, participantCount }: { challengeId: string; participantCount: number }) {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useQuery({
    queryKey: ['challenge-posts', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data ?? []
    },
    enabled: !!challengeId,
  });

  const submissionsCount = (posts ?? []).length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (submissionsCount === 0) {
    return <p className="text-sm text-muted-foreground">No submissions yet. Be the first!</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {participantCount} {participantCount === 1 ? "person" : "people"} joined · {submissionsCount} {submissionsCount === 1 ? "has" : "have"} submitted so far
      </p>
      <div className="space-y-3">
        {(posts ?? []).map((post: any) => (
          <button
            key={post.id}
            onClick={() => navigate(`/post/${post.id}`)}
            className="w-full text-left p-4 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.username ?? "Anonymous"} />
                <AvatarFallback className="text-[10px]">
                  {getInitial(post.profiles?.username ?? "?")}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs font-semibold">@{post.profiles?.username ?? "anonymous"}</p>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {formatPostTime(post.created_at)}
              </span>
            </div>
            <p className="text-sm font-medium mb-1">{post.title}</p>
            {post.photos && post.photos.length > 0 && (
              <div className="mb-2">
                <img
                  src={post.photos[0]}
                  alt={post.title}
                  className="w-full h-40 object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart size={12} className={post.likes_count > 0 ? "fill-red-400 text-red-400" : ""} />
              <span>{post.likes_count ?? 0}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
