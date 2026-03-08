import { useEffect } from 'react';
import Pagination from './Pagination';

function ReactionsModal({
  open,
  title = 'People who reacted',
  users = [],
  loading = false,
  page = 1,
  hasNext = false,
  onPageChange,
  onClose,
}) {
  useEffect(() => {
    if (!open) return () => {};
    const onEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between border-b border-slate-700 pb-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            className="rounded-lg border border-slate-600 bg-slate-700 px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {loading ? <p className="text-sm text-slate-400">Loading reactions...</p> : null}
          {!loading && users.length === 0 ? <p className="text-sm text-slate-400">No reactions yet.</p> : null}
          {!loading
            ? users.map((user) => (
                <article key={user?._id || user?.id} className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-700 px-3 py-2">
                  <img
                    src={user?.photo || 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'}
                    alt={user?.name || 'User'}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-400">@{user?.username || 'route-user'}</p>
                  </div>
                </article>
              ))
            : null}
        </div>

        {users.length > 0 && onPageChange ? (
          <Pagination page={page} onPageChange={onPageChange} hasNext={hasNext} canGoBack={page > 1} />
        ) : null}
      </div>
    </div>
  );
}

export default ReactionsModal;
