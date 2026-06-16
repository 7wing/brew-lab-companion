import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageSquare,
  MoreHorizontal,
  Edit2,
  Trash2,
  Flag,
  Loader2,
  Send,
  X,
  Check,
  FlaskConical,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToggleLike, useComments, useAddComment } from '@/hooks/usePosts'
import { useUpdateComment } from '@/hooks/useUpdateComment'
import { useDeleteComment } from '@/hooks/useDeleteComment'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { copy } from '@/constants/copy'

const typeAccent: Record<string, string> = {
  beer: 'text-copper',
  kombucha: 'text-teal',
  mead: 'text-gold',
  cider: 'text-copper',
  sourdough: 'text-gold',
  ferment: 'text-teal',
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null)
  const [openPostOptions, setOpenPostOptions] = useState(false)
  const [postMenuAnchor, setPostMenuAnchor] = useState<{ x: number; y: number } | null>(null)
  const [commentMenuAnchor, setCommentMenuAnchor] = useState<{ x: number; y: number } | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const qc = useQueryClient()

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

  const isOwner = user?.id === post?.user_id

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
    setOpenOptionsId(null)
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
    // Delegate to parent orchestrator — this is a stub that navigates back
    // Real implementation would call a useDeletePost mutation
    navigate('/community')
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/community')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Post card */}
      <article className="glass-panel rounded-xl p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-copper/20 to-teal/20 border border-border flex items-center justify-center">
              <FlaskConical size={16} className={typeAccent[post.type] || 'text-copper'} />
            </div>
            <div>
              <p className="text-sm font-semibold">{post.profiles?.username ?? 'Anonymous'}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-widest ${typeAccent[post.type] ?? 'text-muted-foreground'}`}>
                  {post.type}
                </span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(post.created_at).toLocaleString()}
                  {post.edited_at && (
                    <span className="ml-1 text-teal" title={`Edited ${new Date(post.edited_at).toLocaleString()}`}>
                      (Edited)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Options menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpenPostOptions(true)
                setPostMenuAnchor({ x: e.clientX, y: e.clientY })
              }}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <MoreHorizontal size={18} className="text-muted-foreground" />
            </button>

            {openPostOptions && (
              <div className="fixed inset-0 z-50" onClick={() => setOpenPostOptions(false)}>
                <div className="absolute bg-background border border-border rounded-xl shadow-xl py-1 min-w-[160px] z-10"
                  style={{ top: postMenuAnchor?.y ?? 0, right: 16 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => { setOpenPostOptions(false); navigate(`/community?edit=${post.id}`) }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-muted text-left"
                      >
                        <Edit2 size={14} /> {copy.common.edit}
                      </button>
                      <button
                        onClick={() => { setOpenPostOptions(false); handleDeletePost() }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-muted text-left text-red-500"
                      >
                        <Trash2 size={14} /> {copy.common.delete}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setOpenPostOptions(false) }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-muted text-left"
                    >
                      <Flag size={14} /> Report
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="font-slab font-bold text-xl sm:text-2xl mb-3">{post.title}</h1>

        {/* Content */}
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4">
          {post.content}
        </p>

        {/* Photos */}
        {post.photos && post.photos.length > 0 && (
          <div className={`grid gap-2 mb-4 ${post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
            <FlaskConical size={14} /> View linked recipe
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
          Comments <span className="text-muted-foreground font-normal text-sm">({comments.length})</span>
        </h2>

        {/* Comment list */}
        <div className="space-y-4">
          {comments.map((comment: any) => {
            const isCommentOwner = user?.id === comment.user_id
            return (
              <div key={comment.id} className="glass-panel rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-copper/20 to-teal/20 border border-border flex items-center justify-center shrink-0">
                    <FlaskConical size={12} className="text-copper" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">{comment.profiles?.username ?? 'Anonymous'}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                        {comment.edited_at && (
                          <span className="ml-1 text-teal text-[10px]" title={`Edited ${new Date(comment.edited_at).toLocaleString()}`}>
                            (Edited)
                          </span>
                        )}
                      </span>

                      {/* Comment options */}
                      <div className="relative ml-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenOptionsId(openOptionsId === comment.id ? null : comment.id)
                            setCommentMenuAnchor({ x: e.clientX, y: e.clientY })
                          }}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <MoreHorizontal size={14} className="text-muted-foreground" />
                        </button>

                        {openOptionsId === comment.id && (
                          <div className="fixed inset-0 z-50" onClick={() => setOpenOptionsId(null)}>
                            <div
                              className="absolute bg-background border border-border rounded-xl shadow-xl py-1 min-w-[140px] z-10"
                              style={{ top: commentMenuAnchor?.y ?? 0, right: 16 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isCommentOwner ? (
                                <>
                                  <button
                                    onClick={() => { handleStartEdit(comment); setOpenOptionsId(null) }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-muted text-left"
                                  >
                                    <Edit2 size={12} /> Edit
                                  </button>
                                  <button
                                    onClick={() => { setDeleteConfirmId(comment.id); setOpenOptionsId(null) }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-muted text-left text-red-500"
                                  >
                                    <Trash2 size={12} /> Delete
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setOpenOptionsId(null)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-muted text-left"
                                >
                                  <Flag size={12} /> Report
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{comment.content}</p>
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
            {addComment.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </section>

      {/* Delete confirmation dialog */}
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
              {deleteComment.isPending ? <Loader2 size={14} className="animate-spin" /> : copy.common.delete}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}