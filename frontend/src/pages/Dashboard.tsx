import { Link } from 'react-router-dom';
import { Boxes, ArrowRightLeft, CheckCircle, Sparkles, Wallet } from 'lucide-react';
import { useDashboardStats, useMyMatches, useMyAssets } from '../hooks/queries';
import { useAuthStore } from '../store/authStore';
import { formatKzt } from '../utils/helpers';
import { MatchCard } from '../components/matches/MatchCard';

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: stats } = useDashboardStats();
  const { data: matches } = useMyMatches();
  const { data: myAssets } = useMyAssets();
  const myAssetIds = (myAssets ?? []).map((a) => a.id);

  const cards = [
    { label: 'My Assets', value: stats?.total_assets ?? 0, icon: Boxes },
    { label: 'Active Exchanges', value: stats?.active_exchanges ?? 0, icon: ArrowRightLeft },
    { label: 'Completed', value: stats?.completed_exchanges ?? 0, icon: CheckCircle },
    { label: 'AI Matches', value: stats?.ai_matches ?? 0, icon: Sparkles },
  ];

  const topMatches = (matches ?? []).slice(0, 3);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back{user ? `, ${user.full_name.split(' ')[0]}` : ''}
      </h1>
      <p className="mt-1 text-slate-500">Here's your exchange activity.</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <card.icon className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-emerald-600 text-white rounded-xl p-5 flex items-center gap-4">
        <Wallet className="w-8 h-8" />
        <div>
          <p className="text-sm text-emerald-50">Total value listed</p>
          <p className="text-2xl font-bold">
            {formatKzt(stats?.total_value_listed ?? 0)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recommended Exchanges</h2>
        <Link
          to="/dashboard/matches"
          className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
        >
          View all →
        </Link>
      </div>

      {topMatches.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topMatches.map((m) => (
            <MatchCard key={m.id} match={m} myAssetIds={myAssetIds} />
          ))}
        </div>
      ) : (
        <div className="mt-4 bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
          No matches yet. Publish an asset to start finding exchange
          opportunities.
          <Link to="/assets/new" className="block mt-3 text-emerald-600 font-medium">
            Publish your first asset
          </Link>
        </div>
      )}
    </div>
  );
}
