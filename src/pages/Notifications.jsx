import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationsApi';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterMode, setFilterMode] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadNotifications = async (selectedPage = 1) => {
    setLoading(true);
    try {
      const [listResult, countResult] = await Promise.all([
        getNotifications({ page: selectedPage, limit }),
        getUnreadCount(),
      ]);

      const list = listResult?.data?.notifications || listResult?.notifications || listResult?.data || [];
      const nextList = Array.isArray(list) ? list : [];
      setNotifications(nextList);
      setUnreadCount(
        countResult?.data?.unreadCount ||
          countResult?.unreadCount ||
          countResult?.data?.count ||
          countResult?.count ||
          0
      );
      const numberOfPages = listResult?.meta?.pagination?.numberOfPages || 1;
      const currentPage = listResult?.meta?.pagination?.currentPage || selectedPage;
      setHasNext(currentPage < numberOfPages);
      setPage(currentPage);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const markOneAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      showToast('success', 'Notification marked as read.');
      loadNotifications(page);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      showToast('success', 'All notifications marked as read.');
      loadNotifications(page);
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  if (loading) return <Loader text="Loading notifications..." />;
  const filtered = filterMode === 'unread' ? notifications.filter((item) => !item?.isRead) : notifications;

  return (
    <section className="space-y-4">
      <div className="panel-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
            <p className="text-sm text-slate-500">Realtime updates for likes, comments, and shares.</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                className={`pill-filter ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                All
              </button>
              <button
                className={`pill-filter ${filterMode === 'unread' ? 'active' : ''}`}
                onClick={() => setFilterMode('unread')}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>
          <button className="btn-secondary px-3 py-1.5 text-xs" onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-4 rounded-lg border border-slate-200 p-4 text-sm text-slate-600">No notifications yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {filtered.map((item) => (
              <article key={item?._id || item?.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={item?.actor?.photo || item?.recipient?.photo}
                      alt={item?.actor?.name || 'User'}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">{item?.actor?.name || 'Someone'}</span> {item?.type?.replaceAll('_', ' ') || 'updated'} your content
                      </p>
                      <p className="text-xs text-slate-500">{item?.entity?.body || item?.entity?.content || ''}</p>
                      <div className="mt-2 flex items-center gap-3">
                        {!item?.isRead ? (
                          <button
                            className="text-xs font-medium text-indigo-600 hover:underline"
                            onClick={() => markOneAsRead(item?._id || item?.id)}
                          >
                            Mark read
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600">Read</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="whitespace-nowrap text-xs text-slate-500">{new Date(item?.createdAt).toLocaleTimeString()}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <Pagination page={page} onPageChange={loadNotifications} hasNext={hasNext} canGoBack={page > 1} />
      ) : null}
    </section>
  );
}

export default Notifications;
