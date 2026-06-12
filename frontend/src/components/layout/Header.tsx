import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRightLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const publicNav = [
  { label: 'Browse Assets', to: '/assets' },
  { label: 'AI Matching', to: '/matches' },
  { label: 'How It Works', to: '/how-it-works' },
];

const authedNav = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Browse', to: '/assets' },
  { label: 'AI Matches', to: '/dashboard/matches' },
  { label: 'Exchanges', to: '/dashboard/exchanges' },
  { label: 'Favorites', to: '/dashboard/favorites' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const openAuth = useUIStore((s) => s.openAuth);

  const navItems = isAuthenticated ? authedNav : publicNav;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-50 text-emerald-700'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-slate-900">QG Exchange</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/assets/new"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Publish Asset
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuth('login')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/assets/new"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg"
                >
                  Publish Asset
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-slate-600 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    openAuth('login');
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-600 text-sm font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    openAuth('register');
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
