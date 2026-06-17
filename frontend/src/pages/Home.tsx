import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowRightLeft,
  ArrowRight,
  Building2,
  Sprout,
  Beef,
  Car,
  Pickaxe,
  Factory,
  Sparkles,
  ListPlus,
  Handshake,
  Brain,
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useCategories, useMatches, useAssets } from '../hooks/queries';
import { AssetCard } from '../components/assets/AssetCard';
import { MatchScoreBadge } from '../components/ui/MatchScoreBadge';
import { formatKzt, categoryName } from '../utils/helpers';
import type { CategorySlug } from '../types';

const CATEGORY_ICONS: Record<CategorySlug, typeof Building2> = {
  'real-estate': Building2,
  'land-agro': Sprout,
  livestock: Beef,
  'auto-equipment': Car,
  'mining-metals': Pickaxe,
  'business-industry': Factory,
};

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';

// Reveals an element on first scroll into view. Honors reduced motion via CSS.
function useReveal<T extends HTMLElement>() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [visible, setVisible] = useState(false);

  // Callback ref so observation is (re)attached whenever the underlying
  // element mounts. Elements gated behind async data (e.g. the Featured grid)
  // mount AFTER the initial render, so a plain ref + mount-only effect would
  // never observe them — leaving the content stuck at opacity:0 until a
  // remount. A callback ref fires on every attach, fixing that race.
  const ref = (node: T | null) => {
    observerRef.current?.disconnect();
    if (!node || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    observerRef.current = observer;
  };

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return { ref, className: `reveal ${visible ? 'reveal-visible' : ''}` };
}

