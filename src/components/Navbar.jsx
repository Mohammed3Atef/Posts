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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2">
        <Link to={isAuthenticated ? '/' : '/login'} className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-700 text-xs text-white">RP</span>
          Route Posts
        </Link>

        {isAuthenticated ? (
          <>
            <div className="order-3 w-full sm:order-2 sm:w-auto">
              <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 text-sm">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link nav-pill ${isActive ? 'bg-white text-indigo-700 shadow-sm' : ''}`
                  }
                  to="/"
                >
                  Feed
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `nav-link nav-pill ${isActive ? 'bg-white text-indigo-700 shadow-sm' : ''}`
                  }
                  to="/profile"
                >
                  Profile
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `nav-link nav-pill ${isActive ? 'bg-white text-indigo-700 shadow-sm' : ''}`
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
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <img
                    src={user?.photo}
                    alt={user?.name || 'User'}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-slate-700">{user?.name || 'User'}</span>
                  <span className="text-slate-400">≡</span>
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 z-40 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <NavLink className="user-menu-item" onClick={() => setMenuOpen(false)} to="/profile">
                      Profile
                    </NavLink>
                    <NavLink className="user-menu-item" onClick={() => setMenuOpen(false)} to="/change-password">
                      Settings
                    </NavLink>
                    <div className="my-1 border-t border-slate-200" />
                    <button className="user-menu-item danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link className="nav-link" to="/login">
              Login
            </Link>
            <Link className="btn-primary px-3 py-1.5 text-xs" to="/signup">
              Sign Up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
