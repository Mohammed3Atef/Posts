import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { getSuggestions, toggleFollowUser } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

function Suggestions() {
  const [users, setUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [followLoadingId, setFollowLoadingId] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadSuggestions = async (selectedPage = 1) => {
    setLoading(true);
    try {
      const result = await getSuggestions({ page: selectedPage, limit });
      const list = result?.data?.suggestions || result?.suggestions || result?.data || [];
      const nextUsers = Array.isArray(list) ? list : [];
      setUsers(nextUsers);
      const map = {};
      nextUsers.forEach((item) => {
        const id = item?._id || item?.id;
        if (id) {
          map[id] = Boolean(item?.isFollowing);
        }
      });
      setFollowingMap(map);
      const numberOfPages = result?.meta?.pagination?.numberOfPages || 1;
      const currentPage = result?.meta?.pagination?.currentPage || selectedPage;
      setHasNext(currentPage < numberOfPages);
      setPage(currentPage);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions(1);
  }, []);

  const handleFollowToggle = async (userId) => {
    if (!userId) return;
    setFollowLoadingId(userId);
    try {
      await toggleFollowUser(userId);
      setFollowingMap((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }));
      showToast('success', 'Follow status updated.');
      await loadSuggestions(page);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setFollowLoadingId('');
    }
  };

  if (loading) return <Loader text="Loading suggestions..." />;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Suggested Friends</h1>
      {users.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">No suggestions available right now.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((item) => (
            <div key={item?._id || item?.id} className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                {item?.photo ? (
                  <img src={item.photo} alt={item?.name || 'User'} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-slate-300">
                    {item?.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{item?.name || 'Unknown user'}</p>
                  <p className="text-sm text-slate-400">@{item?.username || 'route-user'}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">{item?.followersCount || 0} followers</p>
                <button
                  className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
                  onClick={() => handleFollowToggle(item?._id || item?.id)}
                  disabled={followLoadingId === (item?._id || item?.id)}
                >
                  {followLoadingId === (item?._id || item?.id)
                    ? 'Saving...'
                    : followingMap[item?._id || item?.id]
                      ? 'Following'
                      : 'Follow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {users.length > 0 ? (
        <Pagination page={page} onPageChange={loadSuggestions} hasNext={hasNext} canGoBack={page > 1} />
      ) : null}
    </section>
  );
}

export default Suggestions;
