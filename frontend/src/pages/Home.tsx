import { Link } from 'react-router-dom';
import {
  ArrowRightLeft,
  Building2,
  Home as HomeIcon,
  Map,
  Car,
  Store,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useCategories, useMatches, useAssets } from '../hooks/queries';
import { AssetCard } from '../components/assets/AssetCard';
import { MatchScoreBadge } from '../components/ui/MatchScoreBadge';
import type { CategorySlug } from '../types';

const CATEGORY_ICONS: Record<CategorySlug, typeof Building2> = {
  apartments: Building2,
  houses: HomeIcon,
  land: Map,
  vehicles: Car,
  commercial: Store,
};

function Hero() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuth = useUIStore((s) => s.openAuth);

  return (
    <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-3xl">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Exchange Assets Without Selling
          </h1>
          <p className="mt-5 text-lg text-emerald-50">
            Find apartments, houses, land, vehicles, and commercial properties
            available for exchange. Let AI discover the best opportunities for
            you across Kazakhstan and Central Asia.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/assets"
              className="px-6 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Browse Assets
            </Link>
            <button
              onClick={() => (isAuthenticated ? undefined : openAuth('register'))}
              className="px-6 py-3 bg-emerald-500/30 border border-white/40 text-white font-semibold rounded-lg hover:bg-emerald-500/50 transition-colors"
            >
              {isAuthenticated ? (
                <Link to="/assets/new">Publish Asset</Link>
              ) : (
                'Publish Asset'
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const { data: categories } = useCategories();
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl font-bold text-slate-900">Browse by Category</h2>
      <p className="mt-1 text-slate-500">Five asset categories, one exchange platform.</p>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {(categories ?? []).map((cat) => {
          const Icon = CATEGORY_ICONS[cat.slug] ?? Building2;
          return (
            <Link
              key={cat.id}
              to={`/assets?category=${cat.slug}`}
              className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <Icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{cat.name}</h3>
              <p className="text-sm text-slate-500">{cat.asset_count} listings</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Featured() {
  const { data } = useAssets({ sort: 'newest', page_size: 6 });
  const assets = data?.items ?? [];
  if (assets.length === 0) return null;
  return (
    <section className="bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Opportunities</h2>
            <p className="mt-1 text-slate-500">Recently published assets ready for exchange.</p>
          </div>
          <Link to="/assets" className="text-emerald-600 font-medium hover:text-emerald-700">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MatchShowcase() {
  const { data: matches } = useMatches(70);
  const top = (matches ?? []).slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-slate-900">AI Matching in Action</h2>
      </div>
      <p className="mt-1 text-slate-500">
        Our engine scores every possible exchange on value, preference,
        location, and liquidity.
      </p>

      {top.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {top.map((m) => (
            <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <MatchScoreBadge score={m.match_score} size="lg" />
              <div className="mt-4 flex items-center justify-between text-sm font-medium text-slate-700">
                <span className="line-clamp-1">{m.asset_a.category.name}</span>
                <ArrowRightLeft className="w-4 h-4 text-emerald-600 mx-2 shrink-0" />
                <span className="line-clamp-1 text-right">{m.asset_b.category.name}</span>
              </div>
              {m.explanation && (
                <p className="mt-3 text-xs text-slate-500 line-clamp-3">{m.explanation}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            'Apartment → Land + Vehicle',
            'House → Commercial Property',
            'Land → Apartment',
          ].map((label) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-5">
              <span className="inline-flex items-center gap-1 rounded-full font-semibold bg-emerald-100 text-emerald-700 text-sm px-2.5 py-1">
                <Sparkles className="w-4 h-4" /> 87 match
              </span>
              <p className="mt-4 text-sm font-medium text-slate-700">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link
          to="/matches"
          className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors inline-block"
        >
          Explore AI Matches
        </Link>
      </div>
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Featured />
      <MatchShowcase />
    </>
  );
}
