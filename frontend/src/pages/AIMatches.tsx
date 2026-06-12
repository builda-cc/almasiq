import { useState } from 'react';
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
            <Sparkles className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">
              {isMine ? 'Your AI Matches' : 'AI Matching'}
            </h1>
          </div>
          <p className="mt-1 text-slate-500">
            Exchange opportunities scored on value, preference, location, and
            liquidity.
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => recompute.mutate()}
            disabled={recompute.isPending}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RefreshCw
              className={`w-4 h-4 ${recompute.isPending ? 'animate-spin' : ''}`}
            />
            Recompute
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm text-slate-600">Minimum score: {minScore}</label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="flex-1 max-w-xs accent-emerald-600"
        />
      </div>

      {query.isLoading ? (
        <div className="py-16 text-center text-slate-500">Computing matches…</div>
      ) : matches.length === 0 ? (
        <div className="mt-6 bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
          No matches at this score threshold.
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
