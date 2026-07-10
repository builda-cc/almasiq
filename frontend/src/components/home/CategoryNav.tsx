import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Building2,
  Sprout,
  Beef,
  Car,
  Pickaxe,
  Factory,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCategories } from '../../hooks/queries';
import { categoryName } from '../../utils/helpers';
import type { CategorySlug } from '../../types';

const CATEGORY_ICONS: Record<CategorySlug, typeof Building2> = {
  'real-estate': Building2,
  'land-agro': Sprout,
  livestock: Beef,
  'auto-equipment': Car,
  'mining-metals': Pickaxe,
  'business-industry': Factory,
};

export function CategoryNav() {
  const { t } = useTranslation();
  const { data: categories } = useCategories();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 240;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-white border-b border-beige-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-beige-600 uppercase tracking-wider shrink-0">
            {t('home.browseByCategory')}
          </h2>

          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg hover:bg-beige-100 text-beige-500 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg hover:bg-beige-100 text-beige-500 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="mt-3 grid grid-cols-2 gap-3 sm:flex sm:overflow-x-auto sm:scrollbar-hide pb-1 -mx-1 px-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {(categories ?? []).map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Building2;
            return (
              <Link
                key={cat.id}
                to={`/assets?category=${cat.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-beige-200 bg-white px-4 py-3 transition-all hover:border-gold-300 hover:bg-gold-50 hover:shadow-sm sm:whitespace-nowrap"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-beige-100 transition-colors group-hover:bg-gold-100">
                  <Icon className="h-5 w-5 text-beige-600 group-hover:text-gold-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-beige-900">
                    {categoryName(cat.slug)}
                  </p>
                  <p className="text-xs text-beige-500">
                    {t('home.listings', { count: cat.asset_count })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
