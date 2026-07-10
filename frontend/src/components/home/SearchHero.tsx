import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCategories, useAssets } from '../../hooks/queries';
import { categoryName } from '../../utils/helpers';

export function SearchHero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: categories } = useCategories();
  const { data: assetData } = useAssets({ sort: 'newest', page_size: 1 });

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const totalAssets = assetData?.total ?? 0;
  const categoryCount = categories?.length ?? 6;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    navigate(`/assets?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=60')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-20 lg:pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            {t('home.heroTitle')}
          </h1>
          <p className="mt-4 text-lg text-gold-100 max-w-2xl mx-auto">
            {t('home.heroDescription')}
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-10 max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-3 bg-white rounded-2xl p-3 shadow-2xl shadow-black/10">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-beige-200">
              <Search className="w-5 h-5 text-beige-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder', 'Search assets...')}
                className="w-full text-sm text-beige-900 placeholder:text-beige-400 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-beige-200 min-w-[180px]">
              <MapPin className="w-5 h-5 text-beige-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm text-beige-700 bg-transparent focus:outline-none cursor-pointer appearance-none"
              >
                <option value="">{t('home.allCategories', 'All Categories')}</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {categoryName(cat.slug)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-gold-600 hover:bg-gold-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shrink-0"
            >
              {t('nav.browseAssets')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-10 flex items-center justify-center gap-8 md:gap-12">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {totalAssets > 0 ? `${totalAssets}+` : '—'}
            </p>
            <p className="text-sm text-gold-200">{t('home.statAssets')}</p>
          </div>
          <div className="w-px h-8 bg-gold-400/30" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{categoryCount}</p>
            <p className="text-sm text-gold-200">{t('home.statCategories')}</p>
          </div>
          <div className="w-px h-8 bg-gold-400/30" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">93%</p>
            <p className="text-sm text-gold-200">{t('home.statMatchAccuracy')}</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/assets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-gold-700 shadow-sm transition-all hover:bg-gold-50 active:scale-[0.98]"
            >
              {t('nav.publishAsset')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
            >
              {t('home.heroSecondaryCta')}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
