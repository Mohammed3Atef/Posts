import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signinUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      showToast('error', 'Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const result = await signinUser(formData);
      const token = result?.token || result?.data?.token;
      const user = result?.user || result?.data?.user || result?.data;

      if (!token) {
        throw new Error('No token returned from login response.');
      }

      await login(token, user);
      showToast('success', 'Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl">
      <div className="card">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Login</h1>
        <p className="mb-6 text-sm text-slate-500">Enter your credentials to continue.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              className="input"
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              className="input"
              id="password"
              type="password"
              value={formData.password}
              onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
            />
          </div>

          <button className="btn-primary w-full py-2.5 text-sm disabled:opacity-50" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          New here?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
