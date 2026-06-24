import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRightLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { NotificationBell } from '../ui/NotificationBell';

export function Header() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openAuth = useUIStore((s) => s.openAuth);
  const isAdmin = user?.role === 'admin';

  const publicNav = [
    { label: t('nav.browseAssets'), to: '/assets' },
    { label: t('nav.aiMatching'), to: '/matches' },
    { label: t('nav.howItWorks'), to: '/how-it-works' },
  ];

  const authedNav = [
    { label: t('nav.dashboard'), to: '/dashboard' },
    { label: t('nav.browse'), to: '/assets' },
    { label: t('nav.aiMatches'), to: '/dashboard/matches' },
    { label: t('nav.exchanges'), to: '/dashboard/exchanges' },
    { label: t('nav.favorites'), to: '/dashboard/favorites' },
  ];

  const navItems = isAuthenticated
    ? isAdmin
      ? [...authedNav, { label: t('nav.admin'), to: '/admin' }]
      : authedNav
    : publicNav;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gold-50 text-gold-700'
        : 'text-beige-600 hover:bg-beige-50 hover:text-beige-900'
    }`;

  return (
    <header className="bg-white border-b border-beige-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center shadow-sm">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-beige-900">{t('common.appName')}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link
                  to="/assets/new"
                  className="px-4 py-2 bg-gold-gradient hover:bg-gold-gradient-hover text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {t('nav.publishAsset')}
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="px-4 py-2 text-beige-600 hover:text-beige-900 text-sm font-medium"
                >
                  {t('nav.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-beige-600 hover:text-beige-900 text-sm font-medium"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuth('login')}
                  className="px-4 py-2 text-beige-600 hover:text-beige-900 text-sm font-medium"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="px-4 py-2 bg-gold-gradient hover:bg-gold-gradient-hover text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {t('nav.register')}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-beige-600"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-beige-200">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-beige-600 hover:bg-beige-50"
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/assets/new"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 bg-gold-gradient text-white text-sm font-semibold rounded-lg"
                >
                  {t('nav.publishAsset')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-beige-600 text-sm font-medium"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    openAuth('login');
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-beige-600 text-sm font-medium"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => {
                    openAuth('register');
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 bg-gold-gradient text-white text-sm font-semibold rounded-lg"
                >
                  {t('nav.register')}
                </button>
              </>
            )}
            <div className="pt-2 border-t border-beige-100">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
