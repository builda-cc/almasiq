import { useTranslation } from 'react-i18next';
import { Users, BadgeCheck, Package } from 'lucide-react';
import { useAdminUsers } from '../hooks/queries';
import { formatDate } from '../utils/helpers';

export function AdminUsers() {
  const { t } = useTranslation();
  const { data: users, isLoading } = useAdminUsers();

  const rows = users ?? [];
  const verifiedCount = rows.filter(
    (user) => user.verification_status !== 'unverified',
  ).length;
  const totalAssets = rows.reduce((sum, user) => sum + user.asset_count, 0);

  const cards = [
    {
      label: t('admin.kpiTotalUsers'),
      value: rows.length,
      icon: Users,
    },
    {
      label: t('admin.kpiVerifiedUsers'),
      value: verifiedCount,
      icon: BadgeCheck,
    },
    {
      label: t('admin.kpiTotalAssets'),
      value: totalAssets,
      icon: Package,
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-beige-900">
        {t('admin.userInfo')}
      </h2>
      <p className="mt-1 text-sm text-beige-500">{t('admin.usersSubtitle')}</p>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-beige-200 rounded-xl p-5"
          >
            <div className="w-10 h-10 bg-gold-50 rounded-lg flex items-center justify-center">
              <card.icon className="w-5 h-5 text-gold-600" />
            </div>
            <p className="mt-3 text-xl font-bold text-beige-900">{card.value}</p>
            <p className="text-sm text-beige-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="mt-8 bg-white border border-beige-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-beige-500">
            {t('common.loading')}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-beige-500">
            {t('admin.noUsers')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-beige-500 border-b border-beige-100 bg-beige-50/50">
                  <th className="px-4 py-3 font-medium">{t('admin.colUser')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.colEmail')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.colPhone')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.colCity')}</th>
                  <th className="px-4 py-3 font-medium">
                    {t('admin.colVerification')}
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    {t('admin.colAssetCount')}
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    {t('admin.colExchangeCount')}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t('admin.colRegistered')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-beige-50 hover:bg-beige-50/40"
                  >
                    <td className="px-4 py-3 font-medium text-beige-900">
                      {user.full_name}
                    </td>
                    <td className="px-4 py-3 text-beige-700">{user.email}</td>
                    <td className="px-4 py-3 text-beige-700 whitespace-nowrap">
                      {user.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-beige-700">
                      {user.city ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {user.verification_status !== 'unverified' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-50 text-gold-700 text-[11px] font-medium rounded-full">
                          <BadgeCheck className="w-3 h-3" />
                          {t(`admin.verify.${user.verification_status}`)}
                        </span>
                      ) : (
                        <span className="text-beige-400">
                          {t('admin.verify.unverified')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-beige-700">
                      {user.asset_count}
                    </td>
                    <td className="px-4 py-3 text-right text-beige-700">
                      {user.exchange_request_count}
                    </td>
                    <td className="px-4 py-3 text-beige-500 whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
