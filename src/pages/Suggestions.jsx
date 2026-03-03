import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { getSuggestions } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

function Suggestions() {
  const [users, setUsers] = useState([]);
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

  if (loading) return <Loader text="Loading suggestions..." />;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Suggested Friends</h1>
      {users.length === 0 ? (
        <div className="card text-sm text-slate-600">No suggestions available right now.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((item) => (
            <div key={item?._id || item?.id} className="card">
              <div className="flex items-center gap-3">
                {item?.photo ? (
                  <img src={item.photo} alt={item?.name || 'User'} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    {item?.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-800">{item?.name || 'Unknown user'}</p>
                  <p className="text-sm text-slate-500">@{item?.username || 'route-user'}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-500">{item?.followersCount || 0} followers</p>
                <button className="btn-secondary px-3 py-1.5 text-xs">Follow</button>
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
