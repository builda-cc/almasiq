import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';
import { ShieldCheck, ArrowRightLeft, Users } from 'lucide-react';

export function AdminLayout() {
  const { t } = useTranslation();

  const items = [
    {
      to: '/admin',
      label: t('admin.approvalCenter'),
      icon: ArrowRightLeft,
      end: true,
    },
    {
      to: '/admin/users',
      label: t('admin.userInfo'),
      icon: Users,
      end: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 bg-gold-gradient rounded-lg flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-beige-900">{t('admin.panel')}</h1>
      </div>

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
