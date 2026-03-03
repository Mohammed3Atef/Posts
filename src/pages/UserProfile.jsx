import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { getUserPostsById, getUserProfileById } from '../api/authApi';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getUserId } from '../utils/errorMessage';

const extractPosts = (result) => {
  const posts = result?.data?.posts || result?.posts || result?.data || [];
  return Array.isArray(posts) ? posts : [];
};

function UserProfile() {
  const fallbackAvatar =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';
  const { userId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
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

      const posts = extractPosts(postsResult);
      setUserPosts(posts);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  if (loading) return <Loader text="Loading user profile..." />;

  if (!userProfile) {
    return (
      <div className="card">
        <p className="text-sm text-slate-600">User profile not found.</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div
          className="h-28 bg-cover bg-center"
          style={{
            backgroundImage: userProfile?.cover
              ? `url(${userProfile.cover})`
              : 'linear-gradient(to right, #0f172a, #3b82f6)',
          }}
        />
        <div className="relative px-4 pb-4">
          <div className="relative -mt-12 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <img
                src={userProfile?.photo || fallbackAvatar}
                alt={userProfile?.name || 'User'}
                className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm"
              />
              <div>
                <h1 className="text-4xl font-bold leading-none text-slate-900">
                  {userProfile?.name || '-'}
                </h1>
                <p className="mt-1 text-2xl text-slate-500">
                  @{userProfile?.username || 'user'}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Route Posts member
                </span>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 md:w-auto">
              <div className="rounded-lg border border-slate-200 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-500">Followers</p>
                <p className="text-xl font-bold text-slate-800">
                  {userProfile?.followersCount || 0}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-500">Following</p>
                <p className="text-xl font-bold text-slate-800">
                  {userProfile?.followingCount || 0}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-500">Bookmarks</p>
                <p className="text-xl font-bold text-slate-800">
                  {userProfile?.bookmarksCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">About</h2>
            <div className="space-y-1 text-sm text-slate-600">
              <p>{userProfile?.email || '-'}</p>
              <p>
                {userProfile?.gender || '-'} - {userProfile?.dateOfBirth || '-'}
              </p>
              <p>Active on Route Posts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Posts</h2>
        {userPosts.length === 0 ? (
          <div className="card">
            <p className="text-sm text-slate-600">No public posts found for this user yet.</p>
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post?._id || post?.id}
              post={post}
              currentUserId={currentUserId}
              onLike={() => {}}
              onBookmark={() => {}}
              onShare={() => {}}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default UserProfile;
