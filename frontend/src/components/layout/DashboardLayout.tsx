import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  PlusCircle,
  Sparkles,
  ArrowRightLeft,
  Heart,
  User as UserIcon,
} from 'lucide-react';

export function DashboardLayout() {
  const { t } = useTranslation();

  const items = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/dashboard/assets', label: t('dashboard.myAssetsTitle'), icon: Boxes, end: false },
    { to: '/assets/new', label: t('dashboard.addAsset'), icon: PlusCircle, end: false },
    { to: '/dashboard/matches', label: t('nav.aiMatches'), icon: Sparkles, end: false },
    { to: '/dashboard/exchanges', label: t('exchanges.title'), icon: ArrowRightLeft, end: false },
    { to: '/dashboard/favorites', label: t('nav.favorites'), icon: Heart, end: false },
    { to: '/dashboard/profile', label: t('nav.profile'), icon: UserIcon, end: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <nav className="space-y-1 lg:sticky lg:top-24">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gold-50 text-gold-700'
                      : 'text-beige-600 hover:bg-beige-50 hover:text-beige-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
