import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import PostCard from "../components/PostCard";
import { getSuggestions, toggleFollowUser } from "../api/authApi";
import {
  createPost,
  deletePost,
  getAllPosts,
  getBookmarkedPosts,
  getPostsFeed,
  toggleBookmark,
  togglePostLike,
} from "../api/postsApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage, getUserId } from "../utils/errorMessage";

function Home() {
  const fallbackAvatar =
    "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasNext, setHasNext] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedOnly, setFeedOnly] = useState("following");
  const [deletePostId, setDeletePostId] = useState("");
  const [followLoadingId, setFollowLoadingId] = useState("");
  const [followingMap, setFollowingMap] = useState({});
  const [composerBody, setComposerBody] = useState("");
  const [composerImage, setComposerImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [feelingModalOpen, setFeelingModalOpen] = useState(false);
  const [feelingText, setFeelingText] = useState("");
  const [feelingEmoji, setFeelingEmoji] = useState("😊");
  const imageInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const currentUserId = getUserId(user);

  const loadPosts = async (selectedPage = 1, onlyValue = feedOnly) => {
    setLoading(true);
    try {
      let result;
      if (onlyValue === "saved") {
        result = await getBookmarkedPosts({
          page: selectedPage,
          limit,
        });
      } else {
        try {
          result = await getPostsFeed({
            page: selectedPage,
            limit,
            only: onlyValue,
          });
        } catch (error) {
          result = await getAllPosts();
        }
      }

      const bookmarkPosts =
        result?.data?.bookmarks ||
        result?.bookmarks ||
        result?.data?.posts ||
        result?.posts ||
        result?.data ||
        [];
      const nextPosts =
        onlyValue === "saved"
          ? (Array.isArray(bookmarkPosts) ? bookmarkPosts : [])
          : (Array.isArray(result?.data?.posts || result?.posts || result?.data || [])
            ? (result?.data?.posts || result?.posts || result?.data || [])
            : []);
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
      const nextSuggestions = Array.isArray(list) ? list : [];
      setSuggestions(nextSuggestions);
      const map = {};
      nextSuggestions.forEach((item) => {
        const id = item?._id || item?.id;
        if (id) {
          map[id] = Boolean(item?.isFollowing);
        }
      });
      setFollowingMap(map);
    } catch (error) {
      setSuggestions([]);
    }
  };

  const handleFollowToggle = async (event, userId) => {
    event.stopPropagation();
    if (!userId) return;
    setFollowLoadingId(userId);
    try {
      await toggleFollowUser(userId);
      setFollowingMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
      showToast("success", "Follow status updated.");
    } catch (error) {
      showToast("error", getErrorMessage(error));
    } finally {
      setFollowLoadingId("");
    }
  };

  useEffect(() => {
    loadPosts(1, "following");
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

  const handleCreatePost = async () => {
    const text = composerBody.trim();
    if (!text && !composerImage) {
      showToast("error", "Write something or choose an image first.");
      return;
    }

    setPosting(true);
    try {
      await createPost({ body: text || " ", image: composerImage });
      setComposerBody("");
      setComposerImage(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      showToast("success", "Post created successfully.");
      await loadPosts(1, feedOnly);
    } catch (error) {
      showToast("error", getErrorMessage(error));
    } finally {
      setPosting(false);
    }
  };

  const appendFeelingToComposer = () => {
    const trimmedFeeling = feelingText.trim();
    const feelingValue = trimmedFeeling
      ? `${feelingEmoji} ${trimmedFeeling}`
      : feelingEmoji;
    setComposerBody((prev) => `${prev}${prev ? " " : ""}${feelingValue}`);
    setFeelingModalOpen(false);
    setFeelingText("");
    setFeelingEmoji("😊");
  };

  if (loading) {
    return <Loader text="Loading feed..." />;
  }

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="sticky top-20 hidden h-fit self-start rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm xl:block">
          <h2 className="mb-3 text-sm font-semibold text-white">
            Feed Sections
          </h2>
          <div className="space-y-2">
            <button
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                feedOnly === "following"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              onClick={() => {
                setFeedOnly("following");
                loadPosts(1, "following");
              }}
            >
              Feed
            </button>
            <button
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                feedOnly === "me"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              onClick={() => {
                setFeedOnly("me");
                loadPosts(1, "me");
              }}
            >
              My Posts
            </button>
            <button
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                feedOnly === "all"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              onClick={() => {
                setFeedOnly("all");
                loadPosts(1, "all");
              }}
            >
              Community
            </button>
            <button
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                feedOnly === "saved"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              onClick={() => {
                setFeedOnly("saved");
                loadPosts(1, "saved");
              }}
            >
              Saved
            </button>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <img
                src={user?.photo || fallbackAvatar}
                alt="User"
                className="h-10 w-10 rounded-full border border-slate-600 object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400">
                  @{user?.username || "username"}
                </p>
              </div>
            </div>
            <textarea
              className="min-h-24 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none"
              placeholder={`What's on your mind, ${user?.name || "friend"}?`}
              value={composerBody}
              onChange={(event) => setComposerBody(event.target.value)}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setComposerImage(event.target.files?.[0] || null)}
            />
            {composerImage ? (
              <p className="mt-2 text-xs text-slate-300">Selected image: {composerImage.name}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 transition hover:bg-slate-700 hover:text-white"
                  onClick={() => imageInputRef.current?.click()}
                >
                  Photo/video
                </button>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 transition hover:bg-slate-700 hover:text-white"
                  onClick={() => setFeelingModalOpen(true)}
                >
                  Feeling/activity
                </button>
              </div>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                onClick={handleCreatePost}
                disabled={posting}
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-center">
              <p className="text-slate-300">No posts found yet.</p>
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
                onUpdate={() => loadPosts(page, feedOnly)}
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
            <p className="text-center text-xs text-slate-400">
              Page {page} of {totalPages}
            </p>
          ) : null}
        </div>

        <aside className="sticky top-20 hidden h-fit self-start rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm lg:block">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Suggested Friends
            </h2>
            <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
              {suggestions.length}
            </span>
          </div>
          <div className="space-y-3">
            {suggestions.map((item) => {
              const suggestionId = item?._id || item?.id;
              return (
                <div
                  key={suggestionId}
                  className="cursor-pointer rounded-lg border border-slate-700 p-2 transition hover:bg-slate-700"
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
                      <p className="truncate text-sm font-medium text-white">
                        {item?.name || "User"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        @{item?.username || "route-user"}
                      </p>
                    </div>
                    <button
                      className="rounded-lg border border-slate-600 bg-slate-700 px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
                      onClick={(event) =>
                        handleFollowToggle(event, item?._id || item?.id)
                      }
                    >
                      {followLoadingId === (item?._id || item?.id)
                        ? "Saving..."
                        : followingMap[item?._id || item?.id]
                        ? "Following"
                        : "Follow"}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {item?.followersCount || 0} followers
                  </p>
                </div>
              );
            })}
            {suggestions.length === 0 ? (
              <p className="text-xs text-slate-400">
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

      {feelingModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 p-4"
          onClick={() => setFeelingModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-white">
              How are you feeling?
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Pick an emoji and write a short feeling.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {["😊", "😄", "😍", "😎", "🥳", "😴", "😢", "🔥"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`rounded-md border px-2 py-1 text-base transition ${
                    feelingEmoji === emoji
                      ? "border-blue-500 bg-blue-600/20"
                      : "border-slate-600 hover:bg-slate-700"
                  }`}
                  onClick={() => setFeelingEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="mt-3 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              placeholder="Type your feeling..."
              value={feelingText}
              onChange={(event) => setFeelingText(event.target.value)}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
                onClick={() => setFeelingModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                onClick={appendFeelingToComposer}
              >
                Add feeling
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Home;
