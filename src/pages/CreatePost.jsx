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
      <div className="card">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Create Post</h1>
        <p className="mb-6 text-sm text-slate-500">Share what is on your mind.</p>

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
              placeholder="Write your post..."
            />
          </div>

          <div>
            <label className="label" htmlFor="image">
              Optional Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="input cursor-pointer"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
            />
          </div>

          <button className="btn-primary w-full py-2.5 text-sm disabled:opacity-50" disabled={loading}>
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default CreatePost;
