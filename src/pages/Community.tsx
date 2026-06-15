import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MessageSquare, Heart, Share2, ChevronLeft, ChevronRight, FlaskConical, Send, Loader2 } from "lucide-react";
import { usePosts, useToggleLike, useComments, useAddComment } from "@/hooks/usePosts";
import { useFollowedPosts } from "@/hooks/useFollowedPosts";
import ChallengesPanel from "@/components/ChallengesPanel";
import PostComposerFAB from "@/components/PostComposerFAB";
import { copy } from "@/constants/copy";

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
  const navigate = useNavigate()

  const activeTabData = POST_TABS[activeTab];
  const isChallengesPanel = activeTabData?.panel === "challenges";
  const category = activeTabData?.category;

  const { data: postsRes, isLoading: postsLoading } = usePosts(
    !isChallengesPanel && !showFollowing ? category : undefined,
    page,
    sortBy
  );
  const { data: followedPosts, isLoading: followedPostsLoading } = useFollowedPosts(
    { enabled: showFollowing },
    sortBy
  );

  const PAGE_SIZE = 20;
  const paginatedFollowedPosts = followedPosts?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];
  const followedTotalPages = Math.ceil((followedPosts?.length ?? 0) / PAGE_SIZE);

  const postsData = showFollowing ? paginatedFollowedPosts : (postsRes?.posts ?? []);
  const isLoading = showFollowing ? followedPostsLoading : postsLoading;
  const totalPages = showFollowing ? followedTotalPages : Math.ceil((postsRes?.total ?? 0) / PAGE_SIZE);
  const hasNextPage = page < totalPages;

  const addComment = useAddComment();

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
      <div className="mb-6">
        <h1 className="font-slab text-2xl md:text-3xl font-bold">Community</h1>
        <p className="text-muted-foreground text-sm mt-1">{copy.community.joinDiscussion}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 glass-panel rounded-xl p-1 w-full md:w-fit overflow-x-auto scrollbar-hide mx-auto">
        {POST_TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => {
              setActiveTab(i);
              setPage(1);
              setExpandedPost(null);
              if (tab.panel) {
                setSearchParams({ tab: tab.panel });
              } else if (tab.category) {
                setSearchParams({ tab: tab.category });
              } else {
                setSearchParams({});
              }
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

      {/* All/Following toggle + Sort dropdown */}
      {!isChallengesPanel && (
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* All / Following toggle */}
          <div className="flex gap-1 glass-panel rounded-lg p-1">
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

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortOption); setPage(1); }}
            className="h-9 px-3 pr-8 rounded-lg glass-panel border border-border/50 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal/30 cursor-pointer appearance-none"
          >
            <option value="latest">Latest</option>
            <option value="most_liked">Most Liked</option>
            <option value="most_commented">Most Commented</option>
          </select>
        </div>
      )}

      {isChallengesPanel && <ChallengesPanel />}

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

  return (
    <article className="glass-panel rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-copper/20 to-teal/20 border border-border flex items-center justify-center">
          <FlaskConical size={14} className={typeAccent[post.type] || "text-copper"} />
        </div>
        <div>
          <p className="text-sm font-semibold">{post.profiles?.username ?? "Anonymous"}</p>
          <p className={`text-[10px] uppercase tracking-widest ${typeAccent[post.type] ?? "text-muted-foreground"}`}>
            {post.type}
          </p>
        </div>
      </div>
      <h3 className="font-slab font-semibold text-base mb-2">{post.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => toggleLike.mutate()}
          disabled={toggleLike.isPending}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-copper transition-colors disabled:opacity-50"
        >
          <Heart size={14} className={post.likes > 0 ? "fill-copper text-copper" : ""} />
          {post.likes}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClick() }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal transition-colors"
        >
          <MessageSquare size={14} />
          {copy.common.view}
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors ml-auto"
        >
          <Share2 size={14} /> {copy.common.share}
        </button>
      </div>
    </article>
  );
}

function CommentSection({
  postId,
  commentText,
  setCommentText,
  onClose,
}: {
  postId: string;
  commentText: string;
  setCommentText: (s: string) => void;
  onClose: () => void;
}) {
  const { data: comments, isLoading } = useComments(postId);
  const addComment = useAddComment();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment.mutate(
      { post_id: postId, content: commentText.trim() },
      {
        onSuccess: () => setCommentText(""),
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-lg bg-background border border-border rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <h3 className="font-slab font-semibold text-sm">{copy.common.view} Comments</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (comments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">No comments yet. Be the first!</p>
          ) : (
            (comments ?? []).map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-copper/20 to-teal/20 border border-border flex items-center justify-center shrink-0">
                  <FlaskConical size={10} className="text-copper" />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    {c.profiles?.username ?? "Anonymous"}
                  </p>
                  <p className="text-sm text-muted-foreground">{c.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="px-5 py-4 border-t border-border/50 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
          <button
            type="submit"
            disabled={addComment.isPending || !commentText.trim()}
            className="h-10 w-10 rounded-lg bg-teal text-teal-foreground flex items-center justify-center disabled:opacity-50 transition-colors"
          >
            {addComment.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Community;