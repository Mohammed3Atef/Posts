import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { updatePost } from '../api/postsApi';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

function EditPost() {
  const { postId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const post = useMemo(() => state?.post || null, [state]);

  const [body, setBody] = useState(post?.body || '');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!body.trim()) {
      showToast('error', 'Post body is required.');
      return;
    }

    setLoading(true);
    try {
      await updatePost(postId, { body: body.trim(), image });
      showToast('success', 'Post updated successfully.');
      navigate('/');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <div className="card">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Edit Post</h1>
        {!post ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            Post preview was not passed from Home page. You can still submit new text to update the post.
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="body">
              Post Content
            </label>
            <textarea
              id="body"
              className="input min-h-32"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Update your post..."
            />
          </div>

          <div>
            <label className="label" htmlFor="image">
              Optional New Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="input cursor-pointer"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-2">
            <button className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50" disabled={loading}>
              {loading ? 'Updating...' : 'Update Post'}
            </button>
            <Link className="btn-secondary px-4 py-2.5 text-sm" to="/">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default EditPost;
