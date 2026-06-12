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

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/assets', label: 'My Assets', icon: Boxes, end: false },
  { to: '/assets/new', label: 'Add Asset', icon: PlusCircle, end: false },
  { to: '/dashboard/matches', label: 'AI Matches', icon: Sparkles, end: false },
  { to: '/dashboard/exchanges', label: 'Exchange Requests', icon: ArrowRightLeft, end: false },
  { to: '/dashboard/favorites', label: 'Favorites', icon: Heart, end: false },
  { to: '/dashboard/profile', label: 'Profile', icon: UserIcon, end: false },
];

export function DashboardLayout() {
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
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
