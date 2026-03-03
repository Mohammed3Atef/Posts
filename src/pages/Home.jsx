import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import PostCard from "../components/PostCard";
import { getSuggestions } from "../api/authApi";
import {
  deletePost,
  getAllPosts,
  getPostsFeed,
  sharePost,
  toggleBookmark,
  togglePostLike,
} from "../api/postsApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage, getUserId } from "../utils/errorMessage";

const extractPosts = (result) => {
  const posts = result?.data?.posts || result?.posts || result?.data || [];
  return Array.isArray(posts) ? posts : [];
};

function Home() {
  const fallbackAvatar =
    "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasNext, setHasNext] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedOnly, setFeedOnly] = useState("");
  const [deletePostId, setDeletePostId] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const currentUserId = getUserId(user);

  const loadPosts = async (selectedPage = 1, onlyValue = feedOnly) => {
    setLoading(true);
    try {
      let result;
      try {
        result = await getPostsFeed({
          page: selectedPage,
          limit,
          only: onlyValue,
        });
      } catch (error) {
        // Fallback if feed endpoint shape differs: fetch all posts.
        result = await getAllPosts();
      }

      const nextPosts = extractPosts(result);
      const numberOfPages = result?.meta?.pagination?.numberOfPages || 1;
      const currentPage = result?.meta?.pagination?.currentPage || selectedPage;

      setPosts(nextPosts);
      setPage(currentPage);
      setTotalPages(numberOfPages);
      setHasNext(currentPage < numberOfPages);
    } catch (error) {
      showToast("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestionsPreview = async () => {
    try {
      const result = await getSuggestions({ page: 1, limit: 5 });
      const list =
        result?.data?.suggestions || result?.suggestions || result?.data || [];
      setSuggestions(Array.isArray(list) ? list : []);
    } catch (error) {
      // Do not block feed rendering if suggestions fail.
      setSuggestions([]);
    }
  };

  useEffect(() => {
    loadPosts(1);
    loadSuggestionsPreview();
  }, []);

  const handleDeleteConfirmed = async () => {
    if (!deletePostId) return;
    try {
      await deletePost(deletePostId);
      showToast("success", "Post deleted successfully.");
      setDeletePostId("");
      loadPosts(page, feedOnly);
    } catch (error) {
      showToast("error", getErrorMessage(error));
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      await togglePostLike(postId);
      showToast("success", "Like status updated.");
      loadPosts(page, feedOnly);
    } catch (error) {
      showToast("error", getErrorMessage(error));
    }
  };

  const handleToggleBookmark = async (postId) => {
    try {
      await toggleBookmark(postId);
      showToast("success", "Bookmark status updated.");
      loadPosts(page, feedOnly);
    } catch (error) {
      showToast("error", getErrorMessage(error));
    }
  };

  const handleSharePost = async (postId) => {
    try {
      await sharePost(postId, "Shared from my feed");
      showToast("success", "Post shared successfully.");
      loadPosts(page, feedOnly);
    } catch (error) {
      showToast("error", getErrorMessage(error));
    }
  };

  if (loading) {
    return <Loader text="Loading feed..." />;
  }

  return (
    <section className="space-y-4">
      <div className="feed-layout">
        <aside className="panel-card sticky-panel hidden xl:block">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Feed Sections
          </h2>
          <div className="space-y-2">
            <button
              className={`side-nav-item ${feedOnly === "" ? "active" : ""}`}
              onClick={() => {
                setFeedOnly("");
                loadPosts(1, "");
              }}
            >
              Feed
            </button>
            <button
              className={`side-nav-item ${feedOnly === "me" ? "active" : ""}`}
              onClick={() => {
                setFeedOnly("me");
                loadPosts(1, "me");
              }}
            >
              My Posts
            </button>
            <button
              className={`side-nav-item ${feedOnly === "following" ? "active" : ""}`}
              onClick={() => {
                setFeedOnly("following");
                loadPosts(1, "following");
              }}
            >
              Community
            </button>
            <button
              className={`side-nav-item ${feedOnly === "bookmarks" ? "active" : ""}`}
              onClick={() => {
                setFeedOnly("bookmarks");
                loadPosts(1, "bookmarks");
              }}
            >
              Saved
            </button>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="panel-card">
            <div className="mb-3 flex items-center gap-3">
              <img
                src={user?.photo || fallbackAvatar}
                alt="User"
                className="h-10 w-10 rounded-full border border-slate-200 object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500">
                  @{user?.username || "username"}
                </p>
              </div>
            </div>
            <textarea
              className="input min-h-24"
              placeholder={`What's on your mind, ${user?.name || "friend"}?`}
              readOnly
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Photo/video</span>
                <span>Feeling/activity</span>
              </div>
              <button
                className="btn-primary px-4 py-2 text-sm"
                onClick={() => navigate("/posts/new")}
              >
                Post
              </button>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="card text-center">
              <p className="text-slate-600">No posts found yet.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post?._id || post?.id}
                post={post}
                currentUserId={currentUserId}
                onDelete={setDeletePostId}
                onLike={handleToggleLike}
                onBookmark={handleToggleBookmark}
                onShare={handleSharePost}
              />
            ))
          )}

          {posts.length > 0 ? (
            <Pagination
              page={page}
              onPageChange={loadPosts}
              hasNext={hasNext}
              canGoBack={page > 1}
            />
          ) : null}
          {posts.length > 0 ? (
            <p className="text-center text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
          ) : null}
        </div>

        <aside className="panel-card sticky-panel hidden lg:block">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Suggested Friends
            </h2>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              {suggestions.length}
            </span>
          </div>
          <div className="space-y-3">
            {suggestions.map((item) => {
              const suggestionId = item?._id || item?.id;
              return (
                <div
                  key={suggestionId}
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50"
                  onClick={() =>
                    suggestionId && navigate(`/users/${suggestionId}/profile`)
                  }
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={item?.photo || fallbackAvatar}
                      alt={item?.name || "User"}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {item?.name || "User"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        @{item?.username || "route-user"}
                      </p>
                    </div>
                    <button
                      className="btn-secondary px-2 py-1 text-xs"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Follow
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {item?.followersCount || 0} followers
                  </p>
                </div>
              );
            })}
            {suggestions.length === 0 ? (
              <p className="text-xs text-slate-500">
                No suggestions right now.
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(deletePostId)}
        title="Delete post"
        message="This post will be removed permanently."
        confirmText="Delete"
        onCancel={() => setDeletePostId("")}
        onConfirm={handleDeleteConfirmed}
      />
    </section>
  );
}

export default Home;
