import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { createReply, getCommentReplies } from '../api/postsApi';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

function Replies() {
  const { postId, commentId } = useParams();
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const loadReplies = async (selectedPage = 1) => {
    setLoading(true);
    try {
      const result = await getCommentReplies(postId, commentId, { page: selectedPage, limit });
      const list = result?.data?.replies || result?.replies || result?.data || [];
      const nextReplies = Array.isArray(list) ? list : [];
      setReplies(nextReplies);
      setHasNext(nextReplies.length === limit);
      setPage(selectedPage);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReplies(1);
  }, [postId, commentId]);

  const addReply = async (event) => {
    event.preventDefault();

    if (!newReply.trim()) {
      showToast('error', 'Reply text is required.');
      return;
    }

    setSubmitting(true);
    try {
      await createReply(postId, commentId, { content: newReply.trim() });
      setNewReply('');
      showToast('success', 'Reply created successfully.');
      loadReplies(page);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading replies..." />;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Replies</h1>
        <Link className="btn-secondary px-3 py-2 text-sm" to={`/posts/${postId}`}>
          Back to Post
        </Link>
      </div>

      <form className="card space-y-3" onSubmit={addReply}>
        <label className="label" htmlFor="replyBody">
          Add Reply
        </label>
        <textarea
          id="replyBody"
          className="input min-h-24"
          value={newReply}
          onChange={(event) => setNewReply(event.target.value)}
          placeholder="Write your reply..."
        />
        <button className="btn-primary w-fit px-4 py-2 text-sm disabled:opacity-50" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Reply'}
        </button>
      </form>

      {replies.length === 0 ? (
        <div className="card text-sm text-slate-600">No replies for this comment yet.</div>
      ) : (
        <div className="space-y-3">
          {replies.map((reply) => (
            <article key={reply?._id || reply?.id} className="card">
              <p className="text-xs text-slate-500">{reply?.replyCreator?.name || reply?.user?.name || 'User'}</p>
              <p className="mt-1 text-sm text-slate-700">{reply?.content || reply?.body || 'No text'}</p>
              <p className="mt-2 text-xs text-slate-500">{new Date(reply?.createdAt).toLocaleString()}</p>
            </article>
          ))}
        </div>
      )}

      {replies.length > 0 ? (
        <Pagination page={page} onPageChange={loadReplies} hasNext={hasNext} canGoBack={page > 1} />
      ) : null}
    </section>
  );
}

export default Replies;
