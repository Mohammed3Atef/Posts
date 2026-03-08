import { useEffect, useState } from 'react';
import {
  deletePost,
  getBookmarkedPosts,
  getPostsFeed,
  toggleBookmark,
  togglePostLike,
} from '../api/postsApi';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import PostCard from '../components/PostCard';
import { getProfileData, uploadProfilePhoto } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getUserId } from '../utils/errorMessage';

function Profile() {
  const fallbackAvatar =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(!user);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);
  const [postsHasNext, setPostsHasNext] = useState(true);
  const [savedHasNext, setSavedHasNext] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState('');
  const { showToast } = useToast();
  const profileUser = user?.user || user;
  const currentUserId = getUserId(user);
  const postsLimit = 20;

  const loadMyPosts = async (selectedPage = 1) => {
    setPostsLoading(true);
    try {
      const result = await getPostsFeed({ page: selectedPage, limit: postsLimit, only: 'me' });
      const list = result?.data?.posts || result?.posts || result?.data || [];
      const nextPosts = Array.isArray(list) ? list : [];
      const numberOfPages = result?.meta?.pagination?.numberOfPages || 1;
      const currentPage = result?.meta?.pagination?.currentPage || selectedPage;
      setPosts(nextPosts);
      setPostsPage(currentPage);
      setPostsHasNext(currentPage < numberOfPages);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setPostsLoading(false);
    }
  };

  const loadSavedPosts = async (selectedPage = 1) => {
    setSavedLoading(true);
    try {
      const result = await getBookmarkedPosts({ page: selectedPage, limit: postsLimit });
      const list = result?.data?.bookmarks || result?.bookmarks || result?.data?.posts || result?.posts || result?.data || [];
      const nextPosts = Array.isArray(list) ? list : [];
      const numberOfPages = result?.meta?.pagination?.numberOfPages || 1;
      const currentPage = result?.meta?.pagination?.currentPage || selectedPage;
      setSavedPosts(nextPosts);
      setSavedPage(currentPage);
      setSavedHasNext(currentPage < numberOfPages);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (profileUser) return;

      setLoading(true);
      try {
        const result = await getProfileData();
        setUser(result?.data?.user || result?.data || result?.user || null);
      } catch (error) {
        showToast('error', getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileUser, setUser, showToast]);

  useEffect(() => {
    loadMyPosts(1);
    loadSavedPosts(1);
  }, []);

  if (loading) {
    return <Loader text="Loading profile..." />;
  }

  if (!profileUser) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
        <p className="text-slate-300">Profile data is unavailable.</p>
      </div>
    );
  }

  const handlePhotoSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    try {
      await uploadProfilePhoto(selectedFile);
      const profile = await getProfileData();
      setUser(profile?.data?.user || profile?.data || profile?.user || null);
      showToast('success', 'Profile photo updated.');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      event.target.value = '';
      setUploading(false);
    }
  };

  const formattedBirthDate = profileUser?.dateOfBirth
    ? new Date(profileUser.dateOfBirth).toLocaleDateString()
    : '-';

  const handleLike = async (postId) => {
    try {
      await togglePostLike(postId);
      showToast('success', 'Like status updated.');
      if (activeTab === 'saved') {
        await loadSavedPosts(savedPage);
      } else {
        await loadMyPosts(postsPage);
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const handleBookmark = async (postId) => {
    try {
      await toggleBookmark(postId);
      showToast('success', 'Bookmark status updated.');
      await Promise.all([loadMyPosts(postsPage), loadSavedPosts(savedPage)]);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const handleDeletePost = async () => {
    if (!deletingPostId) return;
    try {
      await deletePost(deletingPostId);
      showToast('success', 'Post deleted successfully.');
      setDeletingPostId('');
      await loadMyPosts(postsPage);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-sm">
        <div className="h-32 bg-gradient-to-r from-slate-900 via-blue-700 to-blue-500" />
        <div className="relative px-4 pb-4">
          <div className="relative -mt-12 flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="group relative">
                <input
                  id="photo-overlay-input"
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                />
                <img
                  src={profileUser?.photo || fallbackAvatar}
                  alt="Profile"
                  className="h-20 w-20 rounded-full border-4 border-slate-800 object-cover shadow-sm"
                  onError={(event) => {
                    event.currentTarget.src = fallbackAvatar;
                  }}
                />
                <label
                  htmlFor="photo-overlay-input"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
                  title="Change profile photo"
                >
                  <span className="rounded-full border border-white/70 bg-white/10 px-2 py-0.5 text-xs font-medium">
                    {uploading ? 'Uploading...' : 'Edit'}
                  </span>
                </label>
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">{profileUser?.name || '-'}</h1>
                <p className="mt-1 text-lg text-slate-400 sm:text-2xl">@{profileUser?.username || 'user'}</p>
                <span className="mt-2 inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                  Route Posts member
                </span>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 md:w-auto">
              <div className="rounded-lg border border-slate-700 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-400">Followers</p>
                <p className="text-xl font-bold text-white">{profileUser?.followersCount || 0}</p>
              </div>
              <div className="rounded-lg border border-slate-700 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-400">Following</p>
                <p className="text-xl font-bold text-white">{profileUser?.followingCount || 0}</p>
              </div>
              <div className="rounded-lg border border-slate-700 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-400">Bookmarks</p>
                <p className="text-xl font-bold text-white">{profileUser?.bookmarksCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h2 className="mb-2 text-sm font-semibold text-white">About</h2>
            <div className="space-y-1 text-sm text-slate-300">
              <p>{profileUser?.email || '-'}</p>
              <p>{profileUser?.gender || '-'} - {formattedBirthDate}</p>
              <p>Active on Route Posts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              activeTab === 'posts'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            My Posts
          </button>
          <button
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            onClick={() => setActiveTab('saved')}
          >
            Saved
          </button>
        </div>

        {activeTab === 'posts' ? (
          <>
            {postsLoading ? <Loader text="Loading your posts..." /> : null}
            {!postsLoading && posts.length === 0 ? (
              <p className="text-sm text-slate-300">You have not posted yet.</p>
            ) : null}
            {!postsLoading
              ? posts.map((post) => (
                  <PostCard
                    key={post?._id || post?.id}
                    post={post}
                    currentUserId={currentUserId}
                    onDelete={setDeletingPostId}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onUpdate={() => loadMyPosts(postsPage)}
                  />
                ))
              : null}
            {!postsLoading && posts.length > 0 ? (
              <Pagination
                page={postsPage}
                onPageChange={loadMyPosts}
                hasNext={postsHasNext}
                canGoBack={postsPage > 1}
              />
            ) : null}
          </>
        ) : (
          <>
            {savedLoading ? <Loader text="Loading saved posts..." /> : null}
            {!savedLoading && savedPosts.length === 0 ? (
              <p className="text-sm text-slate-300">You do not have saved posts yet.</p>
            ) : null}
            {!savedLoading
              ? savedPosts.map((post) => (
                  <PostCard
                    key={post?._id || post?.id}
                    post={post}
                    currentUserId={currentUserId}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onUpdate={() => loadSavedPosts(savedPage)}
                  />
                ))
              : null}
            {!savedLoading && savedPosts.length > 0 ? (
              <Pagination
                page={savedPage}
                onPageChange={loadSavedPosts}
                hasNext={savedHasNext}
                canGoBack={savedPage > 1}
              />
            ) : null}
          </>
        )}
      </div>

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

export default Profile;
