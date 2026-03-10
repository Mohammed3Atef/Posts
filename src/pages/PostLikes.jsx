import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import { getPostLikes } from "../api/postsApi";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errorMessage";

function PostLikes() {
  const { postId } = useParams();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadLikes = async (selectedPage = 1) => {
    setLoading(true);
    try {
      const result = await getPostLikes(postId, { page: selectedPage, limit });
      const list = result?.data?.likes || result?.likes || result?.data || [];
      const nextUsers = Array.isArray(list) ? list : [];
      setUsers(nextUsers);
      const numberOfPages = result?.meta?.pagination?.numberOfPages || 1;
      const currentPage = result?.meta?.pagination?.currentPage || selectedPage;
      setHasNext(currentPage < numberOfPages);
      setPage(currentPage);
    } catch (error) {
      showToast("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLikes(1);
  }, [postId]);

  if (loading) return <Loader text="Loading likes..." />;

  return (
    <section className="space-y-4">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-800 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h1 className="text-xl font-bold text-white">People who reacted</h1>
          <Link
            className="text-sm font-medium text-slate-400 hover:text-blue-400"
            to={`/posts/${postId}`}
          >
            Close
          </Link>
        </div>

        {users.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-300">No likes yet.</div>
        ) : (
          <div className="divide-y divide-slate-700">
            {users.map((user) => (
              <article key={user?._id || user?.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt={user?.name || "User"}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-700 text-slate-300">
                      {user?.name?.[0] || "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">
                      {user?.name || "Unknown user"}
                    </p>
                    <p className="text-sm text-slate-400">
                      @{user?.username || "route-user"}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {users.length > 0 ? (
        <Pagination
          page={page}
          onPageChange={loadLikes}
          hasNext={hasNext}
          canGoBack={page > 1}
        />
      ) : null}
    </section>
  );
}

export default PostLikes;
