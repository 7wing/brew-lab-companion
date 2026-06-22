import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MessageSquare, Heart, Share2, ChevronLeft, ChevronRight, FlaskConical, Search, MoreHorizontal, Clock, Edit, Trash2, Flag } from "lucide-react";
import { usePosts, useToggleLike } from "@/hooks/usePosts";
import { useFollowedPosts } from "@/hooks/useFollowedPosts";
import { useAuth } from "@/contexts/AuthContext";
import ChallengesPanel from "@/components/ChallengesPanel";
import PostComposerFAB from "@/components/PostComposerFAB";
import { copy } from "@/constants/copy";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type SortOption = "latest" | "most_liked" | "most_commented";

// Tab categories that map to post_category DB field
const POST_TABS = [
  { label: copy.community.brewLogs, category: "brew_log" },
  { label: copy.community.troubleshooting, category: "troubleshooting" },
  { label: copy.community.tastings, category: "tasting" },
  { label: copy.community.challenges, panel: "challenges" },
] as const;

const typeAccent: Record<string, string> = {
  beer: "text-copper",
  kombucha: "text-teal",
  mead: "text-gold",
  cider: "text-copper",
  sourdough: "text-gold",
  ferment: "text-teal",
};

const avatarBg: Record<string, string> = {
  beer: "bg-copper/20",
  kombucha: "bg-teal/20",
  mead: "bg-gold/20",
  cider: "bg-copper/20",
  sourdough: "bg-gold/20",
  ferment: "bg-teal/20",
};

function getInitial(name: string): string {
  return (name?.[0] ?? "?").toUpperCase();
}

const Community = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      const idx = POST_TABS.findIndex((t) => t.panel === tab || t.category === tab);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });
  const [page, setPage] = useState(1);
  const [showFollowing, setShowFollowing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate()

  const activeTabData = POST_TABS[activeTab];
  const isChallengesPanel = activeTabData?.panel === "challenges";
  const category = activeTabData?.category;

  const { data: postsRes, isLoading: postsLoading } = usePosts(
    !isChallengesPanel && !showFollowing ? category : undefined,
    page,
    sortBy,
    undefined,
    searchQuery
  );
  const { data: followedPosts, isLoading: followedPostsLoading } = useFollowedPosts(
    { enabled: showFollowing },
    sortBy,
    searchQuery
  );

  const PAGE_SIZE = 20;
  const paginatedFollowedPosts = followedPosts?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];
  const followedTotalPages = Math.ceil((followedPosts?.length ?? 0) / PAGE_SIZE);

  const postsData = showFollowing ? paginatedFollowedPosts : (postsRes?.posts ?? []);
  const isLoading = showFollowing ? followedPostsLoading : postsLoading;
  const totalPages = showFollowing ? followedTotalPages : Math.ceil((postsRes?.total ?? 0) / PAGE_SIZE);
  const hasNextPage = page < totalPages;

  async function handleShare(post: any) {
    const url = `${window.location.origin}/community`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content,
          url,
        });
      } else {
        await navigator.clipboard.writeText(`${post.title} — ${url}`);
      }
    } catch {
      // user cancelled or unsupported
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Search community..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 transition-all placeholder:text-muted-foreground"
        />
      </div>

      {/* Mobile controls layout */}
      <div className="flex md:hidden flex-col mb-6 gap-2">
        {/* Row 1: Tabs */}
        <div className="flex justify-center">
          <div className="w-full md:w-fit flex gap-1 glass-panel rounded-xl p-1 overflow-x-auto scrollbar-hide">
            {POST_TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(i);
                  setPage(1);
                  setSearchQuery("");
                  if (tab.panel) {
                    setSearchParams({ tab: tab.panel });
                  } else if (tab.category) {
                    setSearchParams({ tab: tab.category });
                  } else {
                    setSearchParams({});
                  }
                  setSearchQuery("");
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  activeTab === i
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: All/Following + Sort */}
        {!isChallengesPanel && (
          <div className="flex items-center justify-between gap-2">
            <div className="shrink-0 flex gap-1 glass-panel rounded-lg p-1">
              <button
                onClick={() => { setShowFollowing(false); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  !showFollowing
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setShowFollowing(true); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  showFollowing
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Following
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as SortOption); setPage(1); }}
              className="shrink-0 h-9 px-3 pr-8 rounded-lg glass-panel border border-border/50 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal/30 cursor-pointer appearance-none"
            >
              <option value="latest">Latest</option>
              <option value="most_liked">Most Liked</option>
              <option value="most_commented">Most Commented</option>
            </select>
          </div>
        )}
      </div>

      {/* Desktop controls layout */}
      <div className="hidden md:flex items-center justify-between mb-6 gap-2">
        {/* Left: All / Following toggle */}
        {!isChallengesPanel ? (
          <div className="shrink-0 flex gap-1 glass-panel rounded-lg p-1">
            <button
              onClick={() => { setShowFollowing(false); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                !showFollowing
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setShowFollowing(true); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                showFollowing
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Following
            </button>
          </div>
        ) : (
          <div className="shrink-0" />
        )}

        {/* Center: Tabs */}
        <div className="flex-1 min-w-0 flex justify-center">
          <div className="flex gap-1 glass-panel rounded-xl p-1 overflow-x-auto scrollbar-hide">
            {POST_TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(i);
                  setPage(1);
                  setSearchQuery("");
                  if (tab.panel) {
                    setSearchParams({ tab: tab.panel });
                  } else if (tab.category) {
                    setSearchParams({ tab: tab.category });
                  } else {
                    setSearchParams({});
                  }
                  setSearchQuery("");
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                  activeTab === i
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Sort dropdown */}
        {!isChallengesPanel ? (
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortOption); setPage(1); }}
            className="shrink-0 h-9 px-3 pr-8 rounded-lg glass-panel border border-border/50 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal/30 cursor-pointer appearance-none"
          >
            <option value="latest">Latest</option>
            <option value="most_liked">Most Liked</option>
            <option value="most_commented">Most Commented</option>
          </select>
        ) : (
          <div className="shrink-0" />
        )}
      </div>

      {isChallengesPanel && (
        <div className="max-w-3xl mx-auto">
          <ChallengesPanel />
        </div>
      )}

      {!isChallengesPanel && (
        isLoading ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (postsData ?? []).length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center max-w-3xl mx-auto">
            <p className="text-muted-foreground">{copy.community.noPosts}</p>
          </div>
        ) : (
          <>
            {/* Posts */}
            <div className="space-y-4 max-w-3xl mx-auto">
              {(postsData ?? []).map((post: any) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => navigate(`/post/${post.id}`)}
                  onShare={() => handleShare(post)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className="p-2 rounded-lg glass-panel hover:bg-muted transition-colors disabled:opacity-40"
                  disabled={page === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium px-3">Page {page}{totalPages > 0 ? ` of ${totalPages}` : ''}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-lg glass-panel hover:bg-muted transition-colors disabled:opacity-40"
                  disabled={!hasNextPage || isLoading}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )
      )}

      {/* Post composer FAB — hidden on Challenges tab */}
      <PostComposerFAB
        activeTabCategory={category}
        activeTabPanel={activeTabData?.panel}
      />
    </div>
  );
};

function formatPostTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function PostCard({
  post,
  onClick,
  onShare,
}: {
  post: any;
  onClick: () => void;
  onShare: () => void;
}) {
  const toggleLike = useToggleLike(post.id);
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const username = post.profiles?.username ?? "anonymous";
  const avatarUrl = post.profiles?.avatar_url;
  const fallbackBg = avatarBg[post.type] || "bg-copper/20";

  return (
    <article className="glass-panel rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300">
      <div className="cursor-pointer" onClick={onClick}>
        {/* Author line */}
        <div className="flex items-center gap-2 mb-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          ) : (
            <div className={`w-8 h-8 rounded-full ${fallbackBg} border border-border flex items-center justify-center`}>
              <span className="text-xs font-semibold text-foreground">
                {getInitial(username)}
              </span>
            </div>
          )}
          <p className="text-sm font-semibold">@{username}</p>
          <span className="text-[10px] text-muted-foreground">·</span>
          <p className={`text-[10px] uppercase tracking-widest ${typeAccent[post.type] ?? "text-muted-foreground"}`}>
            {post.type}
          </p>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock size={8} />
            {formatPostTime(post.created_at)}
          </span>
        </div>

        <h3 className="font-slab font-semibold text-base mb-2">{post.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.content}</p>

        {/* Photo thumbnail */}
        {post.photos && Array.isArray(post.photos) && post.photos.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {(post.photos as string[]).slice(0, 3).map((url: string, idx: number) => (
              <div key={idx} className="w-20 h-20 rounded-lg border border-border/40 bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}

        {/* Recipe tag */}
        {post.recipe_id && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-copper bg-copper/10 px-2 py-1 rounded-md">
            <FlaskConical size={10} />
            Tagged recipe
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => toggleLike.mutate()}
          disabled={toggleLike.isPending}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-copper transition-colors disabled:opacity-50"
        >
          <Heart size={14} className={post.likes > 0 ? "fill-copper text-copper" : ""} />
          {post.likes ?? 0}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClick() }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal transition-colors"
        >
          <MessageSquare size={14} />
          Comments
        </button>
        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <Share2 size={14} /> {copy.common.share}
          </button>

          {/* Options menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Options"
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={() => toast.info("Edit post — coming soon")} className="cursor-pointer gap-2">
                    <Edit size={14} /> Edit post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                        <Trash2 size={14} /> Delete post
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-w-full">
                      <DialogHeader>
                        <DialogTitle className="font-slab">Delete post?</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => { setShowDeleteConfirm(false); toast.info("Delete post — coming soon"); }}>Delete</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <DropdownMenuItem onClick={() => toast.info("Report post — coming soon")} className="cursor-pointer gap-2">
                  <Flag size={14} /> Report post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}

export default Community;
