import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notificationsApi";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errorMessage";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterMode, setFilterMode] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadNotifications = async (selectedPage = 1, mode = filterMode) => {
    setLoading(true);
    try {
      const unread = mode === "unread" ? true : false;
      const [listResult, countResult] = await Promise.all([
        getNotifications({ unread, page: selectedPage, limit }),
        getUnreadCount(),
      ]);

      const list =
        listResult?.data?.notifications ||
        listResult?.notifications ||
        listResult?.data ||
        [];
      const nextList = Array.isArray(list) ? list : [];
      setNotifications(nextList);
      setUnreadCount(
        countResult?.data?.unreadCount ||
          countResult?.unreadCount ||
          countResult?.data?.count ||
          countResult?.count ||
          0,
      );
      const numberOfPages = listResult?.meta?.pagination?.numberOfPages || 1;
      const currentPage =
        listResult?.meta?.pagination?.currentPage || selectedPage;
      setHasNext(currentPage < numberOfPages);
      setPage(currentPage);
      setFilterMode(mode);
    } catch (error) {
      showToast("error", getErrorMessage(error));
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
      showToast("success", "Notification marked as read.");
      loadNotifications(page, filterMode);
    } catch (error) {
      showToast("error", getErrorMessage(error));
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      showToast("success", "All notifications marked as read.");
      loadNotifications(page, filterMode);
    } catch (error) {
      showToast("error", getErrorMessage(error));
    }
  };

  if (loading) return <Loader text="Loading notifications..." />;
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-slate-400">
              Realtime updates for likes, comments, and shares.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  filterMode === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                onClick={() => loadNotifications(1, "all")}
              >
                All
              </button>
              <button
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  filterMode === "unread"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                onClick={() => loadNotifications(1, "unread")}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>
          <button
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="mt-4 rounded-lg border border-slate-700 p-4 text-sm text-slate-300">
            No notifications yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {notifications.map((item) => (
              <article
                key={item?._id || item?.id}
                className="rounded-xl border border-slate-700 bg-slate-700 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={item?.actor?.photo || item?.recipient?.photo}
                      alt={item?.actor?.name || "User"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm text-slate-100">
                        <span className="font-semibold">
                          {item?.actor?.name || "Someone"}
                        </span>{" "}
                        {item?.type?.replaceAll("_", " ") || "updated"} your
                        content
                      </p>
                      <p className="text-xs text-slate-400">
                        {item?.entity?.body || item?.entity?.content || ""}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        {!item?.isRead ? (
                          <button
                            className="text-xs font-medium text-blue-400 hover:underline"
                            onClick={() => markOneAsRead(item?._id || item?.id)}
                          >
                            Mark read
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-400">Read</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="whitespace-nowrap text-xs text-slate-400">
                    {new Date(item?.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 ? (
        <Pagination
          page={page}
          onPageChange={loadNotifications}
          hasNext={hasNext}
          canGoBack={page > 1}
        />
      ) : null}
    </section>
  );
}

export default Notifications;
