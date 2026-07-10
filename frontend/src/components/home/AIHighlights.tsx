import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowRightLeft, Sparkles } from 'lucide-react';
import { useMatches } from '../../hooks/queries';
import { MatchScoreBadge } from '../ui/MatchScoreBadge';
import { categoryName } from '../../utils/helpers';
import type { AIMatch } from '../../types';

interface AIHighlightsProps {
  revealRef: (node: HTMLDivElement | null) => void;
  revealClass: string;
}

export function AIHighlights({ revealRef, revealClass }: AIHighlightsProps) {
  const { t } = useTranslation();
  const { data: matches } = useMatches(70);
  const top = (matches ?? []).slice(0, 3);

  return (
    <section className="bg-beige-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {t('home.aiMatchingTitle')}
              </h2>
            </div>
            <p className="mt-1 text-sm text-beige-400">
              {t('home.aiMatchingDescription')}
            </p>
          </div>
          <Link
            to="/matches"
            className="inline-flex items-center gap-1 text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors"
          >
            {t('home.exploreAIMatches')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div ref={revealRef} className={`${revealClass} mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
          {top.length > 0
            ? top.map((m) => <MatchCard key={m.id} match={m} />)
            : [
                { score: 87, catA: 'real-estate', catB: 'land-agro', titleA: 'Almaty, Esentai Tower', titleB: 'Talgar Agricultural Land' },
                { score: 84, catA: 'auto-equipment', catB: 'business-industry', titleA: 'Caterpillar Excavator', titleB: 'Mining Processing Plant' },
                { score: 81, catA: 'mining-metals', catB: 'real-estate', titleA: 'Copper Ore Deposit', titleB: 'Commercial Building, Astana' },
              ].map((p, i) => (
                <PlaceholderCard key={i} {...p} />
              ))}
        </div>
      </div>
    </section>
  );
}

function MatchCard({ match }: { match: AIMatch }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-5 hover:bg-white/[0.08] transition-colors">
      <div className="flex items-center justify-between">
        <MatchScoreBadge score={match.match_score} size="sm" />
        <ArrowRightLeft className="h-4 w-4 text-gold-400" />
      </div>
      <div className="mt-4 grid gap-3">
        <div className="rounded-lg bg-white/5 p-3 ring-1 ring-inset ring-white/10">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gold-400">
            {categoryName(match.asset_a.category.slug)}
          </p>
          <p className="mt-1 text-sm font-semibold text-white line-clamp-1">
            {match.asset_a.title}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-3 ring-1 ring-inset ring-white/10">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gold-400">
            {categoryName(match.asset_b.category.slug)}
          </p>
          <p className="mt-1 text-sm font-semibold text-white line-clamp-1">
            {match.asset_b.title}
          </p>
        </div>
      </div>
      {match.explanation && (
        <p className="mt-3 text-xs text-beige-500 line-clamp-2">
          {match.explanation}
        </p>
      )}
    </div>
  );
}

function PlaceholderCard({
  score,
  catA,
  catB,
  titleA,
  titleB,
}: {
  score: number;
  catA: string;
  catB: string;
  titleA: string;
  titleB: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-5">
      <div className="flex items-center justify-between">
        <MatchScoreBadge score={score} size="sm" />
        <ArrowRightLeft className="h-4 w-4 text-gold-400" />
      </div>
      <div className="mt-4 grid gap-3">
        <div className="rounded-lg bg-white/5 p-3 ring-1 ring-inset ring-white/10">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gold-400">
            {t(`categories.${catA}`)}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{titleA}</p>
        </div>
        <div className="rounded-lg bg-white/5 p-3 ring-1 ring-inset ring-white/10">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gold-400">
            {t(`categories.${catB}`)}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{titleB}</p>
        </div>
      </div>
    </div>
  );
}
