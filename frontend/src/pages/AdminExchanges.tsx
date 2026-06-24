import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Clock,
  CheckCircle2,
  Trophy,
  Wallet,
  Timer,
} from 'lucide-react';
import { useAdminKpis, useAdminExchanges } from '../hooks/queries';
import { formatKzt, formatDate, getStatusColor } from '../utils/helpers';
import { MatchScoreBadge } from '../components/ui/MatchScoreBadge';
import type { ExchangeStatus } from '../types';

const STATUS_FILTERS: (ExchangeStatus | 'all')[] = [
  'all',
  'pending',
  'under_review',
  'approved',
  'completed',
  'rejected',
];

export function AdminExchanges() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ExchangeStatus | 'all'>('all');
  const { data: kpis } = useAdminKpis();
  const { data: rows, isLoading } = useAdminExchanges(
    filter === 'all' ? undefined : filter,
  );

  const cards = [
    {
      label: t('admin.kpiTotal'),
      value: kpis?.total_requests ?? 0,
      icon: Inbox,
    },
    {
      label: t('admin.kpiPending'),
      value: (kpis?.pending_approvals ?? 0) + (kpis?.under_review ?? 0),
      icon: Clock,
    },
    {
      label: t('admin.kpiApproved'),
      value: kpis?.approved ?? 0,
      icon: CheckCircle2,
    },
    {
      label: t('admin.kpiCompleted'),
      value: kpis?.completed ?? 0,
      icon: Trophy,
    },
    {
      label: t('admin.kpiValue'),
      value: formatKzt(kpis?.total_value_exchanged ?? 0),
      icon: Wallet,
    },
    {
      label: t('admin.kpiAvgTime'),
      value:
        kpis?.average_approval_hours != null
          ? t('admin.hours', { count: kpis.average_approval_hours })
          : '—',
      icon: Timer,
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-beige-900">
        {t('admin.approvalCenter')}
      </h2>
      <p className="mt-1 text-sm text-beige-500">{t('admin.approvalSubtitle')}</p>

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

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === value
                ? 'bg-gold-600 text-white'
                : 'bg-white border border-beige-200 text-beige-600 hover:bg-beige-50'
            }`}
          >
            {value === 'all'
              ? t('admin.filterAll')
              : t(`exchanges.status.${value}`)}
          </button>
        ))}
      </div>

      {/* Review table */}
      <div className="mt-4 bg-white border border-beige-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-beige-500">
            {t('common.loading')}
          </div>
        ) : (rows ?? []).length === 0 ? (
          <div className="py-16 text-center text-beige-500">
            {t('admin.noExchanges')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-beige-500 border-b border-beige-100 bg-beige-50/50">
                  <th className="px-4 py-3 font-medium">{t('admin.colId')}</th>
                  <th className="px-4 py-3 font-medium">{t('admin.colDate')}</th>
                  <th className="px-4 py-3 font-medium">
                    {t('admin.colParties')}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t('admin.colAssets')}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t('admin.colValues')}
                  </th>
                  <th className="px-4 py-3 font-medium">{t('admin.colMatch')}</th>
                  <th className="px-4 py-3 font-medium">
                    {t('admin.colStatus')}
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    {t('admin.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-beige-50 hover:bg-beige-50/40"
                  >
                    <td className="px-4 py-3 font-medium text-beige-900">
                      #{row.id}
                    </td>
                    <td className="px-4 py-3 text-beige-500 whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-beige-700">
                      <p className="line-clamp-1">{row.from_user_name}</p>
                      <p className="line-clamp-1 text-beige-400">
                        → {row.to_user_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-beige-700">
                      <p className="line-clamp-1">{row.offered_asset_title}</p>
                      <p className="line-clamp-1 text-beige-400">
                        ⇄ {row.requested_asset_title}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-beige-700 whitespace-nowrap">
                      <p>{formatKzt(row.offered_value)}</p>
                      <p className="text-beige-400">
                        {formatKzt(row.requested_value)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {row.match_score != null ? (
                        <MatchScoreBadge score={row.match_score} size="sm" />
                      ) : (
                        <span className="text-beige-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          row.status,
                        )}`}
                      >
                        {t(`exchanges.status.${row.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/exchanges/${row.id}`}
                        className="text-gold-600 hover:text-gold-700 font-medium"
                      >
                        {t('admin.viewDetails')}
                      </Link>
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
