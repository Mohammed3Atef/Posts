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
      <div className="card">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Change Password</h1>
        <p className="mb-6 text-sm text-slate-500">Use a strong password with at least 6 characters.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="oldPassword">
              Old Password
            </label>
            <input
              className="input"
              id="oldPassword"
              type="password"
              value={formData.oldPassword}
              onChange={(event) => setFormData((prev) => ({ ...prev, oldPassword: event.target.value }))}
            />
          </div>

          <div>
            <label className="label" htmlFor="newPassword">
              New Password
            </label>
            <input
              className="input"
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(event) => setFormData((prev) => ({ ...prev, newPassword: event.target.value }))}
            />
          </div>

          <div>
            <label className="label" htmlFor="rePassword">
              Confirm New Password
            </label>
            <input
              className="input"
              id="rePassword"
              type="password"
              value={formData.rePassword}
              onChange={(event) => setFormData((prev) => ({ ...prev, rePassword: event.target.value }))}
            />
          </div>

          <button className="btn-primary w-full py-2.5 text-sm disabled:opacity-50" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ChangePassword;
