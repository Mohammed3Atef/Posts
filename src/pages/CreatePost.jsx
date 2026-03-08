import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/postsApi';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

function CreatePost() {
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!body.trim()) {
      showToast('error', 'Post body is required.');
      return;
    }

    setLoading(true);
    try {
      await createPost({ body: body.trim(), image });
      showToast('success', 'Post created successfully.');
      navigate('/');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-white">Create Post</h1>
        <p className="mb-6 text-sm text-slate-400">Share what is on your mind.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="body">
              Post Content
            </label>
            <textarea
              id="body"
              className="min-h-32 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write your post..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="image">
              Optional Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200 outline-none transition file:mr-2 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white hover:file:bg-blue-700"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
            />
          </div>

          <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default CreatePost;
