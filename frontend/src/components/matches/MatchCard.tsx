import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRightLeft } from 'lucide-react';
import type { AIMatch } from '../../types';
import { formatKzt } from '../../utils/helpers';
import { MatchScoreBadge } from '../ui/MatchScoreBadge';

interface MatchCardProps {
  match: AIMatch;
  // Highlight which side belongs to the current user (asset id).
  myAssetIds?: number[];
}

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';

function MiniAsset({ asset, mine, t }: { asset: AIMatch['asset_a']; mine: boolean; t: (key: string) => string }) {
  return (
    <Link to={`/assets/${asset.id}`} className="flex-1 min-w-0 group">
      <div className="relative h-24 rounded-lg overflow-hidden bg-slate-100">
        <img
          src={asset.images[0]?.url ?? PLACEHOLDER}
          alt={asset.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {mine && (
          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-semibold rounded-full">
            {t('matches.yours')}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm font-medium text-slate-900 line-clamp-1">
        {asset.title}
      </p>
      <p className="text-xs text-slate-500">{asset.category.name}</p>
      <p className="text-sm font-semibold text-emerald-600">
        {formatKzt(asset.estimated_value)}
      </p>
    </Link>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="mt-0.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function MatchCard({ match, myAssetIds = [] }: MatchCardProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <MatchScoreBadge score={match.match_score} />
        <span className="text-xs text-slate-500">
          {t('matches.valueDiff', { amount: formatKzt(match.value_difference) })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <MiniAsset asset={match.asset_a} mine={myAssetIds.includes(match.asset_a.id)} t={t} />
        <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
          <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
        </div>
        <MiniAsset asset={match.asset_b} mine={myAssetIds.includes(match.asset_b.id)} t={t} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <ScoreBar label={t('matches.valueWeight')} value={match.value_score} />
        <ScoreBar label={t('matches.preferenceWeight')} value={match.preference_score} />
        <ScoreBar label={t('matches.locationWeight')} value={match.location_score} />
        <ScoreBar label={t('matches.liquidityWeight')} value={match.liquidity_score} />
      </div>

      {match.explanation && (
        <p className="mt-3 text-xs text-slate-500">{match.explanation}</p>
      )}
    </div>
  );
}