function Hero() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: categories } = useCategories();
  const { data: assetData } = useAssets({ sort: 'newest', page_size: 1 });

  const totalAssets = assetData?.total ?? 0;
  const categoryCount = categories?.length ?? 5;

  const stats = [
    { value: totalAssets > 0 ? `${totalAssets}+` : '—', label: t('home.statAssets') },
    { value: `${categoryCount}`, label: t('home.statCategories') },
    { value: '93%', label: t('home.statMatchAccuracy') },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-surface to-beige-100">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: message */}
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-600 ring-1 ring-inset ring-gold-600/20">
              <Sparkles className="w-4 h-4" />
              {t('home.heroEyebrow')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-beige-900 max-w-lg">
              {t('home.heroTitle')}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-beige-600">
              {t('home.heroDescription')}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/assets"
                className="group inline-flex items-center gap-2 rounded-xl bg-gold-500 px-8 py-4 font-medium text-white shadow-sm transition-all hover:shadow-lg active:scale-[0.98]"
              >
                {t('nav.browseAssets')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/assets/new"
                  className="inline-flex items-center rounded-xl border-2 border-beige-400 px-8 py-4 font-medium text-beige-900 transition-all hover:bg-surface-container active:scale-[0.98]"
                >
                  {t('nav.publishAsset')}
                </Link>
              ) : (
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center rounded-xl border-2 border-beige-400 px-8 py-4 font-medium text-beige-900 transition-all hover:bg-surface-container active:scale-[0.98]"
                >
                  {t('home.heroSecondaryCta')}
                </Link>
              )}
            </div>

            <dl className="grid max-w-lg grid-cols-3 gap-8 border-t border-beige-400 pt-12">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-3xl font-semibold text-gold-600">{s.value}</dt>
                  <dd className="mt-1 text-sm text-beige-600">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: visual asset */}
          <div className="relative">
            <div className="group relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={HERO_IMAGE}
                alt=""
                className="aspect-[1.5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              {/* AI overlay sheen */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-gold-600/20 to-transparent" />
            </div>

            {/* Floating badge: AI match probability */}
            <div className="absolute -top-6 -right-4 sm:-right-6 flex items-center gap-3 rounded-2xl border border-gold-600/10 bg-white/85 p-4 shadow-xl backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-200 text-gold-800">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-beige-600">
                  {t('home.heroBadgeMatchLabel')}
                </div>
                <div className="text-lg font-semibold text-gold-600">
                  {t('home.heroBadgeMatchValue')}
                </div>
              </div>
            </div>

            {/* Floating badge: suggested exchange */}
            <div className="absolute -bottom-8 -left-4 sm:-left-8 max-w-[220px] space-y-3 rounded-2xl border border-gold-600/10 bg-white/85 p-5 shadow-xl backdrop-blur-sm">
              <div className="flex gap-2">
                <Building2 className="h-5 w-5 text-gold-600" />
                <ArrowRightLeft className="h-5 w-5 text-beige-400" />
                <Sprout className="h-5 w-5 text-gold-600" />
              </div>
              <p className="text-xs font-semibold leading-tight text-beige-600">
                {t('home.heroSuggestedExchange')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const { t } = useTranslation();
  const { data: categories } = useCategories();
  const reveal = useReveal<HTMLDivElement>();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-beige-900">
          {t('home.browseByCategory')}
        </h2>
        <p className="mt-2 text-beige-500">{t('home.categorySubtitle')}</p>
      </div>
      <div ref={reveal.ref} className={`${reveal.className} mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`}>
        {(categories ?? []).map((cat) => {
          const Icon = CATEGORY_ICONS[cat.slug] ?? Building2;
          return (
            <Link
              key={cat.id}
              to={`/assets?category=${cat.slug}`}
              className="group rounded-xl border border-beige-200 bg-white p-5 transition-all hover:-tranbeige-y-0.5 hover:border-gold-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-50 transition-colors group-hover:bg-gold-100">
                <Icon className="h-6 w-6 text-gold-600" />
              </div>
              <h3 className="mt-3 font-semibold text-beige-900">{categoryName(cat.slug)}</h3>
              <p className="text-sm text-beige-500">
                {t('home.listings', { count: cat.asset_count })}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const STEP_ICONS = [ListPlus, Sparkles, Handshake] as const;

function HowItWorks() {
  const { t } = useTranslation();
  const reveal = useReveal<HTMLDivElement>();

  const steps = [
    { title: t('home.step1Title'), body: t('home.step1Body') },
    { title: t('home.step2Title'), body: t('home.step2Body') },
    { title: t('home.step3Title'), body: t('home.step3Body') },
  ];

  return (
    <section className="bg-beige-50 border-y border-beige-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-beige-900">
            {t('home.howTitle')}
          </h2>
          <p className="mt-2 text-beige-500">{t('home.howSubtitle')}</p>
        </div>

        <div ref={reveal.ref} className={`${reveal.className} mt-12 grid gap-8 md:grid-cols-3`}>
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-600 text-white shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-sm font-semibold text-gold-600">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-beige-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-beige-600">{step.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Featured() {
  const { t } = useTranslation();
  const { data, isLoading } = useAssets({ sort: 'newest', page_size: 6 });
  const assets = data?.items ?? [];
  const reveal = useReveal<HTMLDivElement>();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-beige-900">
            {t('home.featuredTitle')}
          </h2>
          <p className="mt-2 text-beige-500">{t('home.featuredSubtitle')}</p>
        </div>
        <Link
          to="/assets"
          className="hidden sm:inline-flex items-center gap-1 font-medium text-gold-600 transition-colors hover:text-gold-700"
        >
          {t('home.viewAll')}
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-beige-200 bg-white"
            >
              <div className="h-48 animate-pulse bg-beige-100" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-beige-100" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-beige-100" />
                <div className="h-5 w-1/2 animate-pulse rounded bg-beige-100" />
              </div>
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-beige-300 bg-beige-50 p-12 text-center">
          <p className="text-beige-500">{t('home.featuredSubtitle')}</p>
        </div>
      ) : (
        <div ref={reveal.ref} className={`${reveal.className} mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </section>
  );
}

function MatchShowcase() {
  const { t } = useTranslation();
  const { data: matches } = useMatches(70);
  const top = (matches ?? []).slice(0, 3);
  const reveal = useReveal<HTMLDivElement>();

  const featured = top[0];
  const rest = top.slice(1);

  return (
    <section className="bg-beige-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-gold-400">
            <Sparkles className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {t('home.aiMatchingTitle')}
            </h2>
          </div>
          <p className="mt-2 text-beige-400">{t('home.aiMatchingDescription')}</p>
        </div>

        {/* Asymmetric panel: one large featured match + supporting list */}
        <div ref={reveal.ref} className={`${reveal.className} mt-12 grid gap-6 lg:grid-cols-12`}>
          <div className="lg:col-span-7">
            {featured ? (
              <MatchPanelLarge match={featured} />
            ) : (
              <PlaceholderMatchLarge />
            )}
          </div>
          <div className="grid gap-6 lg:col-span-5">
            {rest.length > 0
              ? rest.map((m) => <MatchPanelSmall key={m.id} match={m} />)
              : [
                  { label: 'House', toLabel: 'Commercial', score: 84 },
                  { label: 'Land', toLabel: 'Apartment', score: 81 },
                ].map((p) => (
                  <PlaceholderMatchSmall key={p.label} {...p} />
                ))}
          </div>
        </div>

        <div className="mt-10">
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 font-semibold text-white transition-all hover:bg-gold-400 active:scale-[0.98]"
          >
            {t('home.exploreAIMatches')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function MatchPanelLarge({ match }: { match: import('../types').AIMatch }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
      <MatchScoreBadge score={match.match_score} size="lg" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <AssetMini asset={match.asset_a} />
        <AssetMini asset={match.asset_b} />
      </div>
      {match.explanation && (
        <p className="mt-5 text-sm leading-relaxed text-beige-400 line-clamp-3">
          {match.explanation}
        </p>
      )}
    </div>
  );
}

function AssetMini({ asset }: { asset: import('../types').Asset }) {
  return (
    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-inset ring-white/10">
      <p className="text-xs font-medium uppercase tracking-wide text-gold-400">
        {categoryName(asset.category.slug)}
      </p>
      <p className="mt-1 line-clamp-1 font-semibold text-white">{asset.title}</p>
      <p className="mt-2 text-sm font-bold text-gold-300">
        {formatKzt(asset.estimated_value)}
      </p>
    </div>
  );
}

function MatchPanelSmall({ match }: { match: import('../types').AIMatch }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <MatchScoreBadge score={match.match_score} size="sm" />
        <ArrowRightLeft className="h-4 w-4 shrink-0 text-gold-400" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-sm font-medium text-beige-300">
        <span className="line-clamp-1">{categoryName(match.asset_a.category.slug)}</span>
        <span className="line-clamp-1 text-right">{categoryName(match.asset_b.category.slug)}</span>
      </div>
    </div>
  );
}

function PlaceholderMatchLarge() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
      <MatchScoreBadge score={87} size="lg" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white/5 p-4 ring-1 ring-inset ring-white/10">
          <p className="text-xs font-medium uppercase tracking-wide text-gold-400">
            {t('categories.real-estate')}
          </p>
          <p className="mt-1 font-semibold text-white">Almaty, Esentai</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4 ring-1 ring-inset ring-white/10">
          <p className="text-xs font-medium uppercase tracking-wide text-gold-400">
            {t('categories.land-agro')}
          </p>
          <p className="mt-1 font-semibold text-white">Talgar + Vehicle</p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderMatchSmall({
  label,
  toLabel,
  score,
}: {
  label: string;
  toLabel: string;
  score: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <MatchScoreBadge score={score} size="sm" />
        <ArrowRightLeft className="h-4 w-4 shrink-0 text-gold-400" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-sm font-medium text-beige-300">
        <span>{label}</span>
        <span className="text-right">{toLabel}</span>
      </div>
    </div>
  );
}

function CallToAction() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuth = useUIStore((s) => s.openAuth);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gold-600 to-gold-700 px-6 py-12 sm:px-12 sm:py-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t('home.ctaTitle')}
            </h2>
            <p className="mt-2 text-gold-50/90">{t('home.ctaBody')}</p>
          </div>
          {isAuthenticated ? (
            <Link
              to="/assets/new"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-gold-700 transition-all hover:bg-gold-50 active:scale-[0.98]"
            >
              {t('nav.publishAsset')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={() => openAuth('register')}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-gold-700 transition-all hover:bg-gold-50 active:scale-[0.98]"
            >
              {t('nav.publishAsset')}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <HowItWorks />
      <Featured />
      <MatchShowcase />
      <CallToAction />
    </>
  );
}
