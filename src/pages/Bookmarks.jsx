import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import PostCard from '../components/PostCard';
import { getBookmarkedPosts, toggleBookmark, togglePostLike } from '../api/postsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getUserId } from '../utils/errorMessage';

function Bookmarks() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();
  const currentUserId = getUserId(user);

  const loadBookmarks = async (selectedPage = 1) => {
    setLoading(true);
    try {
      const result = await getBookmarkedPosts({ page: selectedPage, limit });
      const list = result?.data?.bookmarks || result?.bookmarks || result?.data?.posts || result?.posts || result?.data || [];
      const nextPosts = Array.isArray(list) ? list : [];
      setPosts(nextPosts);
      const numberOfPages = result?.meta?.pagination?.numberOfPages || 1;
      const currentPage = result?.meta?.pagination?.currentPage || selectedPage;
      setPage(currentPage);
      setHasNext(currentPage < numberOfPages);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks(1);
  }, []);

  const likePost = async (postId) => {
    try {
      await togglePostLike(postId);
      showToast('success', 'Like status updated.');
      loadBookmarks(page);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const bookmarkPost = async (postId) => {
    try {
      await toggleBookmark(postId);
      showToast('success', 'Bookmark status updated.');
      loadBookmarks(page);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  if (loading) return <Loader text="Loading bookmarks..." />;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Bookmarked Posts</h1>
      {posts.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">You do not have bookmarked posts yet.</div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post?._id || post?.id}
            post={post}
            currentUserId={currentUserId}
            onDelete={null}
            onLike={likePost}
            onBookmark={bookmarkPost}
            onUpdate={() => loadBookmarks(page)}
          />
        ))
      )}
      {posts.length > 0 ? (
        <Pagination page={page} onPageChange={loadBookmarks} hasNext={hasNext} canGoBack={page > 1} />
      ) : null}
    </section>
  );
}

export default Bookmarks;
