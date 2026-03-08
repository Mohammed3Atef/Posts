import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2">
        <Link to={isAuthenticated ? '/' : '/login'} className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs text-white">RP</span>
          Route Posts
        </Link>

        {isAuthenticated ? (
          <>
            <div className="order-3 w-full sm:order-2 sm:w-auto">
              <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-slate-700 bg-slate-800 p-1 text-sm">
                <NavLink
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                  to="/"
                >
                  Feed
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                  to="/profile"
                >
                  Profile
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                  to="/notifications"
                >
                  Notifications
                </NavLink>
              </div>
            </div>

            <div className="order-2 sm:order-3" ref={menuRef}>
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-2 py-1.5 transition hover:bg-slate-700"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <img
                    src={user?.photo}
                    alt={user?.name || 'User'}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-slate-200">{user?.name || 'User'}</span>
                  <span className="text-slate-400">≡</span>
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 z-40 mt-2 w-52 rounded-xl border border-slate-700 bg-slate-800 p-2 shadow-lg">
                    <NavLink
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-700"
                      onClick={() => setMenuOpen(false)}
                      to="/profile"
                    >
                      Profile
                    </NavLink>
                    <NavLink
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-700"
                      onClick={() => setMenuOpen(false)}
                      to="/change-password"
                    >
                      Settings
                    </NavLink>
                    <div className="my-1 border-t border-slate-700" />
                    <button
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/10"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link className="rounded-md px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white" to="/login">
              Login
            </Link>
            <Link
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
              to="/signup"
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
