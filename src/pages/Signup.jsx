import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

const initialForm = {
  name: '',
  email: '',
  password: '',
  rePassword: '',
  dateOfBirth: '',
  gender: 'male',
};

function Signup() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim()) return 'Name and email are required.';
    if (formData.password.length < 6) return 'Password must be at least 6 characters.';
    if (formData.password !== formData.rePassword) return 'Passwords do not match.';
    if (!formData.dateOfBirth) return 'Date of birth is required.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      showToast('error', validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await signupUser(formData);
      const token = result?.token || result?.data?.token;
      const user = result?.user || result?.data?.user || result?.data;

      if (token) {
        await login(token, user);
        showToast('success', 'Account created successfully.');
        navigate('/');
      } else {
        showToast('info', 'Account created. Please login now.');
        navigate('/login');
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl">
      <div className="card">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Sign Up</h1>
        <p className="mb-6 text-sm text-slate-500">Create your account to start posting.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input className="input" id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="rePassword">
              Confirm Password
            </label>
            <input
              className="input"
              id="rePassword"
              name="rePassword"
              type="password"
              value={formData.rePassword}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="dateOfBirth">
              Date Of Birth
            </label>
            <input
              className="input"
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label" htmlFor="gender">
              Gender
            </label>
            <select className="input" id="gender" name="gender" value={formData.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <button className="btn-primary w-full py-2.5 text-sm disabled:opacity-50" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Signup;
