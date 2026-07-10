import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { useAssets, useMatches } from '../../hooks/queries';
import { formatKzt, categoryName } from '../../utils/helpers';
import type { Asset, AIMatch } from '../../types';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600';

interface ListingsGridProps {
  revealRef: (node: HTMLDivElement | null) => void;
  revealClass: string;
}

export function ListingsGrid({ revealRef, revealClass }: ListingsGridProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useAssets({ sort: 'newest', page_size: 9 });
  const { data: matches } = useMatches(70);
  const assets = data?.items ?? [];
  const topMatches = (matches ?? []).slice(0, 3);

  const matchMap = new Map<number, AIMatch>();
  for (const m of topMatches) {
    matchMap.set(m.asset_a.id, m);
    matchMap.set(m.asset_b.id, m);
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-beige-900">
            {t('home.featuredTitle')}
          </h2>
          <p className="mt-1 text-sm text-beige-500">{t('home.featuredSubtitle')}</p>
        </div>
        <Link
          to="/assets"
          className="inline-flex items-center gap-1 text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
        >
          {t('home.viewAll')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-beige-200 bg-white"
            >
              <div className="h-44 animate-pulse bg-beige-100" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-3/4 animate-pulse rounded bg-beige-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-beige-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-beige-100" />
              </div>
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-beige-300 bg-beige-50 p-12 text-center">
          <p className="text-beige-500">{t('home.featuredSubtitle')}</p>
        </div>
      ) : (
        <div ref={revealRef} className={`${revealClass} mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
          {assets.map((asset) => (
            <KrishaCard
              key={asset.id}
              asset={asset}
              match={matchMap.get(asset.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function KrishaCard({ asset, match }: { asset: Asset; match?: AIMatch }) {
  const { t } = useTranslation();
  const image = asset.images[0]?.url ?? PLACEHOLDER;
  const location = [asset.city, asset.region].filter(Boolean).join(', ');

  return (
    <Link
      to={`/assets/${asset.id}`}
      className="group block bg-white rounded-xl border border-beige-200 overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      <div className="relative h-44 bg-beige-100 overflow-hidden">
        <img
          src={image}
          alt={asset.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-xs font-semibold text-beige-700 rounded-md shadow-sm">
          {categoryName(asset.category.slug)}
        </span>
        {match && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-gold-500/95 backdrop-blur-sm rounded-md shadow-sm">
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-xs font-bold text-white">
              {match.match_score}%
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-beige-900 line-clamp-1 group-hover:text-gold-700 transition-colors">
          {asset.title}
        </h3>
        {location && (
          <p className="mt-1 flex items-center text-xs text-beige-500">
            <MapPin className="w-3 h-3 mr-1 shrink-0" />
            {location}
          </p>
        )}
        <div className="mt-3 flex items-end justify-between">
          <p className="text-lg font-bold text-gold-600">
            {formatKzt(asset.estimated_value)}
          </p>
          {asset.preferences.length > 0 && (
            <p className="text-[11px] text-beige-400 line-clamp-1 max-w-[140px] text-right">
              {t('assets.wants')}{' '}
              {asset.preferences.map((p) => categoryName(p.category_slug)).join(', ')}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
