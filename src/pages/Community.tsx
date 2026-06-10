import { useState } from "react";
import { MessageSquare, Heart, Share2, ChevronLeft, ChevronRight, FlaskConical, Send, Loader2 } from "lucide-react";
import { usePosts, useToggleLike, useComments, useAddComment } from "@/hooks/usePosts";

const tabs = [
  { label: "Recipes Shared", category: "recipe" },
  { label: "Troubleshooting", category: "troubleshooting" },
  { label: "Tastings", category: "tasting" },
];

const typeAccent: Record<string, string> = {
  beer: "text-copper",
  kombucha: "text-teal",
  mead: "text-gold",
  cider: "text-copper",
  sourdough: "text-gold",
  ferment: "text-teal",
};

const Community = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const category = tabs[activeTab]?.category;
  const { data: posts, isLoading } = usePosts(category);

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
        <h1 className="font-slab text-2xl md:text-3xl font-bold">Community Ferment</h1>
        <p className="text-muted-foreground text-sm mt-1">Lab notebooks from fellow brewers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 glass-panel rounded-xl p-1 w-fit">
        {tabs.map((tab, i) => (
          <button
            key={tab.category}
            onClick={() => { setActiveTab(i); setPage(1); setExpandedPost(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === i
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4 max-w-3xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (posts ?? []).length === 0 ? (
        <div className="glass-panel rounded-xl p-8 text-center max-w-3xl">
          <p className="text-muted-foreground">No posts yet in this category.</p>
        </div>
      ) : (
        <>
          {/* Posts */}
          <div className="space-y-4 max-w-3xl">
            {(posts ?? []).map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                isExpanded={expandedPost === post.id}
                onToggleComments={() =>
                  setExpandedPost((id) => (id === post.id ? null : post.id))
                }
                onShare={() => handleShare(post)}
              />
            ))}
          </div>

          {/* Pagination placeholder */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              className="p-2 rounded-lg glass-panel hover:bg-muted transition-colors"
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium px-3">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg glass-panel hover:bg-muted transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* Comment section overlay for expanded post */}
      {expandedPost && (
        <CommentSection
          postId={expandedPost}
          commentText={commentText}
          setCommentText={setCommentText}
          onClose={() => setExpandedPost(null)}
        />
      )}
    </div>
  );
};

function PostCard({
  post,
  isExpanded,
  onToggleComments,
  onShare,
}: {
  post: any;
  isExpanded: boolean;
  onToggleComments: () => void;
  onShare: () => void;
}) {
  const toggleLike = useToggleLike(post.id);

  return (
    <article className="glass-panel rounded-xl p-5 hover:shadow-lg transition-all duration-300">
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
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30">
        <button
          onClick={() => toggleLike.mutate()}
          disabled={toggleLike.isPending}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-copper transition-colors disabled:opacity-50"
        >
          <Heart size={14} className={post.likes > 0 ? "fill-copper text-copper" : ""} />
          {post.likes}
        </button>
        <button
          onClick={onToggleComments}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isExpanded ? "text-teal" : "text-muted-foreground hover:text-teal"
          }`}
        >
          <MessageSquare size={14} />
          Comments
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors ml-auto"
        >
          <Share2 size={14} /> Share
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
          <h3 className="font-slab font-semibold text-sm">Comments</h3>
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
