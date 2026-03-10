import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createComment,
  deleteComment,
  getPostLikes,
  getPostComments,
  sharePost,
  toggleCommentLike,
  updateComment,
  updatePost,
} from '../api/postsApi';
import CommentItem from './CommentItem';
import ConfirmDialog from './ConfirmDialog';
import ReactionsModal from './ReactionsModal';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getUserId } from '../utils/errorMessage';

function PostCard({ post, currentUserId, onDelete, onLike, onBookmark, onShare, onUpdate }) {
  const fallbackAvatar = 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBody, setShareBody] = useState('');
  const [sharing, setSharing] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState('');
  const [postReactionsOpen, setPostReactionsOpen] = useState(false);
  const [postReactions, setPostReactions] = useState([]);
  const [postReactionsLoading, setPostReactionsLoading] = useState(false);
  const [postReactionsPage, setPostReactionsPage] = useState(1);
  const [postReactionsHasNext, setPostReactionsHasNext] = useState(true);
  const menuRef = useRef(null);
  const resolvedPost = post?.post || post;
  const postId = resolvedPost?._id || resolvedPost?.id;
  const postOwnerId = getUserId(resolvedPost?.user || resolvedPost?.creator || resolvedPost?.author);
  const canEdit = currentUserId && postOwnerId && currentUserId === postOwnerId;
  const imageUrl = resolvedPost?.image || resolvedPost?.photo || '';
  const bodyText = resolvedPost?.body || resolvedPost?.content || '';
  const sharedPost = resolvedPost?.sharedPost;
  const likesCount = resolvedPost?.likesCount || resolvedPost?.likes?.length || 0;
  const commentsCount = resolvedPost?.commentsCount || resolvedPost?.comments?.length || 0;
  const sharesCount = resolvedPost?.sharesCount || 0;
  const createdLabel = resolvedPost?.createdAt ? new Date(resolvedPost.createdAt).toLocaleString() : '';
  useEffect(() => {
    if (!menuOpen) return () => {};

    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (!shareOpen && !imagePreviewOpen) return () => {};

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShareOpen(false);
        setImagePreviewOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [shareOpen, imagePreviewOpen]);

  useEffect(() => {
    if (isEditing) {
      setEditBody(bodyText);
    }
  }, [isEditing, bodyText]);

  const handleInlineUpdate = async () => {
    if (!postId) return;
    const trimmedBody = editBody.trim();
    if (!trimmedBody) {
      showToast('error', 'Post text is required.');
      return;
    }

    setSavingEdit(true);
    try {
      await updatePost(postId, { body: trimmedBody });
      showToast('success', 'Post updated successfully.');
      setIsEditing(false);
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleShareSubmit = async () => {
    if (!postId) return;
    setSharing(true);
    try {
      const caption = shareBody.trim();
      await sharePost(postId, caption);
      if (onShare) {
        await onShare(postId, caption);
      }
      showToast('success', 'Post shared successfully.');
      setShareOpen(false);
      setShareBody('');
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setSharing(false);
    }
  };

  const loadComments = async () => {
    if (!postId) return;
    setCommentsLoading(true);
    try {
      const result = await getPostComments(postId, { page: 1, limit: 20 });
      const list = result?.data?.comments || result?.comments || result?.data || [];
      setComments(Array.isArray(list) ? list : []);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setCommentsLoading(false);
    }
  };

  const toggleCommentsPanel = async () => {
    if (commentsOpen) {
      setCommentsOpen(false);
      return;
    }
    setCommentsOpen(true);
    await loadComments();
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!postId) return;
    const text = newComment.trim();
    if (!text) {
      showToast('error', 'Comment text is required.');
      return;
    }

    setAddingComment(true);
    try {
      await createComment(postId, { body: text });
      setNewComment('');
      await loadComments();
      showToast('success', 'Comment added.');
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setAddingComment(false);
    }
  };

  const handleUpdateComment = async (commentId, body, onDone) => {
    if (!postId) return;
    try {
      await updateComment(postId, commentId, { body });
      await loadComments();
      showToast('success', 'Comment updated.');
      onDone();
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const handleDeleteComment = async () => {
    if (!deletingCommentId || !postId) return;
    try {
      await deleteComment(postId, deletingCommentId);
      await loadComments();
      showToast('success', 'Comment deleted.');
      setDeletingCommentId('');
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!postId) return;
    try {
      await toggleCommentLike(postId, commentId);
      await loadComments();
      showToast('success', 'Comment like updated.');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const loadPostReactions = async (selectedPage = 1) => {
    if (!postId) return;
    try {
      setPostReactionsLoading(true);
      const result = await getPostLikes(postId, { page: selectedPage, limit: 20 });
      const list = result?.data?.likes || result?.likes || result?.data || [];
      const nextUsers = Array.isArray(list) ? list : [];
      const numberOfPages = result?.meta?.pagination?.numberOfPages || 1;
      const currentPage = result?.meta?.pagination?.currentPage || selectedPage;
      setPostReactions(nextUsers);
      setPostReactionsPage(currentPage);
      setPostReactionsHasNext(currentPage < numberOfPages);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setPostReactionsLoading(false);
    }
  };

  const openPostReactions = async () => {
    setPostReactionsOpen(true);
    await loadPostReactions(1);
  };

  return (
    <>
      <article className="rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <img
            src={resolvedPost?.user?.photo || fallbackAvatar}
            alt={resolvedPost?.user?.name || 'User'}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h3 className="text-sm font-semibold text-white">{resolvedPost?.user?.name || 'Unknown user'}</h3>
            <p className="text-xs text-slate-400">
              @{resolvedPost?.user?.username || 'user'} - {createdLabel}
            </p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-lg text-slate-300 transition hover:bg-slate-700 hover:text-white"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Post actions"
            aria-expanded={menuOpen}
          >
            &#8942;
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-9 z-20 min-w-40 rounded-xl border border-slate-700 bg-slate-800 p-1.5 shadow-lg">
              <button
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-700"
                onClick={() => {
                  setMenuOpen(false);
                  if (!postId) return;
                  onBookmark?.(postId);
                }}
              >
                Save post
              </button>
              {canEdit ? (
                <button
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-700"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditing(true);
                  }}
                >
                  Edit post
                </button>
              ) : null}
              {canEdit && onDelete ? (
                <button
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/10"
                  onClick={() => {
                    setMenuOpen(false);
                    if (!postId) return;
                    onDelete(postId);
                  }}
                >
                  Delete post
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {isEditing ? (
        <div className="mb-3 space-y-2 rounded-xl border border-slate-700 bg-slate-700 p-3">
          <textarea
            className="min-h-28 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
            value={editBody}
            onChange={(event) => setEditBody(event.target.value)}
            placeholder="Write your post..."
          />
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              onClick={() => {
                setIsEditing(false);
                setEditBody(bodyText);
              }}
              disabled={savingEdit}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
              onClick={handleInlineUpdate}
              disabled={savingEdit}
            >
              {savingEdit ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-3 whitespace-pre-wrap text-slate-100">{bodyText || 'No text provided.'}</p>
      )}

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Post"
          className="mb-3 max-h-80 w-full cursor-zoom-in rounded-xl object-cover"
          onClick={() => setImagePreviewOpen(true)}
        />
      ) : null}

      {sharedPost ? (
        <div className="mb-3 rounded-xl border border-slate-700 bg-slate-700 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{sharedPost?.user?.name || 'Original user'}</p>
            <p className="text-xs text-blue-400">Original Post</p>
          </div>
          <p className="mt-1 text-xs text-slate-400">@{sharedPost?.user?.username || 'user'}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-100">{sharedPost?.body || sharedPost?.content || ''}</p>
        </div>
      ) : null}

      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <button className="transition hover:text-blue-400" onClick={openPostReactions}>
          {likesCount} likes
        </button>
        <div className="flex items-center gap-3">
          <span>{sharesCount} shares</span>
          <span>{commentsCount} comments</span>
          <Link className="font-medium text-blue-400 hover:text-blue-300" to={`/posts/${postId}`} state={{ post: resolvedPost }}>
            View details
          </Link>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-700 pt-2">
        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-200 transition hover:bg-slate-700"
          onClick={() => {
            if (!postId) return;
            onLike?.(postId);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 20s-6.5-3.8-8.5-7.2c-1.2-2-1-4.9 1.2-6.4 2.1-1.5 4.7-.9 6.2.9.5.6.8 1.1 1.1 1.7.3-.6.6-1.1 1.1-1.7 1.5-1.8 4.1-2.4 6.2-.9 2.2 1.5 2.4 4.4 1.2 6.4C18.5 16.2 12 20 12 20Z" />
          </svg>
          Like
        </button>
        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-200 transition hover:bg-slate-700"
          onClick={toggleCommentsPanel}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z" />
          </svg>
          Comment
        </button>
        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-200 transition hover:bg-slate-700"
          onClick={() => {
            setShareBody('');
            setShareOpen(true);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 8l5-5M20 3h-4M20 3v4" />
            <path d="M14 10H8a4 4 0 0 0-4 4v5h12a4 4 0 0 0 4-4v-3" />
          </svg>
          Share
        </button>
      </div>

      {commentsOpen ? (
        <section className="mt-3 rounded-xl border border-slate-700 bg-slate-700 p-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white">
              Comments <span className="ml-1 rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-200">{comments.length}</span>
            </h4>
            <button className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-[11px] text-slate-200 transition hover:bg-slate-700">Most relevant</button>
          </div>
          <form className="mt-2 space-y-2" onSubmit={handleAddComment}>
            <textarea
              className="min-h-20 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Write a comment..."
            />
            <div className="flex justify-end">
              <button
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                disabled={addingComment}
              >
                {addingComment ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </form>
          <div className="mt-3 space-y-2">
            {commentsLoading ? <p className="text-xs text-slate-400">Loading comments...</p> : null}
            {!commentsLoading && comments.length === 0 ? (
              <p className="text-xs text-slate-400">No comments yet.</p>
            ) : null}
            {comments.map((comment) => (
              <CommentItem
                key={comment?._id || comment?.id}
                comment={comment}
                postId={postId}
                currentUserId={currentUserId}
                onDelete={setDeletingCommentId}
                onUpdate={handleUpdateComment}
                onLike={handleCommentLike}
                onPostRefresh={onUpdate}
              />
            ))}
          </div>
        </section>
      ) : null}
      </article>

      {shareOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 p-4" onClick={() => !sharing && setShareOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-base font-semibold text-white">Share post</h3>
            <textarea
              className="mt-3 min-h-24 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              value={shareBody}
              onChange={(event) => setShareBody(event.target.value)}
              placeholder="Say something about this post (optional)..."
            />
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-700 p-3">
              <p className="text-sm font-semibold text-white">{resolvedPost?.user?.name || 'Original user'}</p>
              <p className="mt-1 text-xs text-slate-400">@{resolvedPost?.user?.username || 'user'}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-100">{bodyText || 'No text provided.'}</p>
              {imageUrl ? (
                <img src={imageUrl} alt="Shared preview" className="mt-3 max-h-60 w-full rounded-lg object-cover" />
              ) : null}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
                onClick={() => setShareOpen(false)}
                disabled={sharing}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                onClick={handleShareSubmit}
                disabled={sharing}
              >
                {sharing ? 'Sharing...' : 'Share now'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {imagePreviewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          onClick={() => setImagePreviewOpen(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-white transition hover:bg-slate-700"
            onClick={() => setImagePreviewOpen(false)}
          >
            Close
          </button>
          <img
            src={imageUrl}
            alt="Post preview"
            className="max-h-[90vh] w-auto max-w-full rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deletingCommentId)}
        title="Delete comment"
        message="This comment will be removed."
        confirmText="Delete"
        onCancel={() => setDeletingCommentId('')}
        onConfirm={handleDeleteComment}
      />

      <ReactionsModal
        open={postReactionsOpen}
        title="People who reacted"
        users={postReactions}
        loading={postReactionsLoading}
        page={postReactionsPage}
        hasNext={postReactionsHasNext}
        onPageChange={loadPostReactions}
        onClose={() => setPostReactionsOpen(false)}
      />
    </>
  );
}

export default PostCard;
