import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import CommentItem from '../components/CommentItem';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import {
  createComment,
  createReply,
  deleteComment,
  getCommentReplies,
  getPostComments,
  getPostDetails,
  toggleCommentLike,
  updateComment,
} from '../api/postsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getUserId } from '../utils/errorMessage';

const extractComments = (result) => {
  const comments = result?.data?.comments || result?.comments || result?.data || [];
  return Array.isArray(comments) ? comments : [];
};

function PostDetails() {
  const { postId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const currentUserId = getUserId(user);

  const [post, setPost] = useState(state?.post || null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newReplyByComment, setNewReplyByComment] = useState({});
  const [repliesByComment, setRepliesByComment] = useState({});
  const [openReplies, setOpenReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState('');

  const loadRepliesForComment = async (commentId) => {
    const result = await getCommentReplies(postId, commentId, { page: 1, limit: 20 });
    const replies = result?.data?.replies || result?.replies || result?.data || [];
    setRepliesByComment((prev) => ({ ...prev, [commentId]: Array.isArray(replies) ? replies : [] }));
  };

  const loadPost = async () => {
    if (post) return;

    try {
      const result = await getPostDetails(postId);
      setPost(result?.data || result?.post || null);
    } catch (error) {
      // Keep page usable even if details endpoint is unavailable.
      setPost(null);
    }
  };

  const loadComments = async () => {
    const result = await getPostComments(postId, { page: 1, limit: 30 });
    setComments(extractComments(result));
  };

  const loadPageData = async () => {
    setLoading(true);
    try {
      await loadPost();
      await loadComments();
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [postId]);

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!newComment.trim()) {
      showToast('error', 'Comment text is required.');
      return;
    }

    setSubmittingComment(true);
    try {
      await createComment(postId, { body: newComment.trim() });
      setNewComment('');
      await loadComments();
      showToast('success', 'Comment added.');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deletingCommentId) return;
    try {
      await deleteComment(postId, deletingCommentId);
      await loadComments();
      showToast('success', 'Comment deleted.');
      setDeletingCommentId('');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const handleUpdateComment = async (commentId, body, onDone) => {
    try {
      await updateComment(postId, commentId, { body });
      await loadComments();
      showToast('success', 'Comment updated.');
      onDone();
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    try {
      await toggleCommentLike(postId, commentId);
      await loadComments();
      showToast('success', 'Comment like updated.');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const toggleRepliesPanel = async (commentId) => {
    const isOpen = openReplies[commentId];
    if (isOpen) {
      setOpenReplies((prev) => ({ ...prev, [commentId]: false }));
      return;
    }

    setOpenReplies((prev) => ({ ...prev, [commentId]: true }));
    try {
      await loadRepliesForComment(commentId);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const addReply = async (commentId) => {
    const text = newReplyByComment[commentId]?.trim();
    if (!text) {
      showToast('error', 'Reply text is required.');
      return;
    }

    try {
      await createReply(postId, commentId, { body: text });
      setNewReplyByComment((prev) => ({ ...prev, [commentId]: '' }));
      await loadRepliesForComment(commentId);
      setOpenReplies((prev) => ({ ...prev, [commentId]: true }));
      showToast('success', 'Reply added.');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  if (loading) {
    return <Loader text="Loading post details..." />;
  }

  return (
    <section className="space-y-4">
      <Link to="/" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
        Back to Home
      </Link>

      <article className="post-card">
        <h1 className="mb-3 text-xl font-bold text-slate-800">Post Details</h1>
        <div className="mb-2 flex items-center gap-2">
          <img src={post?.user?.photo} alt={post?.user?.name || 'User'} className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold text-slate-800">{post?.user?.name || 'Unknown user'}</p>
            <p className="text-xs text-slate-500">
              @{post?.user?.username || 'user'} - {post?.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
            </p>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-slate-700">{post?.body || post?.content || 'Post details not available.'}</p>
        {post?.image ? (
          <img src={post.image} alt="Post" className="mt-4 max-h-80 w-full rounded-lg object-cover" />
        ) : null}
        {post?.sharedPost ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-800">{post?.sharedPost?.user?.name || 'Original post'}</p>
            <p className="mt-1 text-sm text-slate-700">{post?.sharedPost?.body || post?.sharedPost?.content || ''}</p>
          </div>
        ) : null}
      </article>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Comments</h2>

        <form className="mb-4 space-y-3" onSubmit={handleAddComment}>
          <textarea
            className="input min-h-24"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
          />
          <button className="btn-primary px-4 py-2 text-sm disabled:opacity-50" disabled={submittingComment}>
            {submittingComment ? 'Adding...' : 'Add Comment'}
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment?._id || comment?.id} className="space-y-2">
                <CommentItem
                  comment={comment}
                  postId={postId}
                  currentUserId={currentUserId}
                  onDelete={setDeletingCommentId}
                  onUpdate={handleUpdateComment}
                  onLike={handleToggleCommentLike}
                />

                <div className="pl-2">
                  <button
                    className="btn-secondary px-3 py-1.5 text-xs"
                    onClick={() => toggleRepliesPanel(comment?._id || comment?.id)}
                  >
                    {openReplies[comment?._id || comment?.id] ? 'Hide Replies' : 'Show Replies'}
                  </button>

                  {openReplies[comment?._id || comment?.id] ? (
                    <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="space-y-2">
                        {(repliesByComment[comment?._id || comment?.id] || []).map((reply) => (
                          <div key={reply?._id || reply?.id} className="rounded-md border border-slate-200 bg-white p-2">
                            <p className="text-xs text-slate-500">
                              {reply?.replyCreator?.name || reply?.user?.name || 'User'}
                            </p>
                            <p className="text-sm text-slate-700">{reply?.content || reply?.body || 'No text'}</p>
                          </div>
                        ))}
                        {(repliesByComment[comment?._id || comment?.id] || []).length === 0 ? (
                          <p className="text-xs text-slate-500">No replies yet.</p>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          className="input"
                          value={newReplyByComment[comment?._id || comment?.id] || ''}
                          onChange={(event) =>
                            setNewReplyByComment((prev) => ({
                              ...prev,
                              [comment?._id || comment?.id]: event.target.value,
                            }))
                          }
                          placeholder="Write a reply..."
                        />
                        <button
                          className="btn-primary px-3 py-2 text-xs"
                          onClick={() => addReply(comment?._id || comment?.id)}
                        >
                          Add Reply
                        </button>
                        <Link
                          className="btn-secondary px-3 py-2 text-xs text-center"
                          to={`/posts/${postId}/comments/${comment?._id || comment?.id}/replies`}
                        >
                          Open Replies Page
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deletingCommentId)}
        title="Delete comment"
        message="This comment will be removed."
        confirmText="Delete"
        onCancel={() => setDeletingCommentId('')}
        onConfirm={handleDeleteComment}
      />
    </section>
  );
}

export default PostDetails;
