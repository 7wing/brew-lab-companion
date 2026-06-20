import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Loader2,
  Send,
  X,
  Check,
  Clock,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToggleLike, useComments, useAddComment, useDeletePost } from '@/hooks/usePosts'
import { useIsFollowing, useFollow, useUnfollow } from '@/hooks/useFollows'
import { useUpdateComment } from '@/hooks/useUpdateComment'
import { useDeleteComment } from '@/hooks/useDeleteComment'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { copy } from '@/constants/copy'
import { formatPostTime, getInitial } from '@/lib/utils'

const typeAccent: Record<string, string> = {
  beer: 'text-copper',
  kombucha: 'text-teal',
  mead: 'text-gold',
  cider: 'text-copper',
  sourdough: 'text-gold',
  ferment: 'text-teal',
}

const avatarBg: Record<string, string> = {
  beer: 'bg-copper/20',
  kombucha: 'bg-teal/20',
  mead: 'bg-gold/20',
  cider: 'bg-copper/20',
  sourdough: 'bg-gold/20',
  ferment: 'bg-teal/20',
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showPostDeleteConfirm, setShowPostDeleteConfirm] = useState(false)

  // Fetch post
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      if (!id) throw new Error('No post id')
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  const { data: comments = [] } = useComments(id)
  const addComment = useAddComment()
  const updateComment = useUpdateComment()
  const deleteComment = useDeleteComment()
  const toggleLike = useToggleLike(id ?? '')
  const deletePost = useDeletePost()

  const isOwner = user?.id === post?.user_id
  const canFollow = user && !isOwner && post?.user_id

  const { data: isFollowing } = useIsFollowing(post?.user_id)
  const follow = useFollow()
  const unfollow = useUnfollow()

  async function handleShare() {
    const url = `${window.location.origin}/post/${id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title, text: post?.content, url })
      } else {
        await navigator.clipboard.writeText(`${post?.title} — ${url}`)
      }
    } catch {
      // user cancelled
    }
  }

  function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !id) return
    addComment.mutate(
      { post_id: id, content: commentText.trim() },
      { onSuccess: () => setCommentText('') }
    )
  }

  function handleStartEdit(comment: any) {
    setEditingCommentId(comment.id)
    setEditText(comment.content)
  }

  function handleSaveEdit(commentId: string) {
    if (!editText.trim() || !id) return
    updateComment.mutate(
      { commentId, content: editText.trim(), postId: id },
      { onSuccess: () => setEditingCommentId(null) }
    )
  }

  function handleDeleteComment(commentId: string) {
    if (!id) return
    deleteComment.mutate({ commentId, postId: id }, { onSuccess: () => setDeleteConfirmId(null) })
  }

  function handleDeletePost() {
    if (!post) return
    deletePost.mutate(
      { id: post.id },
      {
        onSuccess: () => {
          toast.success('Post deleted')
          navigate('/community')
        },
        onError: () => {
          toast.error('Failed to delete post')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Post not found.</p>
        <button onClick={() => navigate('/community')} className="mt-4 text-teal underline">
          Go back to Community
        </button>
      </div>
    )
  }

  const postAvatarUrl = post.profiles?.avatar_url
  const postUsername = post.profiles?.username ?? 'Anonymous'
  const postFallbackBg = avatarBg[post.type] || 'bg-copper/20'

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/community')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {canFollow && (
          <button
            onClick={() =>
              isFollowing
                ? unfollow.mutate(post.user_id)
                : follow.mutate(post.user_id)
            }
            disabled={follow.isPending || unfollow.isPending}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            {follow.isPending || unfollow.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isFollowing ? (
              <>
                <Check size={14} /> Following
              </>
            ) : (
              <>
                <Heart size={14} /> Follow
              </>
            )}
          </button>
        )}
      </div>

      {/* Post card */}
      <article className="glass-panel rounded-xl p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {postAvatarUrl ? (
              <img
                src={postAvatarUrl}
                alt={postUsername}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full ${postFallbackBg} border border-border flex items-center justify-center`}
              >
                <span className="text-xs font-semibold text-foreground">
                  {getInitial(postUsername)}
                </span>
              </div>
            )}
            <p className="text-sm font-semibold">@{postUsername}</p>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span
              className={`text-[10px] uppercase tracking-widest ${typeAccent[post.type] ?? 'text-muted-foreground'}`}
            >
              {post.type}
            </span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock size={8} />
              {formatPostTime(post.created_at)}
              {post.edited_at && (
                <span
                  className="ml-1 text-teal"
                  title={`Edited ${formatPostTime(post.edited_at)}`}
                >
                  (Edited)
                </span>
              )}
            </span>
          </div>

          {/* Post options menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                aria-label="Post options"
              >
                <MoreHorizontal size={18} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {isOwner ? (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate(`/community?edit=${post.id}`)}
                    className="cursor-pointer gap-2"
                  >
                    <Edit size={14} /> {copy.common.edit}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowPostDeleteConfirm(true)}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 size={14} /> {copy.common.delete}
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={() => toast.info('Report post — coming soon')}
                  className="cursor-pointer gap-2"
                >
                  <Flag size={14} /> Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h1 className="font-slab font-bold text-xl sm:text-2xl mb-3">{post.title}</h1>

        {/* Content */}
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4">
          {post.content}
        </p>

        {/* Photos */}
        {post.photos && post.photos.length > 0 && (
          <div
            className={`grid gap-2 mb-4 ${post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
          >
            {(post.photos as string[]).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        )}

        {/* Recipe tag */}
        {post.recipe_id && (
          <Link
            to={`/recipe/${post.recipe_id}`}
            className="inline-flex items-center gap-1.5 text-sm text-teal hover:underline mb-4"
          >
            <Send size={14} /> View linked recipe
          </Link>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-border/30">
          <button
            onClick={() => toggleLike.mutate()}
            disabled={toggleLike.isPending}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-copper transition-colors disabled:opacity-50"
          >
            <Heart size={16} className={post.likes > 0 ? 'fill-copper text-copper' : ''} />
            {post.likes}
          </button>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal transition-colors">
            <MessageSquare size={16} /> {comments.length}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors ml-auto"
          >
            <Share2 size={16} /> {copy.common.share}
          </button>
        </div>
      </article>

      {/* Comments section */}
      <section className="mt-6">
        <h2 className="font-slab font-semibold text-base mb-4">
          Comments{' '}
          <span className="text-muted-foreground font-normal text-sm">({comments.length})</span>
        </h2>

        {/* Comment list */}
        <div className="space-y-4">
          {comments.map((comment: any) => {
            const isCommentOwner = user?.id === comment.user_id
            const commentAvatarUrl = comment.profiles?.avatar_url
            const commentUsername = comment.profiles?.username ?? 'Anonymous'
            const commentFallbackBg = avatarBg[post.type] || 'bg-copper/20'

            return (
              <div key={comment.id} className="glass-panel rounded-xl p-4">
                <div className="flex items-start gap-3">
                  {commentAvatarUrl ? (
                    <img
                      src={commentAvatarUrl}
                      alt={commentUsername}
                      className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full ${commentFallbackBg} border border-border flex items-center justify-center shrink-0`}
                    >
                      <span className="text-xs font-semibold text-foreground">
                        {getInitial(commentUsername)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">{commentUsername}</p>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock size={8} />
                        {formatPostTime(comment.created_at)}
                        {comment.edited_at && (
                          <span
                            className="ml-1 text-teal text-[10px]"
                            title={`Edited ${formatPostTime(comment.edited_at)}`}
                          >
                            (Edited)
                          </span>
                        )}
                      </span>

                      {/* Comment options */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1 rounded hover:bg-muted ml-auto"
                            aria-label="Comment options"
                          >
                            <MoreHorizontal size={14} className="text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {isCommentOwner ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleStartEdit(comment)}
                                className="cursor-pointer gap-2"
                              >
                                <Edit size={14} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirmId(comment.id)}
                                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 size={14} /> Delete
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => toast.info('Report comment — coming soon')}
                              className="cursor-pointer gap-2"
                            >
                              <Flag size={14} /> Report
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Inline edit */}
                    {editingCommentId === comment.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 rounded-lg bg-muted/50 border border-border/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal/30"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={updateComment.isPending || !editText.trim()}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal text-teal-foreground text-xs disabled:opacity-50"
                          >
                            <Check size={12} /> Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs"
                          >
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Comment input */}
        <form onSubmit={handleSubmitComment} className="flex items-center gap-3 mt-4">
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
      </section>

      {/* Comment delete confirmation dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete comment?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm"
            >
              {copy.common.cancel}
            </button>
            <button
              onClick={() => deleteConfirmId && handleDeleteComment(deleteConfirmId)}
              disabled={deleteComment.isPending}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm disabled:opacity-50"
            >
              {deleteComment.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                copy.common.delete
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post delete confirmation dialog */}
      <Dialog open={showPostDeleteConfirm} onOpenChange={setShowPostDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowPostDeleteConfirm(false)}
              className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm"
            >
              {copy.common.cancel}
            </button>
            <button
              onClick={handleDeletePost}
              disabled={deletePost.isPending}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm disabled:opacity-50"
            >
              {deletePost.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                copy.common.delete
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
