import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Boxes, ArrowRightLeft, CheckCircle, Sparkles, Wallet } from 'lucide-react';
import { useDashboardStats, useMyMatches, useMyAssets } from '../hooks/queries';
import { useAuthStore } from '../store/authStore';
import { formatKzt } from '../utils/helpers';
import { MatchCard } from '../components/matches/MatchCard';

export function Dashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useDashboardStats();
  const { data: matches } = useMyMatches();
  const { data: myAssets } = useMyAssets();
  const myAssetIds = (myAssets ?? []).map((a) => a.id);

  const cards = [
    { label: t('dashboard.myAssets'), value: stats?.total_assets ?? 0, icon: Boxes },
    { label: t('dashboard.activeExchanges'), value: stats?.active_exchanges ?? 0, icon: ArrowRightLeft },
    { label: t('dashboard.completed'), value: stats?.completed_exchanges ?? 0, icon: CheckCircle },
    { label: t('dashboard.aiMatches'), value: stats?.ai_matches ?? 0, icon: Sparkles },
  ];

  const topMatches = (matches ?? []).slice(0, 3);

  return (
    <div>
      <h1 className="text-2xl font-bold text-beige-900">
        {t('dashboard.welcomeBack', { name: user ? user.full_name.split(' ')[0] : '' })}
      </h1>
      <p className="mt-1 text-beige-500">{t('dashboard.activitySubtitle')}</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-beige-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-gold-50 rounded-lg flex items-center justify-center">
              <card.icon className="w-5 h-5 text-gold-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-beige-900">{card.value}</p>
            <p className="text-sm text-beige-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-gold-600 text-white rounded-xl p-5 flex items-center gap-4">
        <Wallet className="w-8 h-8" />
        <div>
          <p className="text-sm text-gold-50">{t('dashboard.totalValueListed')}</p>
          <p className="text-2xl font-bold">
            {formatKzt(stats?.total_value_listed ?? 0)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-beige-900">{t('dashboard.recommendedExchanges')}</h2>
        <Link
          to="/dashboard/matches"
          className="text-sm text-gold-600 font-medium hover:text-gold-700"
        >
          {t('dashboard.viewAll')}
        </Link>
      </div>

      {topMatches.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topMatches.map((m) => (
            <MatchCard key={m.id} match={m} myAssetIds={myAssetIds} />
          ))}
        </div>
      ) : (
        <div className="mt-4 bg-white border border-dashed border-beige-300 rounded-xl p-8 text-center text-beige-500">
          {t('dashboard.noMatchesYet')}
          <Link to="/assets/new" className="block mt-3 text-gold-600 font-medium">
            {t('dashboard.publishFirstAsset')}
          </Link>
        </div>
      )}
    </div>
  );
}
