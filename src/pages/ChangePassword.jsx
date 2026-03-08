import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    rePassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters.');
      return;
    }

    if (formData.newPassword !== formData.rePassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(formData);
      const newToken = result?.token || result?.data?.token;

      if (newToken) {
        await login(newToken);
      }

      showToast('success', 'Password changed successfully.');
      navigate('/profile');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl">
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-white">Change Password</h1>
        <p className="mb-6 text-sm text-slate-400">Use a strong password with at least 6 characters.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="oldPassword">
              Old Password
            </label>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              id="oldPassword"
              type="password"
              value={formData.oldPassword}
              onChange={(event) => setFormData((prev) => ({ ...prev, oldPassword: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="newPassword">
              New Password
            </label>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(event) => setFormData((prev) => ({ ...prev, newPassword: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="rePassword">
              Confirm New Password
            </label>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              id="rePassword"
              type="password"
              value={formData.rePassword}
              onChange={(event) => setFormData((prev) => ({ ...prev, rePassword: event.target.value }))}
            />
          </div>

          <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ChangePassword;
