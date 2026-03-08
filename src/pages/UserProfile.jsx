import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { getUserPostsById, getUserProfileById, toggleFollowUser } from '../api/authApi';
import { toggleBookmark, togglePostLike } from '../api/postsApi';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getUserId } from '../utils/errorMessage';

function UserProfile() {
  const fallbackAvatar =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';
  const { userId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const currentUserId = getUserId(user);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const [profileResult, postsResult] = await Promise.all([
        getUserProfileById(userId),
        getUserPostsById(userId, { page: 1, limit: 20 }),
      ]);

      const data = profileResult?.data?.user || profileResult?.data || null;
      setUserProfile(data);
      setIsFollowing(
        Boolean(
          profileResult?.data?.isFollowing ??
            profileResult?.isFollowing ??
            profileResult?.data?.user?.isFollowing ??
            data?.isFollowing
        )
      );

      const posts = postsResult?.data?.posts || postsResult?.posts || postsResult?.data || [];
      setUserPosts(Array.isArray(posts) ? posts : []);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const handleLike = async (postId) => {
    try {
      await togglePostLike(postId);
      showToast('success', 'Like status updated.');
      await loadUserProfile();
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const handleBookmark = async (postId) => {
    try {
      await toggleBookmark(postId);
      showToast('success', 'Bookmark status updated.');
      await loadUserProfile();
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  if (loading) return <Loader text="Loading user profile..." />;

  if (!userProfile) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
        <p className="text-sm text-slate-300">User profile not found.</p>
      </div>
    );
  }

  const formattedBirthDate = userProfile?.dateOfBirth
    ? new Date(userProfile.dateOfBirth).toLocaleDateString()
    : '-';
  const viewedUserId = userProfile?._id || userProfile?.id;
  const canFollow = Boolean(currentUserId && viewedUserId && currentUserId !== viewedUserId);

  const handleFollowToggle = async () => {
    if (!viewedUserId) return;
    setFollowLoading(true);
    try {
      await toggleFollowUser(viewedUserId);
      setIsFollowing((prev) => !prev);
      showToast('success', 'Follow status updated.');
      await loadUserProfile();
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-sm">
        <div
          className="h-32 bg-cover bg-center"
          style={{
            backgroundImage: userProfile?.cover
              ? `url(${userProfile.cover})`
              : 'linear-gradient(to right, #0f172a, #3b82f6)',
          }}
        />
        <div className="relative px-4 pb-4">
          <div className="relative -mt-12 flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <img
                src={userProfile?.photo || fallbackAvatar}
                alt={userProfile?.name || 'User'}
                className="h-20 w-20 rounded-full border-4 border-slate-800 object-cover shadow-sm"
                onError={(event) => {
                  event.currentTarget.src = fallbackAvatar;
                }}
              />
              <div>
                <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">{userProfile?.name || '-'}</h1>
                <p className="mt-1 text-lg text-slate-400 sm:text-2xl">@{userProfile?.username || 'user'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                    Route Posts member
                  </span>
                  {canFollow ? (
                    <button
                      className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                    >
                      {followLoading ? 'Saving...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 md:w-auto">
              <div className="rounded-lg border border-slate-700 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-400">Followers</p>
                <p className="text-xl font-bold text-white">{userProfile?.followersCount || 0}</p>
              </div>
              <div className="rounded-lg border border-slate-700 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-400">Following</p>
                <p className="text-xl font-bold text-white">{userProfile?.followingCount || 0}</p>
              </div>
              <div className="rounded-lg border border-slate-700 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-400">Bookmarks</p>
                <p className="text-xl font-bold text-white">{userProfile?.bookmarksCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h2 className="mb-2 text-sm font-semibold text-white">About</h2>
            <div className="space-y-1 text-sm text-slate-300">
              <p>{userProfile?.email || '-'}</p>
              <p>
                {userProfile?.gender || '-'} - {formattedBirthDate}
              </p>
              <p>Active on Route Posts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Posts</h2>
        {userPosts.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-300">No public posts found for this user yet.</p>
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post?._id || post?.id}
              post={post}
              currentUserId={currentUserId}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onUpdate={loadUserProfile}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default UserProfile;
