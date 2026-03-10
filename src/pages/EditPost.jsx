import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { updatePost } from "../api/postsApi";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/errorMessage";

function EditPost() {
  const { postId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const post = useMemo(() => state?.post || null, [state]);

  const [body, setBody] = useState(post?.body || "");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!body.trim()) {
      showToast("error", "Post body is required.");
      return;
    }

    setLoading(true);
    try {
      await updatePost(postId, { body: body.trim(), image });
      showToast("success", "Post updated successfully.");
      navigate("/");
    } catch (error) {
      showToast("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-white">Edit Post</h1>
        {!post ? (
          <p className="mb-4 rounded-lg border border-amber-700 bg-amber-900/40 p-3 text-sm text-amber-200">
            Post preview was not passed from Home page. You can still submit new
            text to update the post.
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-slate-200"
              htmlFor="body"
            >
              Post Content
            </label>
            <textarea
              id="body"
              className="min-h-32 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Update your post..."
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-slate-200"
              htmlFor="image"
            >
              Optional New Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200 outline-none transition file:mr-2 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white hover:file:bg-blue-700"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Post"}
            </button>
            <Link
              className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
              to="/"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default EditPost;
