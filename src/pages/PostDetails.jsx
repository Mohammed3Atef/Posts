import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import PostCard from '../components/PostCard';
import { deletePost, getPostDetails, toggleBookmark, togglePostLike } from '../api/postsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getUserId } from '../utils/errorMessage';

function PostDetails() {
  const { postId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const currentUserId = getUserId(user);
  const [post, setPost] = useState(state?.post || null);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState('');

  const loadPost = async () => {
    setLoading(true);
    try {
      const result = await getPostDetails(postId);
      setPost(result?.data || result?.post || state?.post || null);
    } catch (error) {
      setPost(state?.post || null);
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  const handlePostLike = async (targetPostId) => {
    try {
      await togglePostLike(targetPostId);
      showToast('success', 'Like status updated.');
      await loadPost();
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const handlePostBookmark = async (targetPostId) => {
    try {
      await toggleBookmark(targetPostId);
      showToast('success', 'Bookmark status updated.');
      await loadPost();
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const handleDeletePost = async () => {
    if (!deletingPostId) return;
    try {
      await deletePost(deletingPostId);
      showToast('success', 'Post deleted successfully.');
      navigate('/');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setDeletingPostId('');
    }
  };

  if (loading) {
    return <Loader text="Loading post details..." />;
  }

  return (
    <section className="space-y-4">
      <Link to="/" className="inline-block text-sm font-medium text-blue-400 hover:underline">
        Back to Home
      </Link>

      {post ? (
        <PostCard
          post={post}
          currentUserId={currentUserId}
          onDelete={setDeletingPostId}
          onLike={handlePostLike}
          onBookmark={handlePostBookmark}
          onUpdate={loadPost}
        />
      ) : (
        <article className="rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
          <h1 className="text-lg font-semibold text-white">Post details are unavailable.</h1>
        </article>
      )}

      <ConfirmDialog
        open={Boolean(deletingPostId)}
        title="Delete post"
        message="This post will be removed permanently."
        confirmText="Delete"
        onCancel={() => setDeletingPostId('')}
        onConfirm={handleDeletePost}
      />
    </section>
  );
}

export default PostDetails;
