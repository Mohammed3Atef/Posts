import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { getProfileData, uploadProfilePhoto } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

function Profile() {
  const fallbackAvatar =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(!user);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const profileUser = user?.user || user;

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
  }, [profileUser, setUser]);

  if (loading) {
    return <Loader text="Loading profile..." />;
  }

  if (!profileUser) {
    return (
      <div className="card">
        <p className="text-slate-600">Profile data is unavailable.</p>
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

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-28 bg-gradient-to-r from-slate-800 to-blue-500" />
        <div className="relative px-4 pb-4">
          <div className="relative -mt-12 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-start md:justify-between">
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
                  className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm"
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
                <h1 className="text-4xl font-bold leading-none text-slate-900">{profileUser?.name || '-'}</h1>
                <p className="mt-1 text-2xl text-slate-500">@{profileUser?.username || 'user'}</p>
                <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Route Posts member
                </span>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 md:w-auto">
              <div className="rounded-lg border border-slate-200 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-500">Followers</p>
                <p className="text-xl font-bold text-slate-800">{profileUser?.followersCount || 0}</p>
              </div>
              <div className="rounded-lg border border-slate-200 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-500">Following</p>
                <p className="text-xl font-bold text-slate-800">{profileUser?.followingCount || 0}</p>
              </div>
              <div className="rounded-lg border border-slate-200 px-4 py-2 text-center">
                <p className="text-[11px] text-slate-500">Bookmarks</p>
                <p className="text-xl font-bold text-slate-800">{profileUser?.bookmarksCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">About</h2>
              <div className="space-y-1 text-sm text-slate-600">
                <p>{profileUser?.email || '-'}</p>
                <p>{profileUser?.gender || '-'} - {formattedBirthDate}</p>
                <p>Active on Route Posts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
