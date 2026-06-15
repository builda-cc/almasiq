import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, RefreshCw } from 'lucide-react';
import {
  useMatches,
  useMyMatches,
  useMyAssets,
  useRecomputeMatches,
} from '../hooks/queries';
import { useAuthStore } from '../store/authStore';
import { MatchCard } from '../components/matches/MatchCard';

interface AIMatchesProps {
  scope: 'all' | 'mine';
}

export function AIMatches({ scope }: AIMatchesProps) {
  const { t } = useTranslation();
  const [minScore, setMinScore] = useState(0);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const recompute = useRecomputeMatches();

  const allMatches = useMatches(minScore);
  const myMatches = useMyMatches();
  const { data: myAssets } = useMyAssets();
  const myAssetIds = (myAssets ?? []).map((a) => a.id);

  const isMine = scope === 'mine';
  const query = isMine ? myMatches : allMatches;
  const matches = (query.data ?? []).filter((m) => m.match_score >= minScore);

  return (
    <div className={isMine ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold-600" />
            <h1 className="text-2xl font-bold text-beige-900">
              {isMine ? t('matches.yourMatches') : t('matches.aiMatching')}
            </h1>
          </div>
          <p className="mt-1 text-beige-500">
            {t('matches.description')}
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => recompute.mutate()}
            disabled={recompute.isPending}
            className="px-4 py-2 border border-beige-300 rounded-lg text-sm font-medium text-beige-700 hover:bg-beige-50 flex items-center gap-1.5"
          >
            <RefreshCw
              className={`w-4 h-4 ${recompute.isPending ? 'animate-spin' : ''}`}
            />
            {t('matches.recompute')}
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm text-beige-600">{t('matches.minScore', { score: minScore })}</label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="flex-1 max-w-xs accent-gold-600"
        />
      </div>

      {query.isLoading ? (
        <div className="py-16 text-center text-beige-500">{t('matches.computing')}</div>
      ) : matches.length === 0 ? (
        <div className="mt-6 bg-white border border-dashed border-beige-300 rounded-xl p-8 text-center text-beige-500">
          {t('matches.noMatches')}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} myAssetIds={myAssetIds} />
          ))}
        </div>
      )}
    </div>
  );
}
